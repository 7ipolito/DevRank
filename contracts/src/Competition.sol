// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Permit2 interface for signature transfers
interface ISignatureTransfer {
    struct TokenPermissions {
        address token;
        uint256 amount;
    }

    struct PermitTransferFrom {
        TokenPermissions permitted;
        uint256 nonce;
        uint256 deadline;
    }

    struct SignatureTransferDetails {
        address to;
        uint256 requestedAmount;
    }

    function permitTransferFrom(
        PermitTransferFrom memory permit,
        SignatureTransferDetails calldata transferDetails,
        address owner,
        bytes calldata signature
    ) external;
}

contract Competition is ReentrancyGuard{
    using SafeERC20 for IERC20;

    /* Errors */
    error Competition__NotOpen();
    error Competition__AlreadyFinished();
    error Competition__NoParticipants();
    error Competition__InvalidWinner();
    error Competition__TransferFailed();
    error Competition__NotActive();

    /* Type declarations */
    enum CompetitionState {
        OPEN,
        CALCULATING,
        FINISHED
    }

    // Permit2 contract address (same on all chains)
    address public constant PERMIT2_ADDRESS = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    
    // Platform fee percentage (30%)
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 30;
    
    // endereço da plataforma (dona do contrato)
    address public immutable platform;
    IERC20 public immutable wldToken;

    struct Match {
        uint256 id;
        string name;
        address[] participants;
        uint256 stake;
        uint256 startTime;
        uint256 durationDays;
        bool active;
        CompetitionState state;
        address winner;
        mapping(address => bool) hasParticipated;
    }

    uint256 public matchCount;
    mapping(uint256 => Match) public matches;

    // ---- Eventos ----
    // @subgraph:entity Match - rastreia estado da competição
    event MatchCreated(
        uint256 indexed matchId,
        string name,
        uint256 durationDays,
        uint256 startTime
    );

    // @subgraph:entity Participation - rastreia participação de jogadores
    // @subgraph:relation Match(matchId) - Player(player)
    event PlayerJoined(
        uint256 indexed matchId,
        address indexed player,
        uint256 stakeAmount
    );

    // @subgraph:update Match.active = false
    event MatchClosed(
        uint256 indexed matchId,
        address winner,
        uint256 reward,
        uint256 platformFee
    );



    constructor() {
        platform = msg.sender;
        wldToken = IERC20(0x2cFc85d8E48F8EAB294be644d9E25C3030863003);
    }

    function createMatch(string memory _name, uint256 _durationDays) external {
        require(_durationDays > 0, "Invalid duration");
        require(bytes(_name).length > 0, "Name cannot be empty");

        matchCount++;
        Match storage m = matches[matchCount];
        m.id = matchCount;
        m.name = _name;
        m.startTime = block.timestamp;
        m.durationDays = _durationDays;
        m.active = true;
        m.state = CompetitionState.OPEN;

        emit MatchCreated(matchCount, _name, _durationDays, block.timestamp);
    }


      /**
     * @dev Join a challenge by staking WLD tokens (traditional method)
     */
    // function joinChallenge(uint256 _challengeId) external nonReentrant {
    //     Match storage challenge = matches[_challengeId];
        
    //     require(challenge.active, "Challenge is not active");

    //     require(!challenge.hasParticipated[msg.sender], "Already joined this challenge");
        
    //     // Transfer WLD tokens from user to contract
    //     wldToken.safeTransferFrom(msg.sender, address(this), challenge.stake);
        
    //     // Add user to challenge
    //     challenge.participants[msg.sender] = true;
    //     challenge.participantList.push(msg.sender);
    //     challenge.participantCount++;
    //     challenge.totalPool += challenge.entryFee;
        
    //     // Track user's challenges
    //     challenge.participants.push(msg.sender);
        
    //     emit PlayerJoined(_challengeId, msg.sender);
    // }

     /**
     * @dev Join a challenge using Permit2 signature transfer
     */
    function joinChallenge(
        uint256 _challengeId,
        uint256 _stake
    ) external nonReentrant {
        Match storage challenge = matches[_challengeId];
        
        // Verificar estado primeiro (mais específico)
        if (challenge.state != CompetitionState.OPEN) {
            revert Competition__NotOpen();
        }
        if (!challenge.active) {
            revert Competition__NotActive();
        }
        require(!challenge.hasParticipated[msg.sender], "Already joined this challenge");
        
        challenge.stake += _stake;
        challenge.hasParticipated[msg.sender] = true;
        
        challenge.participants.push(msg.sender);
        
        emit PlayerJoined(_challengeId, msg.sender, _stake);
    }

     function joinChallengeWithPermit2(
        uint256 _challengeId,
        ISignatureTransfer.PermitTransferFrom calldata permit,
        ISignatureTransfer.SignatureTransferDetails calldata transferDetails,
        bytes calldata signature
    ) external nonReentrant {
        Match storage challenge = matches[_challengeId];
        
        // Verificar estado primeiro (mais específico)
        if (challenge.state != CompetitionState.OPEN) {
            revert Competition__NotOpen();
        }
        if (!challenge.active) {
            revert Competition__NotActive();
        }
        require(!challenge.hasParticipated[msg.sender], "Already joined this challenge");
        require(permit.permitted.token == address(wldToken), "Invalid token");
        require(transferDetails.to == address(this), "Invalid transfer recipient");
        
        // Use Permit2 to transfer tokens
        ISignatureTransfer(PERMIT2_ADDRESS).permitTransferFrom(
            permit,
            transferDetails,
            msg.sender,
            signature
        );
        challenge.stake += transferDetails.requestedAmount;
        challenge.hasParticipated[msg.sender] = true;
        
        challenge.participants.push(msg.sender);
        
        emit PlayerJoined(_challengeId, msg.sender, transferDetails.requestedAmount);
    }

    /**
     * @dev Verificar se um usuário já participou de uma competição
     * @param _matchId ID da competição
     * @param _user Endereço do usuário
     */
    function isParticipant(uint256 _matchId, address _user) external view returns (bool) {
        require(_matchId > 0 && _matchId <= matchCount, "Invalid match ID");
        return matches[_matchId].hasParticipated[_user];
    }

    /**
     * @dev Obter a lista de participantes de um match
     * @param _matchId ID do match
     */
    function getParticipants(uint256 _matchId) external view returns (address[] memory) {
        require(_matchId > 0 && _matchId <= matchCount, "Invalid match ID");
        return matches[_matchId].participants;
    }

    /**
     * @dev Obter o número de participantes de um match
     * @param _matchId ID do match
     */
    function getParticipantCount(uint256 _matchId) external view returns (uint256) {
        require(_matchId > 0 && _matchId <= matchCount, "Invalid match ID");
        return matches[_matchId].participants.length;
    }

    /**
     * @dev Finalizar competição e distribuir prêmios
     * @param _matchId ID da competição
     * @param _winner Endereço do vencedor
     */
    function finalizeCompetition(uint256 _matchId, address _winner) external nonReentrant {
        require(_matchId > 0 && _matchId <= matchCount, "Invalid match ID");
        Match storage competition = matches[_matchId];
        
        // Verificações (ordem importa - mais específico primeiro)
        if (competition.state == CompetitionState.FINISHED) {
            revert Competition__AlreadyFinished();
        }
        if (!competition.active) {
            revert Competition__NotActive();
        }
        if (competition.participants.length == 0) {
            revert Competition__NoParticipants();
        }
        
        // Verificar se o vencedor é um participante válido
        bool isValidWinner = false;
        for (uint256 i = 0; i < competition.participants.length; i++) {
            if (competition.participants[i] == _winner) {
                isValidWinner = true;
                break;
            }
        }
        if (!isValidWinner) {
            revert Competition__InvalidWinner();
        }

        // Mudar estado para CALCULATING para evitar novas entradas
        competition.state = CompetitionState.CALCULATING;
        
        // Calcular valores
        uint256 totalPrize = competition.stake;
        uint256 platformFee = (totalPrize * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 winnerReward = totalPrize - platformFee;
        
        // Atualizar estado
        competition.winner = _winner;
        competition.state = CompetitionState.FINISHED;
        competition.active = false;
        
        // Transferir tokens
        // 30% para a plataforma
        wldToken.safeTransfer(platform, platformFee);
        
        // 70% para o vencedor
        wldToken.safeTransfer(_winner, winnerReward);
        
        emit MatchClosed(_matchId, _winner, winnerReward, platformFee);
    }

    /**
     * @dev Obter informações sobre o vencedor e estado de uma competição
     * @param _matchId ID da competição
     */
    function getCompetitionResult(uint256 _matchId) external view returns (
        CompetitionState state,
        address winner,
        uint256 totalStake
    ) {
        require(_matchId > 0 && _matchId <= matchCount, "Invalid match ID");
        Match storage competition = matches[_matchId];
        return (competition.state, competition.winner, competition.stake);
    }


}
