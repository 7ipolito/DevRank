// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Competition {
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

    modifier onlyPlatform() {
        require(msg.sender == platform, "Not platform");
        _;
    }

    constructor(address _platform, address _wldTokenAddress) {
        platform = _platform;
        wldToken = IERC20(_wldTokenAddress);
    }

    function createMatch(string memory _name, uint256 _durationDays) external onlyPlatform {
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

    // Função para participar de uma competição enviando WLD
   function joinMatch(uint256 _matchId, uint256 _amount) external payable {
    require(_matchId > 0 && _matchId <= matchCount, "Invalid match ID");
    require(matches[_matchId].active, "Match is not active");
    require(_amount >= 0.1 ether && _amount <= 20 ether, "Stake must be between 0.1 and 20 WLD");

    // Transferir WLD do jogador para o contrato
    require(wldToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

    // Adicionar participante à competição
    matches[_matchId].participants.push(msg.sender);
    matches[_matchId].stake += _amount;

    emit PlayerJoined(_matchId, msg.sender);
}

    // Função para verificar jogadores e valores investidos na competição
    function getMatchDetails(uint256 _matchId) external view returns (
        uint256 id,
        string memory name,
        address[] memory participants,
        uint256 totalStake,
        uint256 startTime,
        uint256 durationDays,
        bool active
    ) {
        require(_matchId > 0 && _matchId <= matchCount, "Invalid match ID");
        
        Match storage matchData = matches[_matchId];
        
        return (
            matchData.id,
            matchData.name,
            matchData.participants,
            matchData.stake,
            matchData.startTime,
            matchData.durationDays,
            matchData.active
        );
    }

}
