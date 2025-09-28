# XPBets Competition System

A decentralized competition platform built for World Chain where users can join coding competitions using WLD tokens and World ID verification.

## 🎯 Overview

XPBets implements the exact flow from your diagram:

1. **User calls `joinCompetition(competitionId)`** 
2. **Contract checks WLD balance** ✅
3. **Transfers WLD tokens** from user to contract (after approval) 
4. **WLD is locked in prize pool** 💰
5. **User added to participants array** 👥
6. **Emits `PlayerJoinedCompetition` event** 📡

## 🏗 Architecture

### Core Contract: `XPBetsCompetition.sol`

```solidity
// CORE FUNCTION - Matches your diagram exactly
function joinCompetition(
    uint256 competitionId,
    uint256 root,              // WorldID proof
    uint256 nullifierHash,     // WorldID nullifier  
    uint256[8] calldata proof  // ZK proof
) external {
    // 1. Verify WorldID (human verification)
    // 2. Check WLD balance >= entryAmount  
    // 3. Transfer WLD from user to contract
    // 4. Add user to participants & increase prizePool
    // 5. Emit PlayerJoinedCompetition event
}
```

### Key Features

- **🌍 World Chain Compatible**: Built for World Chain EVM
- **🆔 World ID Integration**: Human verification required
- **💰 WLD Token Support**: Native WLD token integration
- **🏆 Automated Prize Distribution**: Smart prize pool management
- **📊 Comprehensive Events**: Full event tracking for The Graph
- **🔒 Security First**: OpenZeppelin security standards
- **⚡ Gas Optimized**: Efficient batch operations

## 📂 Project Structure

```
contracts/
├── src/
│   ├── XPBetsCompetition.sol      # Main competition contract
│   ├── interfaces/
│   │   └── IWorldID.sol           # WorldID interface
│   └── helpers/
│       └── ByteHasher.sol         # Utility for WorldID
├── script/
│   └── Deploy.s.sol               # Foundry deployment script
├── test/
│   └── XPBetsCompetition.t.sol    # Comprehensive tests
├── foundry.toml                   # Foundry configuration
└── lib/                           # Dependencies (OpenZeppelin, Forge)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd contracts
forge install
```

### 2. Compile Contracts

```bash
forge build
```

### 3. Run Tests

```bash
forge test -vv
```

### 4. Deploy to Testnet

```bash
# Set environment variables
export PRIVATE_KEY=0x...
export WORLD_CHAIN_SEPOLIA_RPC_URL=https://worldchain-sepolia.g.alchemy.com/public

# Deploy to World Chain Sepolia
forge script script/Deploy.s.sol --rpc-url worldchain_sepolia --broadcast --verify
```

## 🔧 Environment Variables

Create a `.env` file:

```bash
# Deployment
PRIVATE_KEY=0x...                    # Deployer private key
TREASURY_ADDRESS=0x...               # Platform treasury address

# Network URLs
WORLD_CHAIN_SEPOLIA_RPC_URL=https://worldchain-sepolia.g.alchemy.com/public
WORLD_CHAIN_MAINNET_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public

# Block Explorer
WORLDSCAN_API_KEY=...               # For contract verification

# Contract Configuration (Optional)
PLATFORM_FEE=500                    # 5% platform fee
MIN_ENTRY_AMOUNT=1000000000000000000 # 1 WLD minimum
WLD_TOKEN_ADDRESS=0x...             # WLD token contract
WORLD_ID_ADDRESS=0x...              # WorldID contract
WORLD_ID_GROUP_ID=1                 # WorldID group
```

## 📋 Contract Interface

### Core Functions

```solidity
// Create a new competition
function createCompetition(
    string calldata name,
    string calldata description,
    uint256 entryAmount,       // Entry fee in WLD
    uint256 durationHours,     // Competition duration
    uint256 maxParticipants    // Max participants
) external returns (uint256 competitionId);

// Join competition (matches your diagram)
function joinCompetition(
    uint256 competitionId,
    uint256 root,              // WorldID merkle root
    uint256 nullifierHash,     // WorldID nullifier
    uint256[8] calldata proof  // WorldID ZK proof
) external;

// Select winner and distribute prizes (owner only)
function selectWinnerAndDistributePrizes(
    uint256 competitionId,
    address winner
) external;
```

### View Functions

```solidity
// Get competition details
function getCompetition(uint256 competitionId) external view returns (...);

// Get participants
function getCompetitionParticipants(uint256 competitionId) external view returns (address[] memory);

// Check if user joined
function hasUserJoined(uint256 competitionId, address user) external view returns (bool);

// Get user's competitions
function getUserCompetitions(address user) external view returns (uint256[] memory);

// Get active competitions
function getActiveCompetitions(uint256 limit) external view returns (uint256[] memory);
```

## 🎮 Usage Examples

### Create Competition

```javascript
const competitionId = await xpBetsContract.createCompetition(
    "Weekly Coding Challenge",        // name
    "Solve algorithm challenges",     // description
    ethers.parseEther("10"),         // 10 WLD entry fee
    168,                             // 7 days (168 hours)
    50                               // max 50 participants
);
```

### Join Competition

```javascript
// 1. First approve WLD tokens
await wldToken.approve(xpBetsAddress, ethers.parseEther("10"));

// 2. Get WorldID proof (from WorldID SDK)
const { proof, merkle_root, nullifier_hash } = await worldID.generateProof({
    signal: userAddress,
    action: "join-competition"
});

// 3. Join competition
await xpBetsContract.joinCompetition(
    competitionId,
    merkle_root,
    nullifier_hash,
    proof
);
```

### Check Results

```javascript
// Get competition details
const competition = await xpBetsContract.getCompetition(competitionId);
console.log({
    participants: competition.participantCount,
    prizePool: ethers.formatEther(competition.prizePool),
    winner: competition.winner,
    completed: competition.prizesDistributed
});
```

## 📊 Events for The Graph

The contract emits comprehensive events for indexing:

```solidity
// When user joins - MATCHES YOUR DIAGRAM
event PlayerJoinedCompetition(
    address indexed user,
    uint256 indexed competitionId,
    uint256 valorWLD           // Exact event name from diagram!
);

// When competition is created
event CompetitionCreated(
    uint256 indexed competitionId,
    string name,
    address indexed creator,
    uint256 entryAmount,
    uint256 startTime,
    uint256 endTime
);

// When winner is selected
event WinnerSelected(
    uint256 indexed competitionId,
    address indexed winner,
    uint256 prizeAmount
);
```

## 🧪 Testing

The contract includes comprehensive tests covering:

- ✅ Competition creation
- ✅ User joining with WorldID verification  
- ✅ WLD token transfers and approvals
- ✅ Prize pool management
- ✅ Winner selection and distribution
- ✅ Edge cases and security scenarios
- ✅ Fuzz testing for robustness

Run tests:

```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run specific test
forge test --match-test test_JoinCompetition

# Run with maximum verbosity
forge test -vvv
```

## 🛡 Security Features

- **OpenZeppelin Standards**: Built on battle-tested contracts
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Secure admin controls
- **WorldID Verification**: Sybil-resistant human verification
- **Nullifier Tracking**: Prevents double-participation
- **Balance Checks**: Comprehensive token balance validation

## 🌐 World Chain Integration

### Testnet Deployment

```bash
forge script script/Deploy.s.sol \
    --rpc-url https://worldchain-sepolia.g.alchemy.com/public \
    --broadcast \
    --verify
```

### Mainnet Deployment

```bash
forge script script/Deploy.s.sol \
    --rpc-url https://worldchain-mainnet.g.alchemy.com/public \
    --broadcast \
    --verify
```

### Contract Addresses

**World Chain Sepolia:**
- WLD Token: `0x163f8C2467924be0ae7B5347228CABF260318753`
- WorldID: `0x11cA3127182f7583EfC416a8771BD4d11Fae4334`

**World Chain Mainnet:**
- WLD Token: `0x163f8C2467924be0ae7B5347228CABF260318753`
- WorldID: `0x163f8C2467924be0ae7B5347228CABF260318753`

## 🔄 Integration Flow

### Frontend Integration

1. **Connect Wallet**: User connects World Chain wallet
2. **WorldID Verification**: Generate WorldID proof
3. **Approve WLD**: User approves WLD spending
4. **Join Competition**: Call `joinCompetition` with proof
5. **Event Listening**: Listen for `PlayerJoinedCompetition` event

### Backend Integration

1. **Event Monitoring**: Monitor competition events
2. **Competition Management**: Create and manage competitions
3. **Winner Selection**: Determine winners based on criteria
4. **Prize Distribution**: Call winner selection function

## 📈 Gas Optimization

The contract is optimized for gas efficiency:

- **Batch Operations**: Support for batch joining (future)
- **Packed Structs**: Efficient storage layout
- **Optimized Loops**: Minimal gas in view functions
- **Event Indexing**: Proper event indexing for queries

## 🎯 Competition Logic

### Competition States

```solidity
enum CompetitionStatus {
    Created,        // Just created
    Active,         // Accepting participants  
    InProgress,     // Started, no more joins
    Ended,          // Ended, awaiting winner
    Completed       // Winner selected, prizes distributed
}
```

### Prize Distribution

- **Winner**: 95% of prize pool (configurable)
- **Platform**: 5% fee (configurable)
- **Refunds**: Available for cancelled competitions

## 🚨 Important Notes

### For Users:
- ✅ Must have WLD tokens and approve spending
- ✅ WorldID verification required (one per user)
- ✅ Cannot join same competition twice
- ✅ Entry fee is locked until competition ends

### For Developers:
- ✅ Owner controls winner selection
- ✅ Platform fee is configurable
- ✅ Emergency functions available
- ✅ Full event logging for indexing

## 📞 Support

For issues or questions:

1. Check the test files for usage examples
2. Review the contract events for integration
3. Test on World Chain Sepolia first
4. Use proper WorldID verification

## 🚀 Deployment Checklist

- [ ] Set correct WLD token address
- [ ] Set correct WorldID contract address  
- [ ] Configure platform fee percentage
- [ ] Set treasury address
- [ ] Test on testnet first
- [ ] Verify contract on block explorer
- [ ] Update frontend with contract address
- [ ] Test complete user flow

---

**Built for World Chain Hackathon** 🌍⚡

This contract implements exactly what's shown in your diagram - a secure, gas-efficient competition system where users join with WLD tokens and WorldID verification!
