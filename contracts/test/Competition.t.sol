// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Competition} from "../src/Competition.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Mock ERC20 Token para testes
contract MockERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name = "Mock WLD";
    string private _symbol = "mWLD";

    function mint(address account, uint256 amount) external {
        _balances[account] += amount;
        _totalSupply += amount;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        _allowances[sender][msg.sender] -= amount;
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        return true;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
}

contract CompetitionTest is Test {
    Competition public competition;
    MockERC20 public mockWLD;
    
    address public platform;
    address public player1;
    address public player2;
    address public player3;
    
    uint256 constant INITIAL_BALANCE = 1000 ether;
    uint256 constant STAKE_AMOUNT = 10 ether;
    
    // Eventos para testar
    event MatchCreated(uint256 indexed matchId, string name, uint256 durationDays, uint256 startTime);
    event PlayerJoined(uint256 indexed matchId, address indexed player, uint256 stakeAmount);
    event MatchClosed(uint256 indexed matchId, address winner, uint256 reward, uint256 platformFee);

    function setUp() public {
        platform = address(this);
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");
        
        // Deploy competition contract first
        competition = new Competition();
        
        // Deploy mock WLD token
        mockWLD = new MockERC20();
        
        // Use vm.etch to place the mock at the WLD token address
        vm.etch(address(competition.wldToken()), address(mockWLD).code);
        
        // Now mockWLD reference points to the correct address
        mockWLD = MockERC20(address(competition.wldToken()));
        
        // Mint tokens para os jogadores
        mockWLD.mint(player1, INITIAL_BALANCE);
        mockWLD.mint(player2, INITIAL_BALANCE);
        mockWLD.mint(player3, INITIAL_BALANCE);
        
        // Aprovar o contrato da competição para transferir tokens
        vm.prank(player1);
        mockWLD.approve(address(competition), type(uint256).max);
        
        vm.prank(player2);
        mockWLD.approve(address(competition), type(uint256).max);
        
        vm.prank(player3);
        mockWLD.approve(address(competition), type(uint256).max);
    }

    /////////////////////////////
    // Testes de Criação de Match
    /////////////////////////////
    
    function testCreateMatch() public {
        vm.expectEmit(true, false, false, true);
        emit MatchCreated(1, "Test Competition", 7, block.timestamp);
        
        competition.createMatch("Test Competition", 7);
        
        assertEq(competition.matchCount(), 1);
        
        // Verificar estado inicial
        (Competition.CompetitionState state, address winner, uint256 stake) = competition.getCompetitionResult(1);
        assertEq(uint256(state), uint256(Competition.CompetitionState.OPEN));
        assertEq(winner, address(0));
        assertEq(stake, 0);
    }
    
    function testCreateMultipleMatches() public {
        competition.createMatch("Match 1", 7);
        competition.createMatch("Match 2", 14);
        competition.createMatch("Match 3", 21);
        
        assertEq(competition.matchCount(), 3);
    }

    /////////////////////////////
    // Testes de Participação
    /////////////////////////////
    
    function testJoinChallenge() public {
        competition.createMatch("Test Competition", 7);
        
        vm.expectEmit(true, true, false, true);
        emit PlayerJoined(1, player1, STAKE_AMOUNT);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        assertEq(competition.getParticipantCount(1), 1);
        assertTrue(competition.isParticipant(1, player1));
        
        (,, uint256 stake) = competition.getCompetitionResult(1);
        assertEq(stake, STAKE_AMOUNT);
    }
    
    function testMultiplePlayersJoin() public {
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        vm.prank(player2);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        vm.prank(player3);
        competition.joinChallenge(1, STAKE_AMOUNT * 2);
        
        assertEq(competition.getParticipantCount(1), 3);
        
        (,, uint256 stake) = competition.getCompetitionResult(1);
        assertEq(stake, STAKE_AMOUNT * 4);
    }

    /////////////////////////////
    // Testes de Finalização
    /////////////////////////////
    
    function testFinalizeCompetition() public {
        // Criar competição e adicionar jogadores
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        vm.prank(player2);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        // Total stake: 20 ether
        uint256 totalStake = STAKE_AMOUNT * 2;
        uint256 platformFee = (totalStake * 30) / 100; // 6 ether
        uint256 winnerReward = totalStake - platformFee; // 14 ether
        
        // Transferir tokens para o contrato (simulando que já foram transferidos)
        mockWLD.mint(address(competition), totalStake);
        
        // Verificar balances antes da finalização
        uint256 platformBalanceBefore = mockWLD.balanceOf(platform);
        uint256 player1BalanceBefore = mockWLD.balanceOf(player1);
        
        // Finalizar competição com player1 como vencedor
        vm.expectEmit(true, false, false, true);
        emit MatchClosed(1, player1, winnerReward, platformFee);
        
        competition.finalizeCompetition(1, player1);
        
        // Verificar que a competição foi finalizada
        (Competition.CompetitionState state, address winner,) = competition.getCompetitionResult(1);
        assertEq(uint256(state), uint256(Competition.CompetitionState.FINISHED));
        assertEq(winner, player1);
        
        // Verificar distribuição de prêmios
        assertEq(mockWLD.balanceOf(platform), platformBalanceBefore + platformFee);
        assertEq(mockWLD.balanceOf(player1), player1BalanceBefore + winnerReward);
    }
    
    function testFinalizeCompetitionCalculation() public {
        competition.createMatch("Test Competition", 7);
        
        // Simular múltiplos jogadores com diferentes stakes
        vm.prank(player1);
        competition.joinChallenge(1, 100 ether);
        
        vm.prank(player2);
        competition.joinChallenge(1, 50 ether);
        
        vm.prank(player3);
        competition.joinChallenge(1, 150 ether);
        
        uint256 totalStake = 300 ether;
        
        // Transferir tokens para o contrato
        mockWLD.mint(address(competition), totalStake);
        
        // Calcular valores esperados
        uint256 expectedPlatformFee = (totalStake * 30) / 100; // 90 ether
        uint256 expectedWinnerReward = totalStake - expectedPlatformFee; // 210 ether
        
        uint256 platformBalanceBefore = mockWLD.balanceOf(platform);
        uint256 player2BalanceBefore = mockWLD.balanceOf(player2);
        
        // Finalizar com player2 como vencedor
        competition.finalizeCompetition(1, player2);
        
        // Verificar cálculos
        assertEq(mockWLD.balanceOf(platform), platformBalanceBefore + expectedPlatformFee);
        assertEq(mockWLD.balanceOf(player2), player2BalanceBefore + expectedWinnerReward);
    }

    /////////////////////////////
    // Testes de Exceções
    /////////////////////////////
    
    function testRevertJoinWhenNotOpen() public {
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        // Transferir tokens para o contrato
        mockWLD.mint(address(competition), STAKE_AMOUNT);
        
        // Finalizar a competição
        competition.finalizeCompetition(1, player1);
        
        // Tentar entrar em uma competição finalizada
        vm.prank(player2);
        vm.expectRevert(Competition.Competition__NotOpen.selector);
        competition.joinChallenge(1, STAKE_AMOUNT);
    }
    
    function testRevertInvalidWinner() public {
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        // Transferir tokens para o contrato
        mockWLD.mint(address(competition), STAKE_AMOUNT);
        
        // Tentar finalizar com um vencedor que não participou
        vm.expectRevert(Competition.Competition__InvalidWinner.selector);
        competition.finalizeCompetition(1, player2);
    }
    
    function testRevertFinalizeAlreadyFinished() public {
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        // Transferir tokens para o contrato
        mockWLD.mint(address(competition), STAKE_AMOUNT);
        
        // Finalizar a competição
        competition.finalizeCompetition(1, player1);
        
        // Tentar finalizar novamente
        vm.expectRevert(Competition.Competition__AlreadyFinished.selector);
        competition.finalizeCompetition(1, player1);
    }
    
    function testRevertFinalizeNoParticipants() public {
        competition.createMatch("Test Competition", 7);
        
        // Tentar finalizar sem participantes
        vm.expectRevert(Competition.Competition__NoParticipants.selector);
        competition.finalizeCompetition(1, player1);
    }
    
    function testRevertJoinTwice() public {
        competition.createMatch("Test Competition", 7);
        
        vm.startPrank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        // Tentar entrar novamente
        vm.expectRevert("Already joined this challenge");
        competition.joinChallenge(1, STAKE_AMOUNT);
        vm.stopPrank();
    }
    
    function testRevertJoinInactiveCompetition() public {
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        // Transferir tokens para o contrato
        mockWLD.mint(address(competition), STAKE_AMOUNT);
        
        // Finalizar (torna inativa e muda estado para FINISHED)
        competition.finalizeCompetition(1, player1);
        
        // Tentar entrar em competição finalizada
        // Como o estado é verificado primeiro, deve reverter com NotOpen
        vm.prank(player2);
        vm.expectRevert(Competition.Competition__NotOpen.selector);
        competition.joinChallenge(1, STAKE_AMOUNT);
    }

    /////////////////////////////
    // Testes de Funções View
    /////////////////////////////
    
    function testGetParticipants() public {
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        vm.prank(player2);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        address[] memory participants = competition.getParticipants(1);
        assertEq(participants.length, 2);
        assertEq(participants[0], player1);
        assertEq(participants[1], player2);
    }
    
    function testIsParticipant() public {
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        assertTrue(competition.isParticipant(1, player1));
        assertFalse(competition.isParticipant(1, player2));
    }
    
    function testGetCompetitionResult() public {
        competition.createMatch("Test Competition", 7);
        
        vm.prank(player1);
        competition.joinChallenge(1, STAKE_AMOUNT);
        
        // Antes da finalização
        (Competition.CompetitionState state, address winner, uint256 stake) = competition.getCompetitionResult(1);
        assertEq(uint256(state), uint256(Competition.CompetitionState.OPEN));
        assertEq(winner, address(0));
        assertEq(stake, STAKE_AMOUNT);
        
        // Transferir tokens para o contrato
        mockWLD.mint(address(competition), STAKE_AMOUNT);
        
        // Finalizar
        competition.finalizeCompetition(1, player1);
        
        // Depois da finalização
        (state, winner, stake) = competition.getCompetitionResult(1);
        assertEq(uint256(state), uint256(Competition.CompetitionState.FINISHED));
        assertEq(winner, player1);
        assertEq(stake, STAKE_AMOUNT);
    }
}
