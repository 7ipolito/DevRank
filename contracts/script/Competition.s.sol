// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Competition.sol";

contract CompetitionScript is Script {
    function run() external {
        vm.startBroadcast();
        // Mock WLD token address para teste
        address mockWldToken = address(0x1234567890123456789012345678901234567890);
        new Competition(msg.sender, mockWldToken); // msg.sender será a plataforma
        vm.stopBroadcast();
    }
}
