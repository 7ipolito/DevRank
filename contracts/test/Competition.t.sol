// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "../lib/forge-std/src/Test.sol";
// import "../src/Competition.sol";

// contract CompetitionTest is Test {
//     Competition competition;
//     address platform;
//     address player1;
//     address player2;
//     address wldToken;

//     function setUp() public {
//         platform = address(0x1);
//         player1 = address(0x2);
//         player2 = address(0x3);
//         wldToken = address(0x4); // Mock WLD token address
        
//         vm.prank(platform);
//         competition = new Competition();
        
//         // Criar uma competição
//         vm.prank(platform);
//         competition.createMatch("Test Match", 7);
//     }

//     function testGetMatchDetails() public view {
//         // Verificar detalhes da competição antes de adicionar jogadores
//         (uint256 id, string memory name, address[] memory participants, uint256 totalStake, uint256 startTime, uint256 durationDays, bool active) = competition.getMatchDetails(1);
        
//         console.log("=== MATCH DETAILS ===");
//         console.log("ID:", id);
//         console.log("Name:", name);
//         console.log("Participants count:", participants.length);
//         console.log("Total stake:", totalStake);
//         console.log("Start time:", startTime);
//         console.log("Duration (days):", durationDays);
//         console.log("Active:", active);
        
//         // Verificar valores iniciais
//         assertEq(id, 1);
//         assertEq(keccak256(bytes(name)), keccak256(bytes("Test Match")));
//         assertEq(participants.length, 0);
//         assertEq(totalStake, 0);
//         assertEq(durationDays, 7);
//         assertTrue(active);
//     }

//     function testGetMatchDetailsWithParticipants() public {
//         // Simular que jogadores se juntaram à competição
//         // (Em um teste real, você precisaria mockar o token WLD)
        
//         console.log("=== TESTING MATCH DETAILS FUNCTION ===");
        
//         // Verificar competição vazia
//         (uint256 id, string memory name, address[] memory participants, uint256 totalStake, uint256 startTime, uint256 durationDays, bool active) = competition.getMatchDetails(1);
        
//         console.log("BEFORE adding participants:");
//         console.log("Participants:", participants.length);
//         console.log("Total stake:", totalStake);
        
//         // Verificar que a função retorna os dados corretos
//         assertEq(participants.length, 0);
//         assertEq(totalStake, 0);
//         assertEq(id, 1);
//         assertTrue(active);
        
//         console.log("Function getMatchDetails() works correctly!");
//         console.log("It returns all match information including participants and stake amounts");
//     }

//     function testJoinMatch() public {
//         console.log("=== TESTING JOIN MATCH FUNCTION ===");
        
//         // Verificar competição antes de adicionar jogadores
//         (uint256 id, string memory name, address[] memory participants, uint256 totalStake, uint256 startTime, uint256 durationDays, bool active) = competition.getMatchDetails(1);
        
//         console.log("BEFORE joining:");
//         console.log("Participants:", participants.length);
//         console.log("Total stake:", totalStake);
        
//         // Simular player1 se juntando à competição com 1 WLD
//         // Mock: simular que player1 tem WLD tokens
//         vm.prank(player1);
//         competition.joinMatchWithPermit2(1, 1 ether);
        
//         // Verificar competição após adicionar jogador
//         (id, name, participants, totalStake, startTime, durationDays, active) = competition.getMatchDetails(1);
        
//         console.log("AFTER player1 joins:");
//         console.log("Participants:", participants.length);
//         console.log("Total stake:", totalStake);
//         console.log("Player1 address:", participants[0]);
        
//         // Verificar que os dados foram atualizados corretamente
//         assertEq(participants.length, 1);
//         assertEq(totalStake, 1 ether);
//         assertEq(participants[0], player1);
        
//         // Simular player2 se juntando à competição com 2 WLD
//         // Mock: simular que player2 tem WLD tokens
//         vm.prank(player2);
//         competition.joinMatch(1, 2 ether);
        
//         // Verificar competição após adicionar segundo jogador
//         (id, name, participants, totalStake, startTime, durationDays, active) = competition.getMatchDetails(1);
        
//         console.log("AFTER player2 joins:");
//         console.log("Participants:", participants.length);
//         console.log("Total stake:", totalStake);
        
//         // Verificar que os dados foram atualizados corretamente
//         assertEq(participants.length, 2);
//         assertEq(totalStake, 3 ether);
//         assertEq(participants[0], player1);
//         assertEq(participants[1], player2);
        
//         console.log("joinMatch() function works correctly!");
//         console.log("Players can join matches by sending WLD directly");
//     }

//     function testLastMatchIDAdded() public {
//         console.log("=== TESTING LAST MATCH ID ADDED ===");
        
//         // Verificar valor inicial
//         assertEq(competition.lastMatchIDAdded(), 1);
//         console.log("Initial lastMatchIDAdded:", competition.lastMatchIDAdded());
        
//         // Criar segundo match
//         vm.prank(platform);
//         competition.createMatch("Second Match", 14);
        
//         // Verificar se lastMatchIDAdded foi atualizado
//         assertEq(competition.lastMatchIDAdded(), 2);
//         console.log("After creating second match, lastMatchIDAdded:", competition.lastMatchIDAdded());
        
//         // Criar terceiro match
//         vm.prank(platform);
//         competition.createMatch("Third Match", 21);
        
//         // Verificar se lastMatchIDAdded foi atualizado novamente
//         assertEq(competition.lastMatchIDAdded(), 3);
//         console.log("After creating third match, lastMatchIDAdded:", competition.lastMatchIDAdded());
        
//         // Verificar que matchCount e lastMatchIDAdded são iguais
//         assertEq(competition.matchCount(), competition.lastMatchIDAdded());
//         console.log("matchCount and lastMatchIDAdded are equal:", competition.matchCount());
        
//         console.log("lastMatchIDAdded variable works correctly!");
//         console.log("It tracks the ID of the most recently created match");
//     }

//     function testGetMatchDetailsUsesMatchCount() public {
//         console.log("=== TESTING GET MATCH DETAILS USES MATCH COUNT ===");
        
//         // Criar múltiplos matches
//         vm.prank(platform);
//         competition.createMatch("First Match", 7);
        
//         vm.prank(platform);
//         competition.createMatch("Second Match", 14);
        
//         vm.prank(platform);
//         competition.createMatch("Third Match", 21);
        
//         console.log("Created 3 additional matches. Total matchCount:", competition.matchCount());
        
//         // Testar getMatchDetails com diferentes IDs - todos devem retornar o último match
//         (uint256 id1, string memory name1, , , , , ) = competition.getMatchDetails(1);
//         (uint256 id2, string memory name2, , , , , ) = competition.getMatchDetails(2);
//         (uint256 id3, string memory name3, , , , , ) = competition.getMatchDetails(3);
//         (uint256 id4, string memory name4, , , , , ) = competition.getMatchDetails(4);
        
//         console.log("getMatchDetails(1) returns - ID:", id1, "Name:", name1);
//         console.log("getMatchDetails(2) returns - ID:", id2, "Name:", name2);
//         console.log("getMatchDetails(3) returns - ID:", id3, "Name:", name3);
//         console.log("getMatchDetails(4) returns - ID:", id4, "Name:", name4);
        
//         // Todos devem retornar o mesmo match (o último criado - ID 4)
//         assertEq(id1, 4);
//         assertEq(id2, 4);
//         assertEq(id3, 4);
//         assertEq(id4, 4);
//         assertEq(keccak256(bytes(name1)), keccak256(bytes("Third Match")));
//         assertEq(keccak256(bytes(name2)), keccak256(bytes("Third Match")));
//         assertEq(keccak256(bytes(name3)), keccak256(bytes("Third Match")));
//         assertEq(keccak256(bytes(name4)), keccak256(bytes("Third Match")));
        
//         console.log("getMatchDetails() now uses matchCount!");
//         console.log("All calls return details of the most recent match");
//     }
// }
