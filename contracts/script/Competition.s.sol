// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Competition.sol";

contract CompetitionScript is Script {
    function run() external {
        vm.startBroadcast();
        new Competition(msg.sender); // msg.sender será a plataforma
        vm.stopBroadcast();
    }
}
