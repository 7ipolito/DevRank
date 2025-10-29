// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Competition.sol";

contract CompetitionScript is Script {
    function run() external {
        vm.startBroadcast();
        
        // Endereço do token WLD na Worldchain Mainnet
        address wldTokenAddress = 0x2cFc85d8E48F8EAB294be644d9E25C3030863003;
        
        Competition competition = new Competition();
        
        console.log("Competition contract deployed to:", address(competition));
        console.log("WLD Token address:", wldTokenAddress);
        
        vm.stopBroadcast();
    }
}
