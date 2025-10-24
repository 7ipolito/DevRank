// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Script.sol";
import "../src/Competition.sol";

contract DeployWorldchainScript is Script {
    function run() external {
        // Obter chave privada como string e adicionar prefixo 0x se necessário
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        
        // Verificar se já tem prefixo 0x e adicionar se não tiver
        bytes memory keyBytes = bytes(privateKeyStr);
        string memory prefixedKey;
        
        if (keyBytes.length >= 2 && keyBytes[0] == 0x30 && keyBytes[1] == 0x78) {
            // Já tem prefixo 0x
            prefixedKey = privateKeyStr;
        } else {
            // Adicionar prefixo 0x
            prefixedKey = string(abi.encodePacked("0x", privateKeyStr));
        }
        
        uint256 deployerPrivateKey = vm.parseUint(prefixedKey);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Competition contract with deployer as platform
        // Mock WLD token address para teste na Worldchain Sepolia
        // Em produção, substitua pelo endereço real do WLD token
        address mockWldToken = address(0x0000000000000000000000000000000000000000);
        Competition competition = new Competition(deployer, mockWldToken);
        
        console.log("Competition contract deployed to:", address(competition));
        console.log("Platform address:", competition.platform());
        console.log("WLD Token address:", address(competition.wldToken()));
        
        vm.stopBroadcast();
    }
}
