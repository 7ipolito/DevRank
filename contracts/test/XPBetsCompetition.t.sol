// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test, console} from "@forge-std/Test.sol";
import {XPBetsCompetition} from "../src/XPBetsCompetition.sol";
import {IWorldID} from "../src/interfaces/IWorldID.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock WLD Token for testing
contract MockWLDToken is ERC20 {
    constructor() ERC20("Worldcoin Token", "WLD") {
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens for testing
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// Mock WorldID for testing
contract MockWorldID is IWorldID {
    mapping(uint256 => bool) public validNullifiers;
    bool public shouldRevert = false;
    
    function setValidNullifier(uint256 nullifierHash) external {
        validNullifiers[nullifierHash] = true;
    }
    
    function setShouldRevert(bool _shouldRevert) external {
        shouldRevert = _shouldRevert;
    }
    
    function verifyProof(
        uint256,
        uint256,
        uint256,
        uint256 nullifierHash,
        uint256,
        uint256[8] calldata
    ) external view override {
        if (shouldRevert) {
            revert("WorldID verification failed");
        }
        require(validNullifiers[nullifierHash], "Invalid nullifier");
    }
}

contract XPBetsCompetitionTest is Test {
    XPBetsCompetition public xpBetsCompetition;
    MockWLDToken public wldToken;
    MockWorldID public worldId;
    
    address public owner;
    address public treasury;
    address public user1;
    address public user2;
    address public user3;
    
    uint256 public constant GROUP_ID = 1;
    uint256 public constant ENTRY_AMOUNT = 10 ether; // 10 WLD
    
    // Sample WorldID proof data
    uint256 constant ROOT = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    uint256 constant NULLIFIER_1 = 0xabc123;
    uint256 constant NULLIFIER_2 = 0xdef456;
    uint256 constant NULLIFIER_3 = 0x789xyz;
    uint256[8] constant PROOF = [
        0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8
    ];

    event CompetitionCreated(
        uint256 indexed competitionId,
        string name,
        address indexed creator,
        uint256 entryAmount,
        uint256 startTime,
        uint256 endTime
    );

    event PlayerJoinedCompetition(
        address indexed user,
        uint256 indexed competitionId,
        uint256 valorWLD
    );

    event WinnerSelected(
        uint256 indexed competitionId,
        address indexed winner,
        uint256 prizeAmount
    );

    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        // Deploy mock contracts
        wldToken = new MockWLDToken();
        worldId = new MockWorldID();

        // Deploy XPBetsCompetition
        xpBetsCompetition = new XPBetsCompetition(
            address(wldToken),
            address(worldId),
            GROUP_ID,
            treasury
        );

        // Setup users with WLD tokens
        wldToken.mint(user1, 100 ether);
        wldToken.mint(user2, 100 ether);
        wldToken.mint(user3, 100 ether);

        // Setup valid nullifiers for WorldID
        worldId.setValidNullifier(NULLIFIER_1);
        worldId.setValidNullifier(NULLIFIER_2);
        worldId.setValidNullifier(NULLIFIER_3);

        // Approve WLD tokens for users
        vm.prank(user1);
        wldToken.approve(address(xpBetsCompetition), type(uint256).max);
        
        vm.prank(user2);
        wldToken.approve(address(xpBetsCompetition), type(uint256).max);
        
        vm.prank(user3);
        wldToken.approve(address(xpBetsCompetition), type(uint256).max);
    }

    // ============ Competition Creation Tests ============

    function test_CreateCompetition() public {
        string memory name = "Test Competition";
        string memory description = "A test competition";
        uint256 durationHours = 24;
        uint256 maxParticipants = 50;

        vm.expectEmit(true, true, false, true);
        emit CompetitionCreated(1, name, owner, ENTRY_AMOUNT, block.timestamp, block.timestamp + durationHours * 1 hours);

        uint256 competitionId = xpBetsCompetition.createCompetition(
            name,
            description,
            ENTRY_AMOUNT,
            durationHours,
            maxParticipants
        );

        assertEq(competitionId, 1);
        assertEq(xpBetsCompetition.competitionCounter(), 1);

        // Verify competition details
        (
            uint256 id,
            string memory competitionName,
            string memory competitionDescription,
            address creator,
            uint256 entryAmount,
            uint256 startTime,
            uint256 endTime,
            uint256 maxParticipantsCount,
            XPBetsCompetition.CompetitionStatus status,
            uint256 participantCount,
            uint256 prizePool,
            address winner,
            bool prizesDistributed
        ) = xpBetsCompetition.getCompetition(competitionId);

        assertEq(id, 1);
        assertEq(competitionName, name);
        assertEq(competitionDescription, description);
        assertEq(creator, owner);
        assertEq(entryAmount, ENTRY_AMOUNT);
        assertEq(maxParticipantsCount, maxParticipants);
        assertTrue(uint256(status) == 1); // Active
        assertEq(participantCount, 0);
        assertEq(prizePool, 0);
        assertEq(winner, address(0));
        assertFalse(prizesDistributed);
    }

    function test_RevertWhen_CreateCompetitionWithEmptyName() public {
        vm.expectRevert("XPBets: Name cannot be empty");
        xpBetsCompetition.createCompetition("", "Description", ENTRY_AMOUNT, 24, 50);
    }

    function test_RevertWhen_CreateCompetitionWithLowEntryAmount() public {
        vm.expectRevert("XPBets: Entry amount too low");
        xpBetsCompetition.createCompetition("Test", "Description", 0.5 ether, 24, 50);
    }

    function test_RevertWhen_CreateCompetitionWithInvalidParticipants() public {
        vm.expectRevert("XPBets: Invalid max participants");
        xpBetsCompetition.createCompetition("Test", "Description", ENTRY_AMOUNT, 24, 1);

        vm.expectRevert("XPBets: Invalid max participants");
        xpBetsCompetition.createCompetition("Test", "Description", ENTRY_AMOUNT, 24, 101);
    }

    // ============ Join Competition Tests ============

    function test_JoinCompetition() public {
        // Create competition
        uint256 competitionId = xpBetsCompetition.createCompetition(
            "Test Competition",
            "Description",
            ENTRY_AMOUNT,
            24,
            50
        );

        // Check initial balances
        uint256 initialUser1Balance = wldToken.balanceOf(user1);
        uint256 initialContractBalance = wldToken.balanceOf(address(xpBetsCompetition));

        vm.expectEmit(true, true, false, true);
        emit PlayerJoinedCompetition(user1, competitionId, ENTRY_AMOUNT);

        // User1 joins competition
        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);

        // Verify balances changed
        assertEq(wldToken.balanceOf(user1), initialUser1Balance - ENTRY_AMOUNT);
        assertEq(wldToken.balanceOf(address(xpBetsCompetition)), initialContractBalance + ENTRY_AMOUNT);

        // Verify competition updated
        (,,,,,,,, uint256 participantCount, uint256 prizePool,,) = xpBetsCompetition.getCompetition(competitionId);
        assertEq(participantCount, 1);
        assertEq(prizePool, ENTRY_AMOUNT);

        // Verify user joined
        assertTrue(xpBetsCompetition.hasUserJoined(competitionId, user1));
        
        // Verify participants list
        address[] memory participants = xpBetsCompetition.getCompetitionParticipants(competitionId);
        assertEq(participants.length, 1);
        assertEq(participants[0], user1);

        // Verify nullifier is used
        assertTrue(xpBetsCompetition.nullifierUsed(NULLIFIER_1));
    }

    function test_JoinCompetition_MultipleUsers() public {
        // Create competition
        uint256 competitionId = xpBetsCompetition.createCompetition(
            "Multi-user Competition",
            "Description",
            ENTRY_AMOUNT,
            24,
            50
        );

        // User1 joins
        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);

        // User2 joins
        vm.prank(user2);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_2, PROOF);

        // Verify competition state
        (,,,,,,,, uint256 participantCount, uint256 prizePool,,) = xpBetsCompetition.getCompetition(competitionId);
        assertEq(participantCount, 2);
        assertEq(prizePool, ENTRY_AMOUNT * 2);

        // Verify both users joined
        assertTrue(xpBetsCompetition.hasUserJoined(competitionId, user1));
        assertTrue(xpBetsCompetition.hasUserJoined(competitionId, user2));

        // Verify participants list
        address[] memory participants = xpBetsCompetition.getCompetitionParticipants(competitionId);
        assertEq(participants.length, 2);
        assertEq(participants[0], user1);
        assertEq(participants[1], user2);
    }

    function test_RevertWhen_JoinNonexistentCompetition() public {
        vm.prank(user1);
        vm.expectRevert("XPBets: Competition does not exist");
        xpBetsCompetition.joinCompetition(999, ROOT, NULLIFIER_1, PROOF);
    }

    function test_RevertWhen_JoinTwice() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 24, 50);

        // First join - should succeed
        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);

        // Second join - should fail
        vm.prank(user1);
        vm.expectRevert("XPBets: Already joined this competition");
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_2, PROOF);
    }

    function test_RevertWhen_JoinWithInsufficientBalance() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 24, 50);

        // Create user with insufficient balance
        address poorUser = makeAddr("poorUser");
        wldToken.mint(poorUser, 1 ether); // Less than ENTRY_AMOUNT

        vm.prank(poorUser);
        wldToken.approve(address(xpBetsCompetition), type(uint256).max);

        vm.prank(poorUser);
        vm.expectRevert("XPBets: Insufficient WLD balance");
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);
    }

    function test_RevertWhen_JoinWithoutApproval() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 24, 50);

        // Create user without approval
        address noApprovalUser = makeAddr("noApprovalUser");
        wldToken.mint(noApprovalUser, 100 ether);

        vm.prank(noApprovalUser);
        vm.expectRevert("XPBets: WLD transfer failed");
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);
    }

    function test_RevertWhen_JoinWithUsedNullifier() public {
        uint256 competitionId1 = xpBetsCompetition.createCompetition("Test1", "Desc", ENTRY_AMOUNT, 24, 50);
        uint256 competitionId2 = xpBetsCompetition.createCompetition("Test2", "Desc", ENTRY_AMOUNT, 24, 50);

        // User1 joins first competition
        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId1, ROOT, NULLIFIER_1, PROOF);

        // User2 tries to use same nullifier - should fail
        vm.prank(user2);
        vm.expectRevert("XPBets: World ID already used");
        xpBetsCompetition.joinCompetition(competitionId2, ROOT, NULLIFIER_1, PROOF);
    }

    function test_RevertWhen_JoinWithInvalidWorldIDProof() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 24, 50);

        // Set WorldID to revert
        worldId.setShouldRevert(true);

        vm.prank(user1);
        vm.expectRevert("WorldID verification failed");
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);
    }

    function test_RevertWhen_JoinExpiredCompetition() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 1, 50); // 1 hour

        // Fast forward time past competition end
        vm.warp(block.timestamp + 2 hours);

        vm.prank(user1);
        vm.expectRevert("XPBets: Competition has ended");
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);
    }

    // ============ Winner Selection and Prize Distribution Tests ============

    function test_SelectWinnerAndDistributePrizes() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 1, 50);

        // Two users join
        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);

        vm.prank(user2);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_2, PROOF);

        // Fast forward past competition end
        vm.warp(block.timestamp + 2 hours);

        // Check initial balances
        uint256 initialUser1Balance = wldToken.balanceOf(user1);
        uint256 initialTreasuryBalance = wldToken.balanceOf(treasury);

        vm.expectEmit(true, true, false, true);
        emit WinnerSelected(competitionId, user1, ENTRY_AMOUNT * 2 * 95 / 100); // 95% after 5% fee

        // Select user1 as winner
        xpBetsCompetition.selectWinnerAndDistributePrizes(competitionId, user1);

        // Verify balances
        uint256 totalPrize = ENTRY_AMOUNT * 2;
        uint256 platformFee = totalPrize * 5 / 100; // 5% fee
        uint256 winnerAmount = totalPrize - platformFee;

        assertEq(wldToken.balanceOf(user1), initialUser1Balance + winnerAmount);
        assertEq(wldToken.balanceOf(treasury), initialTreasuryBalance + platformFee);

        // Verify competition state
        (,,,,,,,, XPBetsCompetition.CompetitionStatus status,, address winner, bool prizesDistributed) = 
            xpBetsCompetition.getCompetition(competitionId);
        
        assertTrue(uint256(status) == 4); // Completed
        assertEq(winner, user1);
        assertTrue(prizesDistributed);
    }

    function test_RevertWhen_SelectWinnerNotInCompetition() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 1, 50);

        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);

        vm.warp(block.timestamp + 2 hours);

        // Try to select user2 as winner (not in competition)
        vm.expectRevert("XPBets: Winner not in competition");
        xpBetsCompetition.selectWinnerAndDistributePrizes(competitionId, user2);
    }

    function test_RevertWhen_SelectWinnerTooEarly() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 24, 50);

        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);

        // Try to select winner before competition ends
        vm.expectRevert("XPBets: Competition not ended yet");
        xpBetsCompetition.selectWinnerAndDistributePrizes(competitionId, user1);
    }

    function test_RevertWhen_SelectWinnerTwice() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 1, 50);

        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);

        vm.warp(block.timestamp + 2 hours);

        // Select winner first time
        xpBetsCompetition.selectWinnerAndDistributePrizes(competitionId, user1);

        // Try to select winner again
        vm.expectRevert("XPBets: Prizes already distributed");
        xpBetsCompetition.selectWinnerAndDistributePrizes(competitionId, user1);
    }

    // ============ Admin Functions Tests ============

    function test_SetPlatformFee() public {
        uint256 newFee = 300; // 3%
        xpBetsCompetition.setPlatformFee(newFee);

        (,,,, uint256 platformFee,,,) = xpBetsCompetition.getContractInfo();
        assertEq(platformFee, newFee);
    }

    function test_RevertWhen_SetPlatformFeeTooHigh() public {
        vm.expectRevert("XPBets: Fee too high");
        xpBetsCompetition.setPlatformFee(1001); // > 10%
    }

    function test_RevertWhen_NonOwnerCallsAdminFunction() public {
        vm.prank(user1);
        vm.expectRevert();
        xpBetsCompetition.setPlatformFee(300);
    }

    function test_SetMinEntryAmount() public {
        uint256 newMinAmount = 5 ether;
        xpBetsCompetition.setMinEntryAmount(newMinAmount);

        (,,, uint256 platformFee, uint256 minEntry,,) = xpBetsCompetition.getContractInfo();
        assertEq(minEntry, newMinAmount);
    }

    function test_PauseAndUnpause() public {
        // Test pause
        xpBetsCompetition.pause();
        
        vm.expectRevert("Pausable: paused");
        xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 24, 50);

        // Test unpause
        xpBetsCompetition.unpause();
        
        // Should work now
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 24, 50);
        assertEq(competitionId, 1);
    }

    // ============ View Functions Tests ============

    function test_GetActiveCompetitions() public {
        // Create multiple competitions
        xpBetsCompetition.createCompetition("Competition 1", "Desc", ENTRY_AMOUNT, 24, 50);
        xpBetsCompetition.createCompetition("Competition 2", "Desc", ENTRY_AMOUNT, 24, 50);
        xpBetsCompetition.createCompetition("Competition 3", "Desc", ENTRY_AMOUNT, 24, 50);

        uint256[] memory activeCompetitions = xpBetsCompetition.getActiveCompetitions(10);
        
        assertEq(activeCompetitions.length, 3);
        assertEq(activeCompetitions[0], 1);
        assertEq(activeCompetitions[1], 2);
        assertEq(activeCompetitions[2], 3);
    }

    function test_GetUserCompetitions() public {
        uint256 competitionId1 = xpBetsCompetition.createCompetition("Competition 1", "Desc", ENTRY_AMOUNT, 24, 50);
        uint256 competitionId2 = xpBetsCompetition.createCompetition("Competition 2", "Desc", ENTRY_AMOUNT, 24, 50);

        // User1 joins both competitions
        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId1, ROOT, NULLIFIER_1, PROOF);

        vm.prank(user1);  
        xpBetsCompetition.joinCompetition(competitionId2, ROOT, NULLIFIER_2, PROOF);

        uint256[] memory userCompetitions = xpBetsCompetition.getUserCompetitions(user1);
        
        assertEq(userCompetitions.length, 2);
        assertEq(userCompetitions[0], competitionId1);
        assertEq(userCompetitions[1], competitionId2);
    }

    // ============ Edge Cases and Fuzz Tests ============

    function testFuzz_CreateCompetition(
        uint256 entryAmount,
        uint256 duration,
        uint256 maxParticipantsCount
    ) public {
        // Bound inputs to valid ranges
        entryAmount = bound(entryAmount, 1 ether, 1000 ether);
        duration = bound(duration, 1, 168); // 1 hour to 1 week
        maxParticipantsCount = bound(maxParticipantsCount, 2, 100);

        uint256 competitionId = xpBetsCompetition.createCompetition(
            "Fuzz Test",
            "Description",
            entryAmount,
            duration,
            maxParticipantsCount
        );

        assertEq(competitionId, 1);

        (,, uint256 retrievedEntryAmount,,,, uint256 retrievedMaxParticipants,,,,) = 
            xpBetsCompetition.getCompetition(competitionId);
        
        assertEq(retrievedEntryAmount, entryAmount);
        assertEq(retrievedMaxParticipants, maxParticipantsCount);
    }

    function test_RefundParticipants() public {
        uint256 competitionId = xpBetsCompetition.createCompetition("Test", "Desc", ENTRY_AMOUNT, 1, 50);

        // Users join
        vm.prank(user1);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_1, PROOF);

        vm.prank(user2);
        xpBetsCompetition.joinCompetition(competitionId, ROOT, NULLIFIER_2, PROOF);

        uint256 initialUser1Balance = wldToken.balanceOf(user1);
        uint256 initialUser2Balance = wldToken.balanceOf(user2);

        // End competition early and refund
        xpBetsCompetition.endCompetitionEarly(competitionId);
        xpBetsCompetition.refundParticipants(competitionId);

        // Verify refunds
        assertEq(wldToken.balanceOf(user1), initialUser1Balance + ENTRY_AMOUNT);
        assertEq(wldToken.balanceOf(user2), initialUser2Balance + ENTRY_AMOUNT);
    }
}
