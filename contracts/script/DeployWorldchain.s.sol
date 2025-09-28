// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Competition.sol";

contract DeployWorldchainScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Competition contract with deployer as platform
        Competition competition = new Competition(deployer);
        
        console.log("Competition contract deployed to:", address(competition));
        console.log("Platform address:", competition.platform());
        console.log("Minimum stake:", competition.MIN_STAKE());
        
        vm.stopBroadcast();
    }
}
