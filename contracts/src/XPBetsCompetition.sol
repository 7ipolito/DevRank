// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IWorldID.sol";
import "./helpers/ByteHasher.sol";

/**
 * @title XPBets Competition Contract
 * @dev Smart contract for coding competitions with WLD token betting
 * @dev Compatible with World Chain (EVM) - implements the flow from your diagram
 * @author DevRank Team
 */
contract XPBetsCompetition is Ownable, ReentrancyGuard, Pausable {
    using ByteHasher for bytes;

    // ============ State Variables ============
    
    /// @dev WLD token contract (ERC-20)
    IERC20 public immutable wldToken;
    
    /// @dev World ID contract for verification
    IWorldID public immutable worldId;
    
    /// @dev World ID group ID for verification
    uint256 public immutable groupId;
    
    /// @dev Platform fee percentage (in basis points, e.g., 500 = 5%)
    uint256 public platformFeePercent = 500; // 5%
    
    /// @dev Minimum entry amount in WLD tokens
    uint256 public minEntryAmount = 1 ether; // 1 WLD
    
    /// @dev Maximum participants per competition
    uint256 public maxParticipants = 100;
    
    /// @dev Competition counter
    uint256 public competitionCounter;
    
    /// @dev Platform treasury address
    address public treasury;

    // ============ Structs ============
    
    /**
     * @dev Competition structure
     */
    struct Competition {
        uint256 id;                    // Competition ID
        string name;                   // Competition name
        string description;            // Competition description
        address creator;               // Who created the competition
        uint256 entryAmount;           // Entry amount in WLD tokens
        uint256 startTime;             // Competition start timestamp
        uint256 endTime;               // Competition end timestamp
        uint256 maxParticipants;       // Maximum number of participants
        CompetitionStatus status;      // Current status
        address[] participants;        // Array of participant addresses
        mapping(address => bool) hasJoined; // Check if user has joined
        mapping(address => uint256) userNullifiers; // World ID nullifiers
        uint256 prizePool;             // Total prize pool in WLD
        address winner;                // Winner address (set after competition ends)
        bool prizesDistributed;        // Whether prizes have been distributed
        uint256 createdAt;             // Creation timestamp
    }
    
    /**
     * @dev Competition status enum
     */
    enum CompetitionStatus {
        Created,        // Competition created but not started
        Active,         // Competition is active and accepting participants
        InProgress,     // Competition started, no more participants allowed
        Ended,          // Competition ended, waiting for winner selection
        Completed       // Competition completed with prizes distributed
    }

    // ============ Mappings ============
    
    /// @dev Competition ID to Competition struct
    mapping(uint256 => Competition) public competitions;
    
    /// @dev User address to list of competitions they joined
    mapping(address => uint256[]) public userCompetitions;
    
    /// @dev World ID nullifiers to prevent double participation
    mapping(uint256 => bool) public nullifierUsed;

    // ============ Events ============
    
    /**
     * @dev Emitted when a user joins a competition - MATCHES YOUR DIAGRAM
     */
    event PlayerJoinedCompetition(
        address indexed user,
        uint256 indexed competitionId,
        uint256 valorWLD
    );
    
    /**
     * @dev Emitted when a new competition is created
     */
    event CompetitionCreated(
        uint256 indexed competitionId,
        string name,
        address indexed creator,
        uint256 entryAmount,
        uint256 startTime,
        uint256 endTime
    );
    
    /**
     * @dev Emitted when competition status changes
     */
    event CompetitionStatusChanged(
        uint256 indexed competitionId,
        CompetitionStatus oldStatus,
        CompetitionStatus newStatus
    );
    
    /**
     * @dev Emitted when a winner is selected
     */
    event WinnerSelected(
        uint256 indexed competitionId,
        address indexed winner,
        uint256 prizeAmount
    );
    
    /**
     * @dev Emitted when prizes are distributed
     */
    event PrizesDistributed(
        uint256 indexed competitionId,
        address indexed winner,
        uint256 winnerAmount,
        uint256 platformFee
    );

    // ============ Modifiers ============
    
    /**
     * @dev Check if competition exists
     */
    modifier competitionExists(uint256 competitionId) {
        require(competitionId > 0 && competitionId <= competitionCounter, "XPBets: Competition does not exist");
        _;
    }
    
    /**
     * @dev Check if user can join competition
     */
    modifier canJoinCompetition(uint256 competitionId) {
        Competition storage comp = competitions[competitionId];
        require(comp.status == CompetitionStatus.Active, "XPBets: Competition not active");
        require(!comp.hasJoined[msg.sender], "XPBets: Already joined this competition");
        require(comp.participants.length < comp.maxParticipants, "XPBets: Competition is full");
        require(block.timestamp >= comp.startTime, "XPBets: Competition not started");
        require(block.timestamp < comp.endTime, "XPBets: Competition has ended");
        _;
    }

    // ============ Constructor ============
    
    /**
     * @dev Constructor
     * @param _wldToken WLD token contract address
     * @param _worldId World ID contract address
     * @param _groupId World ID group ID
     * @param _treasury Treasury address for platform fees
     */
    constructor(
        address _wldToken,
        address _worldId,
        uint256 _groupId,
        address _treasury
    ) Ownable(msg.sender) {
        require(_wldToken != address(0), "XPBets: Invalid WLD token address");
        require(_worldId != address(0), "XPBets: Invalid World ID address");
        require(_treasury != address(0), "XPBets: Invalid treasury address");
        
        wldToken = IERC20(_wldToken);
        worldId = IWorldID(_worldId);
        groupId = _groupId;
        treasury = _treasury;
    }

    // ============ Core Functions ============
    
    /**
     * @dev Create a new competition
     * @param name Competition name
     * @param description Competition description
     * @param entryAmount Entry amount in WLD tokens
     * @param durationHours Duration in hours
     * @param maxParticipantsCount Maximum participants allowed
     */
    function createCompetition(
        string calldata name,
        string calldata description,
        uint256 entryAmount,
        uint256 durationHours,
        uint256 maxParticipantsCount
    ) external whenNotPaused returns (uint256) {
        require(bytes(name).length > 0, "XPBets: Name cannot be empty");
        require(entryAmount >= minEntryAmount, "XPBets: Entry amount too low");
        require(durationHours > 0, "XPBets: Duration must be positive");
        require(maxParticipantsCount > 1 && maxParticipantsCount <= maxParticipants, "XPBets: Invalid max participants");

        competitionCounter++;
        uint256 competitionId = competitionCounter;
        
        Competition storage comp = competitions[competitionId];
        comp.id = competitionId;
        comp.name = name;
        comp.description = description;
        comp.creator = msg.sender;
        comp.entryAmount = entryAmount;
        comp.startTime = block.timestamp;
        comp.endTime = block.timestamp + (durationHours * 1 hours);
        comp.maxParticipants = maxParticipantsCount;
        comp.status = CompetitionStatus.Active;
        comp.createdAt = block.timestamp;

        emit CompetitionCreated(
            competitionId,
            name,
            msg.sender,
            entryAmount,
            comp.startTime,
            comp.endTime
        );

        return competitionId;
    }

    /**
     * @dev Join a competition - IMPLEMENTS YOUR DIAGRAM FLOW
     * @param competitionId Competition ID to join
     * @param root World ID merkle root
     * @param nullifierHash World ID nullifier hash
     * @param proof World ID ZK proof
     */
    function joinCompetition(
        uint256 competitionId,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external 
        nonReentrant 
        whenNotPaused 
        competitionExists(competitionId) 
        canJoinCompetition(competitionId) 
    {
        Competition storage comp = competitions[competitionId];
        
        // Step 1: Verify World ID (human verification)
        _verifyWorldId(msg.sender, root, nullifierHash, proof);
        
        // Step 2: Check if user has sufficient WLD balance - MATCHES YOUR DIAGRAM
        require(
            wldToken.balanceOf(msg.sender) >= comp.entryAmount,
            "XPBets: Insufficient WLD balance"
        );
        
        // Step 3: Transfer WLD from user to contract - MATCHES YOUR DIAGRAM
        // Note: User must have approved this contract before calling
        require(
            wldToken.transferFrom(msg.sender, address(this), comp.entryAmount),
            "XPBets: WLD transfer failed"
        );
        
        // Step 4: Add WLD to prize pool and user to participants - MATCHES YOUR DIAGRAM
        comp.participants.push(msg.sender);
        comp.hasJoined[msg.sender] = true;
        comp.userNullifiers[msg.sender] = nullifierHash;
        comp.prizePool += comp.entryAmount;
        
        // Add to user's competition list
        userCompetitions[msg.sender].push(competitionId);
        
        // Mark nullifier as used
        nullifierUsed[nullifierHash] = true;
        
        // Step 5: Emit event - MATCHES YOUR DIAGRAM
        emit PlayerJoinedCompetition(msg.sender, competitionId, comp.entryAmount);
    }

    /**
     * @dev Select winner and distribute prizes
     * @param competitionId Competition ID
     * @param winner Winner address
     */
    function selectWinnerAndDistributePrizes(
        uint256 competitionId,
        address winner
    ) external onlyOwner competitionExists(competitionId) {
        Competition storage comp = competitions[competitionId];
        
        require(comp.status == CompetitionStatus.Active || comp.status == CompetitionStatus.InProgress, "XPBets: Invalid competition status");
        require(block.timestamp >= comp.endTime, "XPBets: Competition not ended yet");
        require(comp.participants.length > 0, "XPBets: No participants");
        require(comp.hasJoined[winner], "XPBets: Winner not in competition");
        require(!comp.prizesDistributed, "XPBets: Prizes already distributed");
        
        comp.winner = winner;
        comp.status = CompetitionStatus.Completed;
        comp.prizesDistributed = true;
        
        // Calculate prize distribution
        uint256 totalPrize = comp.prizePool;
        uint256 platformFee = (totalPrize * platformFeePercent) / 10000;
        uint256 winnerAmount = totalPrize - platformFee;
        
        // Transfer prizes
        if (winnerAmount > 0) {
            require(wldToken.transfer(winner, winnerAmount), "XPBets: Winner transfer failed");
        }
        
        if (platformFee > 0) {
            require(wldToken.transfer(treasury, platformFee), "XPBets: Platform fee transfer failed");
        }
        
        emit WinnerSelected(competitionId, winner, winnerAmount);
        emit PrizesDistributed(competitionId, winner, winnerAmount, platformFee);
    }

    /**
     * @dev End competition early (emergency function)
     * @param competitionId Competition ID
     */
    function endCompetitionEarly(uint256 competitionId) external onlyOwner competitionExists(competitionId) {
        Competition storage comp = competitions[competitionId];
        require(comp.status == CompetitionStatus.Active, "XPBets: Competition not active");
        
        CompetitionStatus oldStatus = comp.status;
        comp.status = CompetitionStatus.Ended;
        
        emit CompetitionStatusChanged(competitionId, oldStatus, CompetitionStatus.Ended);
    }

    /**
     * @dev Refund participants (emergency function)
     * @param competitionId Competition ID
     */
    function refundParticipants(uint256 competitionId) external onlyOwner competitionExists(competitionId) {
        Competition storage comp = competitions[competitionId];
        require(comp.status == CompetitionStatus.Ended && !comp.prizesDistributed, "XPBets: Cannot refund");
        require(comp.participants.length > 0, "XPBets: No participants to refund");
        
        comp.prizesDistributed = true;
        
        // Refund all participants
        for (uint256 i = 0; i < comp.participants.length; i++) {
            address participant = comp.participants[i];
            require(wldToken.transfer(participant, comp.entryAmount), "XPBets: Refund failed");
        }
        
        comp.status = CompetitionStatus.Completed;
    }

    // ============ World ID Verification ============
    
    /**
     * @dev Verify World ID proof
     * @param user User address
     * @param root Merkle root
     * @param nullifierHash Nullifier hash
     * @param proof ZK proof
     */
    function _verifyWorldId(
        address user,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) internal {
        require(!nullifierUsed[nullifierHash], "XPBets: World ID already used");
        
        // Create signal hash from user address
        uint256 signalHash = abi.encodePacked(user).hashToField();
        
        // Create external nullifier hash from contract address
        uint256 externalNullifierHash = abi.encodePacked(address(this)).hashToField();
        
        // Verify the proof
        worldId.verifyProof(
            root,
            groupId,
            signalHash,
            nullifierHash,
            externalNullifierHash,
            proof
        );
    }

    // ============ View Functions ============
    
    /**
     * @dev Get competition details
     * @param competitionId Competition ID
     */
    function getCompetition(uint256 competitionId) external view competitionExists(competitionId) returns (
        uint256 id,
        string memory name,
        string memory description,
        address creator,
        uint256 entryAmount,
        uint256 startTime,
        uint256 endTime,
        uint256 maxParticipantsCount,
        CompetitionStatus status,
        uint256 participantCount,
        uint256 prizePool,
        address winner,
        bool prizesDistributed
    ) {
        Competition storage comp = competitions[competitionId];
        return (
            comp.id,
            comp.name,
            comp.description,
            comp.creator,
            comp.entryAmount,
            comp.startTime,
            comp.endTime,
            comp.maxParticipants,
            comp.status,
            comp.participants.length,
            comp.prizePool,
            comp.winner,
            comp.prizesDistributed
        );
    }
    
    /**
     * @dev Get competition participants
     * @param competitionId Competition ID
     */
    function getCompetitionParticipants(uint256 competitionId) external view competitionExists(competitionId) returns (address[] memory) {
        return competitions[competitionId].participants;
    }
    
    /**
     * @dev Check if user has joined a competition
     * @param competitionId Competition ID
     * @param user User address
     */
    function hasUserJoined(uint256 competitionId, address user) external view competitionExists(competitionId) returns (bool) {
        return competitions[competitionId].hasJoined[user];
    }
    
    /**
     * @dev Get user's competitions
     * @param user User address
     */
    function getUserCompetitions(address user) external view returns (uint256[] memory) {
        return userCompetitions[user];
    }
    
    /**
     * @dev Get active competitions (limited to prevent gas issues)
     * @param limit Maximum number of competitions to return
     */
    function getActiveCompetitions(uint256 limit) external view returns (uint256[] memory activeIds) {
        uint256[] memory ids = new uint256[](limit);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= competitionCounter && count < limit; i++) {
            if (competitions[i].status == CompetitionStatus.Active) {
                ids[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        activeIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            activeIds[i] = ids[i];
        }
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Set platform fee percentage
     * @param newFeePercent New fee percentage in basis points
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "XPBets: Fee too high"); // Max 10%
        platformFeePercent = newFeePercent;
    }
    
    /**
     * @dev Set minimum entry amount
     * @param newMinAmount New minimum entry amount
     */
    function setMinEntryAmount(uint256 newMinAmount) external onlyOwner {
        require(newMinAmount > 0, "XPBets: Invalid min amount");
        minEntryAmount = newMinAmount;
    }
    
    /**
     * @dev Set maximum participants per competition
     * @param newMaxParticipants New maximum participants
     */
    function setMaxParticipants(uint256 newMaxParticipants) external onlyOwner {
        require(newMaxParticipants > 1, "XPBets: Invalid max participants");
        maxParticipants = newMaxParticipants;
    }
    
    /**
     * @dev Set treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "XPBets: Invalid treasury address");
        treasury = newTreasury;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only if paused)
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused {
        if (token == address(0)) {
            payable(treasury).transfer(amount);
        } else {
            IERC20(token).transfer(treasury, amount);
        }
    }

    // ============ Contract Info ============
    
    /**
     * @dev Get contract information
     */
    function getContractInfo() external view returns (
        address wldTokenAddress,
        address worldIdAddress,
        uint256 worldIdGroupId,
        uint256 totalCompetitions,
        uint256 platformFee,
        uint256 minEntry,
        uint256 maxParticipantsLimit,
        address treasuryAddress
    ) {
        return (
            address(wldToken),
            address(worldId),
            groupId,
            competitionCounter,
            platformFeePercent,
            minEntryAmount,
            maxParticipants,
            treasury
        );
    }
}
