//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../lib/forge-std/src/Test.sol";
import "../../src/Competition.sol";

contract CompetitionTest is Test {
    Competition competition;
    address player1;
    address player2;
    address player3;
    
    // Events para testar emissão
    event MatchCreated(uint256 indexed matchId, string name, uint256 durationDays);
    event PlayerJoined(uint256 indexed matchId, address indexed player);
    event MatchClosed(uint256 indexed matchId, address winner, uint256 reward, uint256 platformFee);

    function setUp() public {
        competition = new Competition();
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");
    }

    // ========== TESTES DE CRIAÇÃO DE MATCH ==========
    
    function test_createMatch_Success() public {
        // Verificar emissão de evento
        vm.expectEmit(true, false, false, true);
        emit MatchCreated(1, "Test Match", 7);
        
        competition.createMatch("Test Match", 7);
        
        // Verificar que o contador foi incrementado
        assertEq(competition.matchCount(), 1);
        
        // Verificar dados do match (mapping público retorna apenas campos simples, não arrays e mappings)
        (
            uint256 id,
            string memory name,
            uint256 stake,
            uint256 startTime,
            uint256 durationDays,
            bool active
        ) = competition.matches(1);
        
        assertEq(id, 1);
        assertEq(name, "Test Match");
        assertEq(stake, 0);
        assertEq(startTime, block.timestamp);
        assertEq(durationDays, 7);
        assertTrue(active);
    }
    
    function test_createMatch_MultipleMatches() public {
        competition.createMatch("Match 1", 1);
        competition.createMatch("Match 2", 5);
        competition.createMatch("Match 3", 10);
        
        assertEq(competition.matchCount(), 3);
        
        (, string memory name1,,,,) = competition.matches(1);
        (, string memory name2,,,,) = competition.matches(2);
        (, string memory name3,,,,) = competition.matches(3);
        
        assertEq(name1, "Match 1");
        assertEq(name2, "Match 2");
        assertEq(name3, "Match 3");
    }
    
    function test_createMatch_RevertIfDurationZero() public {
        vm.expectRevert("Invalid duration");
        competition.createMatch("Test Match", 0);
    }
    
    function test_createMatch_RevertIfEmptyName() public {
        vm.expectRevert("Name cannot be empty");
        competition.createMatch("", 7);
    }
    
    function test_createMatch_WithLongName() public {
        string memory longName = "This is a very long match name that should still work fine";
        competition.createMatch(longName, 30);
        
        (, string memory name,,,,) = competition.matches(1);
        assertEq(name, longName);
    }

    // ========== TESTES DE JOIN CHALLENGE ==========
    
    function test_joinChallenge_Success() public {
        // Criar um match primeiro
        competition.createMatch("Test Match", 7);
        
        // Verificar que não há participantes inicialmente
        assertEq(competition.getParticipantCount(1), 0);
        
        // Verificar emissão de evento
        vm.expectEmit(true, true, false, false);
        emit PlayerJoined(1, player1);
        
        // Player1 entra no challenge
        vm.prank(player1);
        competition.joinChallenge(1, 100 ether);
        
        // Verificar que o stake foi atualizado
        (,, uint256 stake,,,) = competition.matches(1);
        assertEq(stake, 100 ether);
        
        // Verificar que o participante foi adicionado
        assertEq(competition.getParticipantCount(1), 1);
        
        address[] memory participants = competition.getParticipants(1);
        assertEq(participants.length, 1);
        assertEq(participants[0], player1);
    }
    
    function test_joinChallenge_MultiplePlayersAccumulateStake() public {
        competition.createMatch("Test Match", 7);
        
        // Player1 entra com 100
        vm.prank(player1);
        competition.joinChallenge(1, 100 ether);
        
        // Player2 entra com 200
        vm.prank(player2);
        competition.joinChallenge(1, 200 ether);
        
        // Player3 entra com 150
        vm.prank(player3);
        competition.joinChallenge(1, 150 ether);
        
        // Verificar stake total
        (,, uint256 stake,,,) = competition.matches(1);
        assertEq(stake, 450 ether);
        
        // Verificar que todos os participantes foram adicionados
        assertEq(competition.getParticipantCount(1), 3);
        
        address[] memory participants = competition.getParticipants(1);
        assertEq(participants.length, 3);
        assertEq(participants[0], player1);
        assertEq(participants[1], player2);
        assertEq(participants[2], player3);
    }
    
    function test_joinChallenge_RevertIfNotActive() public {
        // Criar match mas não vai estar ativo
        competition.createMatch("Test Match", 7);
        
        // Obter storage do match e desativar (nota: precisaríamos de uma função no contrato para isso)
        // Por enquanto, vamos testar com um matchId que não existe
        vm.expectRevert("Challenge is not active");
        vm.prank(player1);
        competition.joinChallenge(999, 100 ether);
    }
    
    function test_joinChallenge_RevertIfAlreadyJoined() public {
        competition.createMatch("Test Match", 7);
        
        // Player1 entra no challenge
        vm.prank(player1);
        competition.joinChallenge(1, 100 ether);
        
        // Tentar entrar novamente deve reverter
        vm.expectRevert("Already joined this challenge");
        vm.prank(player1);
        competition.joinChallenge(1, 50 ether);
        
        // Verificar que apenas uma entrada foi registrada
        assertEq(competition.getParticipantCount(1), 1);
        (,, uint256 stake,,,) = competition.matches(1);
        assertEq(stake, 100 ether); // Apenas o primeiro stake
    }
    
    function test_joinChallenge_DifferentMatches() public {
        competition.createMatch("Match 1", 7);
        competition.createMatch("Match 2", 14);
        
        vm.prank(player1);
        competition.joinChallenge(1, 100 ether);
        
        vm.prank(player2);
        competition.joinChallenge(2, 200 ether);
        
        (,, uint256 stake1,,,) = competition.matches(1);
        (,, uint256 stake2,,,) = competition.matches(2);
        
        assertEq(stake1, 100 ether);
        assertEq(stake2, 200 ether);
    }
    
    function test_joinChallenge_SamePlayerDifferentMatches() public {
        competition.createMatch("Match 1", 7);
        competition.createMatch("Match 2", 14);
        
        // Player1 pode entrar em diferentes matches
        vm.startPrank(player1);
        competition.joinChallenge(1, 100 ether);
        competition.joinChallenge(2, 200 ether);
        vm.stopPrank();
        
        // Verificar que entrou em ambos
        assertTrue(competition.isParticipant(1, player1));
        assertTrue(competition.isParticipant(2, player1));
        
        (,, uint256 stake1,,,) = competition.matches(1);
        (,, uint256 stake2,,,) = competition.matches(2);
        
        assertEq(stake1, 100 ether);
        assertEq(stake2, 200 ether);
    }

    // ========== TESTES DE GETTERS DE PARTICIPANTES ==========
    
    function test_getParticipants_RevertIfInvalidMatchId() public {
        vm.expectRevert("Invalid match ID");
        competition.getParticipants(0);
        
        vm.expectRevert("Invalid match ID");
        competition.getParticipants(999);
    }
    
    function test_getParticipantCount_RevertIfInvalidMatchId() public {
        vm.expectRevert("Invalid match ID");
        competition.getParticipantCount(0);
        
        vm.expectRevert("Invalid match ID");
        competition.getParticipantCount(999);
    }
    
    function test_getParticipants_EmptyArray() public {
        competition.createMatch("Test Match", 7);
        
        address[] memory participants = competition.getParticipants(1);
        assertEq(participants.length, 0);
    }
    
    function test_isParticipant_RevertIfInvalidMatchId() public {
        vm.expectRevert("Invalid match ID");
        competition.isParticipant(0, player1);
        
        vm.expectRevert("Invalid match ID");
        competition.isParticipant(999, player1);
    }
    
    function test_isParticipant_ValidMatchId() public {
        competition.createMatch("Test Match", 7);
        
        // Antes de entrar, deve retornar false
        bool participatedBefore = competition.isParticipant(1, player1);
        assertFalse(participatedBefore);
        
        // Player1 entra no challenge
        vm.prank(player1);
        competition.joinChallenge(1, 100 ether);
        
        // Depois de entrar, deve retornar true
        bool participatedAfter = competition.isParticipant(1, player1);
        assertTrue(participatedAfter);
        
        // Player2 não entrou, deve retornar false
        bool player2Participated = competition.isParticipant(1, player2);
        assertFalse(player2Participated);
    }

    
 
    
   
}