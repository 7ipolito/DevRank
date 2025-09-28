// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console} from "@forge-std/Script.sol";
import {XPBetsCompetition} from "../src/XPBetsCompetition.sol";

/**
 * @title XPBets Competition Deployment Script
 * @dev Foundry script for deploying XPBets Competition contract to World Chain
 * @notice Run with: forge script script/Deploy.s.sol --rpc-url worldchain_sepolia --broadcast --verify
 */
contract DeployScript is Script {
    // ============ State Variables ============
    
    XPBetsCompetition public xpBetsCompetition;
    
    address public deployer;
    uint256 public deployerPrivateKey;

    // ============ World Chain Addresses ============
    
    // World Chain Sepolia testnet addresses
    address constant WORLDCHAIN_SEPOLIA_WLD = 0x163f8C2467924be0ae7B5347228CABF260318753;
    address constant WORLDCHAIN_SEPOLIA_WORLD_ID = 0x11cA3127182f7583EfC416a8771BD4d11Fae4334;
    uint256 constant WORLDCHAIN_SEPOLIA_GROUP_ID = 1;
    
    // World Chain mainnet addresses  
    address constant WORLDCHAIN_MAINNET_WLD = 0x163f8C2467924be0ae7B5347228CABF260318753;
    address constant WORLDCHAIN_MAINNET_WORLD_ID = 0x163f8C2467924be0ae7B5347228CABF260318753;
    uint256 constant WORLDCHAIN_MAINNET_GROUP_ID = 1;

    // ============ Setup ============
    
    function setUp() public {
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(deployerPrivateKey);
        
        console.log("==============================================");
        console.log("XPBets Competition Contract Deployment");
        console.log("==============================================");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);
        console.log("==============================================");
    }

    // ============ Main Deployment ============
    
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Get network-specific addresses
        (address wldToken, address worldId, uint256 groupId) = _getNetworkAddresses();
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer); // Default to deployer as treasury
        
        console.log("\n📋 Network Configuration:");
        console.log("   WLD Token:", wldToken);
        console.log("   WorldID:", worldId);
        console.log("   Group ID:", groupId);
        console.log("   Treasury:", treasury);

        // 1. Deploy XPBetsCompetition
        console.log("\n🚀 Deploying XPBetsCompetition...");
        
        xpBetsCompetition = new XPBetsCompetition(
            wldToken,    // WLD token address
            worldId,     // WorldID contract  
            groupId,     // World ID group ID
            treasury     // Treasury address
        );
        
        console.log("   ✅ XPBetsCompetition deployed to:", address(xpBetsCompetition));
        console.log("   - Owner:", xpBetsCompetition.owner());
        console.log("   - WLD Token:", address(xpBetsCompetition.wldToken()));
        console.log("   - World ID:", address(xpBetsCompetition.worldId()));
        console.log("   - Group ID:", xpBetsCompetition.groupId());

        // 2. Configure contract
        console.log("\n⚙️ Configuring contract...");
        _configureContract();

        // 3. Verify deployment
        console.log("\n🔍 Verifying deployment...");
        _verifyDeployment();

        // Stop broadcasting
        vm.stopBroadcast();

        // 4. Save deployment info
        _saveDeploymentInfo();

        console.log("\n==============================================");
        console.log("🎉 Deployment completed successfully!");
        console.log("==============================================");
        _printDeploymentSummary();
    }

    // ============ Network Configuration ============
    
    function _getNetworkAddresses() internal view returns (address wldToken, address worldId, uint256 groupId) {
        if (block.chainid == 4801) {
            // World Chain Sepolia testnet
            wldToken = WORLDCHAIN_SEPOLIA_WLD;
            worldId = WORLDCHAIN_SEPOLIA_WORLD_ID;
            groupId = WORLDCHAIN_SEPOLIA_GROUP_ID;
        } else if (block.chainid == 480) {
            // World Chain mainnet
            wldToken = WORLDCHAIN_MAINNET_WLD;
            worldId = WORLDCHAIN_MAINNET_WORLD_ID;
            groupId = WORLDCHAIN_MAINNET_GROUP_ID;
        } else {
            // Local/other networks - use environment variables or defaults
            wldToken = vm.envOr("WLD_TOKEN_ADDRESS", WORLDCHAIN_SEPOLIA_WLD);
            worldId = vm.envOr("WORLD_ID_ADDRESS", WORLDCHAIN_SEPOLIA_WORLD_ID);
            groupId = vm.envOr("WORLD_ID_GROUP_ID", WORLDCHAIN_SEPOLIA_GROUP_ID);
        }
    }

    // ============ Configuration ============
    
    function _configureContract() internal {
        // Set platform fee if specified (default is 5%)
        uint256 platformFee = vm.envOr("PLATFORM_FEE", uint256(500)); // 5%
        if (platformFee != 500) {
            xpBetsCompetition.setPlatformFee(platformFee);
            console.log("   ✅ Platform fee set to:", platformFee / 100, "%");
        }
        
        // Set min entry amount if specified
        uint256 minEntry = vm.envOr("MIN_ENTRY_AMOUNT", uint256(1 ether)); // 1 WLD
        if (minEntry != 1 ether) {
            xpBetsCompetition.setMinEntryAmount(minEntry);
            console.log("   ✅ Min entry amount set to:", minEntry / 1 ether, "WLD");
        }
        
        console.log("   ✅ Contract configured successfully");
    }

    // ============ Verification ============
    
    function _verifyDeployment() internal view {
        // Verify contract deployment
        require(address(xpBetsCompetition) != address(0), "XPBetsCompetition deployment failed");
        require(xpBetsCompetition.owner() == deployer, "Owner incorrect");
        
        // Get contract info
        (
            address wldTokenAddress,
            address worldIdAddress,
            uint256 worldIdGroupId,
            uint256 totalCompetitions,
            uint256 platformFee,
            uint256 minEntry,
            uint256 maxParticipantsLimit,
            address treasuryAddress
        ) = xpBetsCompetition.getContractInfo();
        
        require(totalCompetitions == 0, "Initial competition count should be 0");
        require(wldTokenAddress != address(0), "WLD token address invalid");
        require(worldIdAddress != address(0), "WorldID address invalid");
        
        console.log("   ✅ Contract verification passed");
        console.log("   - Total Competitions:", totalCompetitions);
        console.log("   - Platform Fee:", platformFee / 100, "%");
        console.log("   - Min Entry:", minEntry / 1 ether, "WLD");
        console.log("   - Max Participants:", maxParticipantsLimit);
        console.log("   - Treasury:", treasuryAddress);
    }

    // ============ Deployment Info ============
    
    function _saveDeploymentInfo() internal {
        // Create deployment info JSON
        string memory networkName = _getNetworkName();
        
        string memory deploymentInfo = string.concat(
            "{\n",
            '  "network": "', networkName, '",\n',
            '  "chainId": ', vm.toString(block.chainid), ',\n',
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "blockNumber": ', vm.toString(block.number), ',\n',
            '  "timestamp": ', vm.toString(block.timestamp), ',\n',
            '  "contracts": {\n',
            '    "XPBetsCompetition": "', vm.toString(address(xpBetsCompetition)), '"\n',
            '  },\n',
            '  "configuration": {\n',
            '    "platformFee": "500",\n',
            '    "minEntryAmount": "1000000000000000000",\n',
            '    "maxParticipants": "100"\n',
            '  },\n',
            '  "gasUsed": {\n',
            '    "total": "estimated ~4.2M",\n',
            '    "xpBetsCompetition": "~4.2M"\n',
            '  }\n',
            "}"
        );
        
        // Write to file (if running locally)
        if (block.chainid == 31337) {
            vm.writeFile("./deployment-local.json", deploymentInfo);
            console.log("   💾 Deployment info saved to: deployment-local.json");
        }
    }

    function _printDeploymentSummary() internal view {
        console.log("📋 Deployment Summary:");
        console.log("   Network:", _getNetworkName());
        console.log("   Chain ID:", block.chainid);
        console.log("   Deployer:", deployer);
        console.log("   Block Number:", block.number);
        console.log("");
        console.log("📄 Contract Address:");
        console.log("   XPBetsCompetition:", address(xpBetsCompetition));
        console.log("");
        console.log("🔧 Next Steps:");
        console.log("   1. Update your .env file with contract address:");
        console.log("      XPBETS_CONTRACT_ADDRESS=", vm.toString(address(xpBetsCompetition)));
        console.log("   2. Update backend to use the new contract");
        console.log("   3. Test contract integration");
        console.log("   4. Create first competition for testing");
        console.log("");
        console.log("🌐 Block Explorer:");
        console.log("   Contract:", _getExplorerUrl(address(xpBetsCompetition)));
        console.log("");
        console.log("🎮 Usage Examples:");
        console.log("   - Create competition: createCompetition(name, desc, entryAmount, duration, maxParticipants)");
        console.log("   - Join competition: joinCompetition(competitionId, root, nullifierHash, proof)");
        console.log("   - Select winner: selectWinnerAndDistributePrizes(competitionId, winner)");
        console.log("");
        console.log("💡 Important Notes:");
        console.log("   - Users must approve WLD tokens before joining competitions");
        console.log("   - WorldID verification is required for joining");
        console.log("   - Only owner can select winners and distribute prizes");
    }

    // ============ Helper Functions ============
    
    function _getNetworkName() internal view returns (string memory) {
        if (block.chainid == 480) return "worldchain";
        if (block.chainid == 4801) return "worldchain-sepolia";
        if (block.chainid == 31337) return "localhost";
        if (block.chainid == 1) return "ethereum";
        return "unknown";
    }
    
    function _getExplorerUrl(address contractAddr) internal view returns (string memory) {
        if (block.chainid == 480) {
            return string.concat("https://worldchain.blockscout.com/address/", vm.toString(contractAddr));
        }
        if (block.chainid == 4801) {
            return string.concat("https://worldchain-sepolia.blockscout.com/address/", vm.toString(contractAddr));
        }
        return string.concat("Local network - address: ", vm.toString(contractAddr));
    }
}

/**
 * @title XPBets Local Testing Script  
 * @dev Script for local testing and development with mock WLD token
 * @notice Run with: forge script script/Deploy.s.sol:LocalTestScript --fork-url http://localhost:8545 --broadcast
 */
contract LocalTestScript is DeployScript {
    function run() external override {
        // Use different private key for local testing
        deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        deployer = vm.addr(deployerPrivateKey);
        
        console.log("🧪 Local Testing Mode");
        console.log("Deployer:", deployer);
        
        // Run deployment
        super.run();
        
        // Add some test data
        _addTestData();
    }
    
    function _addTestData() internal {
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("\n🧪 Adding test data...");
        
        // Create a test competition
        uint256 competitionId = xpBetsCompetition.createCompetition(
            "Test Programming Challenge",         // name
            "A test competition for developers",  // description
            1 ether,                             // 1 WLD entry fee
            72,                                  // 72 hours (3 days)
            10                                   // max 10 participants
        );
        
        console.log("   ✅ Test competition created with ID:", competitionId);
        
        // Get competition details
        (
            uint256 id,
            string memory name,
            string memory description,
            address creator,
            uint256 entryAmount,
            uint256 startTime,
            uint256 endTime,
            uint256 maxParticipantsCount,
            XPBetsCompetition.CompetitionStatus status,
            uint256 participantCount,
            uint256 prizePool,
            address winner,
            bool prizesDistributed
        ) = xpBetsCompetition.getCompetition(competitionId);
        
        console.log("   - Name:", name);
        console.log("   - Entry Fee:", entryAmount / 1 ether, "WLD");
        console.log("   - Max Participants:", maxParticipantsCount);
        console.log("   - Current Participants:", participantCount);
        console.log("   - Status:", uint256(status));
        console.log("   - Prize Pool:", prizePool / 1 ether, "WLD");
        
        vm.stopBroadcast();
    }
}