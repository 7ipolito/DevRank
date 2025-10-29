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

contract Competition is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Permit2 contract address (same on all chains)
    address public constant PERMIT2_ADDRESS = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    
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
        mapping(address => bool) hasParticipated;
    }

    uint256 public matchCount;
    mapping(uint256 => Match) public matches;

    // ---- Eventos ----
    event MatchCreated(
        uint256 indexed matchId,
        string name,
        uint256 durationDays
    );

    event PlayerJoined(
        uint256 indexed matchId,
        address indexed player
    );

    event MatchClosed(
        uint256 indexed matchId,
        address winner,
        uint256 reward,
        uint256 platformFee
    );



    constructor() {
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

        emit MatchCreated(matchCount, _name, _durationDays);
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
    function joinChallengeWithPermit2(
        uint256 _challengeId,
        ISignatureTransfer.PermitTransferFrom calldata permit,
        ISignatureTransfer.SignatureTransferDetails calldata transferDetails,
        bytes calldata signature
    ) external nonReentrant {
        Match storage challenge = matches[_challengeId];
        
        require(challenge.active, "Challenge is not active");
        require(permit.permitted.token == address(wldToken), "Invalid token");
       
       
        require(transferDetails.to == address(this), "Invalid transfer recipient");
        
        // Use Permit2 to transfer tokens
        ISignatureTransfer(PERMIT2_ADDRESS).permitTransferFrom(
            permit,
            transferDetails,
            msg.sender, // owner of the tokens
            signature
        );
        
        // Add user to challenge
        
        challenge.stake += transferDetails.requestedAmount;
        
        // Track user's challenges
        challenge.participants.push(msg.sender);
        
        emit PlayerJoined(_challengeId, msg.sender);
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

}
