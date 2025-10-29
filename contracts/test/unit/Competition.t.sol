// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "../../lib/forge-std/src/Test.sol";
// import "../../src/Competition.sol";

// contract CompetitionTest is Test {
//     Competition competition;
//     address platform;
//     address player1;
//     address player2;
//     address player3;
//     address wldToken;

//     function setUp() public {
//         // Criar endereços de teste
//         platform = address(0x1);
//         player1 = address(0x2);
//         player2 = address(0x3);
//         player3 = address(0x4);
//         wldToken = address(0x5); // Mock WLD token address
        
//         // Deploy do contrato
//         vm.prank(platform);
//         competition = new Competition(wldToken);
        
//         // Criar uma competição para testar
//         vm.prank(platform);
//         competition.createMatch("Test Match", 7);
//     }

        
// }

