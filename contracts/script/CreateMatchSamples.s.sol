// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Competition.sol";

contract CreateMatchScript is Script {
    function run() external {
        // pega a chave privada que você vai passar no comando
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // endereço do contrato já deployado
        address competitionAddr = vm.envAddress("COMPETITION_ADDRESS");

        Competition competition = Competition(competitionAddr);

        // cria uma competição com nome "Weekly Algorithm Challenge", 0.01 ether e 7 dias de duração
        competition.createMatch("Weekly Algorithm Challenge", 0.01 ether, 7);

        vm.stopBroadcast();
    }
}
