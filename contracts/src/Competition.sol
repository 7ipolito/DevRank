// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Competition {
    // endereço da plataforma (dona do contrato)
    address public immutable platform;
    uint256 public constant MIN_STAKE = 0.01 ether; // 0.01 WLD (supondo 18 decimais)

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
        uint256 stake,
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

    constructor(address _platform) {
        platform = _platform;
    }

    // ---- Criar nova competição (só a plataforma pode) ----
    function createMatch(string memory _name, uint256 _stake, uint256 _durationDays) external onlyPlatform {
        require(_stake >= MIN_STAKE, "Stake too low");
        require(_durationDays > 0, "Invalid duration");
        require(bytes(_name).length > 0, "Name cannot be empty");

        matchCount++;
        Match storage m = matches[matchCount];
        m.id = matchCount;
        m.name = _name;
        m.stake = _stake;
        m.startTime = block.timestamp;
        m.durationDays = _durationDays;
        m.active = true;

        emit MatchCreated(matchCount, _name, _stake, _durationDays);
    }

    // // ---- Entrar na competição ----
    // function joinMatch(uint256 _matchId) external payable {
    //     Match storage m = matches[_matchId];
    //     require(m.active, "Match not active");
    //     require(m.participants.length < 5, "Match full");
    //     require(msg.value == m.stake, "Stake mismatch");

    //     m.participants.push(msg.sender);

    //     emit PlayerJoined(_matchId, msg.sender);
    // }

    // // ---- Encerrar competição e pagar prêmio ----
    // function closeMatch(uint256 _matchId, address _winner) external onlyPlatform {
    //     Match storage m = matches[_matchId];
    //     require(m.active, "Match already closed");
    //     require(m.participants.length > 0, "No participants");

    //     m.active = false;

    //     uint256 pot = m.stake * m.participants.length;
    //     uint256 winnerAmount = (pot * 65) / 100;
    //     uint256 platformFee = pot - winnerAmount;

    //     payable(_winner).transfer(winnerAmount);
    //     payable(platform).transfer(platformFee);

    //     emit MatchClosed(_matchId, _winner, winnerAmount, platformFee);
    // }

    // // ---- Helper para pegar participantes via front ----
    // function getParticipants(uint256 _matchId) external view returns (address[] memory) {
    //     return matches[_matchId].participants;
    // }
}
