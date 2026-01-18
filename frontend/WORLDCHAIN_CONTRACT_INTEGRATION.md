# Worldchain Contract Integration Guide

This document explains how the application fetches match data directly from the Competition smart contract on Worldchain Mainnet using **viem** instead of using a subgraph.

## 📋 Overview

The application now reads match data directly from the blockchain using:
- **viem** - TypeScript interface for Ethereum
- **Worldchain Mainnet** (Chain ID: 480) - OP Stack L2 with World ID integration
- Direct RPC calls to the Competition contract

## 🌐 Worldchain Mainnet Configuration

### Network Details
- **Chain ID**: 480
- **Name**: World Chain
- **Type**: OP Stack Layer 2
- **Block Explorer**: https://worldscan.org
- **RPC URL**: Configurable via environment variable

### RPC Endpoints

You can use several RPC providers:

1. **Alchemy** (Recommended for production):
   ```
   https://worldchain-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   ```

2. **Dwellir**:
   ```
   https://api-worldchain-mainnet.n.dwellir.com/YOUR_API_KEY
   ```

3. **Public Endpoint** (for development only):
   ```
   https://worldchain-mainnet.g.alchemy.com/public
   ```

## 🔧 Environment Setup

Add the following to your `.env.local` file:

```bash
# Required: World ID & Contract Addresses
NEXT_PUBLIC_APP_ID=your_app_id
NEXT_PUBLIC_WLD_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS=0x...

# RPC Configuration (optional - uses public endpoint by default)
NEXT_PUBLIC_WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/v2/YOUR_KEY

# Legacy (no longer needed)
# NEXT_PUBLIC_SUBGRAPH_URL=...
```

### Getting an Alchemy API Key

1. Go to [Alchemy](https://www.alchemy.com/)
2. Create a free account
3. Create a new app and select "World Chain" as the network
4. Copy your API key and add it to the RPC URL

## 📁 Architecture

### New Files Created

1. **`src/config/contracts.ts`** - Updated with Worldchain configuration
2. **`src/hooks/useContractMatches.ts`** - Fetches all matches from contract
3. **`src/hooks/useContractParticipation.ts`** - Checks user participation
4. **`src/abi/smartcontract-competitions.json`** - Contract ABI

### Files Removed

1. ~~`src/hooks/useMatchData.ts`~~ - Old subgraph implementation
2. ~~`src/hooks/useParticipation.ts`~~ - Old subgraph implementation

### Files Updated

1. **`src/views/Challenges/page.tsx`** - Uses new contract hooks
2. **`src/utils/transformMatchData.ts`** - Updated for contract data types

## 🎯 Contract Functions Used

### Reading Match Data

The contract exposes the following view functions:

```solidity
// Get total number of matches
function matchCount() public view returns (uint256);

// Get match details by index
function matches(uint256 index) public view returns (
    uint256 id,
    string name,
    uint256 stake,
    uint256 startTime,
    uint256 durationDays,
    bool active
);

// Get participant count for a match
function getParticipantCount(uint256 matchId) public view returns (uint256);

// Check if user is participating
function isParticipant(uint256 matchId, address user) public view returns (bool);

// Get all participants of a match
function getParticipants(uint256 matchId) public view returns (address[]);
```

## 🔌 Usage Examples

### Fetching All Matches

```tsx
import { useContractMatches } from '@/hooks/useContractMatches';

function MyComponent() {
  const { matches, loading, error, refetch } = useContractMatches();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {matches.map(match => (
        <div key={match.id.toString()}>
          <h3>{match.name}</h3>
          <p>Participants: {match.participantCount}</p>
          <p>Status: {match.active ? 'Active' : 'Completed'}</p>
        </div>
      ))}
    </div>
  );
}
```

### Checking User Participation

```tsx
import { useIsParticipating } from '@/hooks/useContractParticipation';

function ChallengeCard({ matchId, userAddress }) {
  const { isParticipating, loading } = useIsParticipating(
    matchId,
    userAddress
  );

  if (loading) return <div>Checking...</div>;

  return (
    <div>
      {isParticipating ? (
        <button disabled>Already Joined</button>
      ) : (
        <button>Join Challenge</button>
      )}
    </div>
  );
}
```

### Getting Match Participants

```tsx
import { useMatchParticipants } from '@/hooks/useContractParticipation';

function ParticipantsList({ matchId }) {
  const { participants, loading, error } = useMatchParticipants(matchId);

  if (loading) return <div>Loading participants...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Participants ({participants.length})</h3>
      <ul>
        {participants.map(address => (
          <li key={address}>{address}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🚀 How It Works

### 1. Configuration

The Worldchain network is configured in `src/config/contracts.ts`:

```typescript
import { defineChain } from 'viem';

export const worldchain = defineChain({
  id: 480,
  name: 'World Chain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_WORLDCHAIN_RPC_URL] },
  },
  // ... other config
});
```

### 2. Public Client

A singleton viem public client is created for read-only operations:

```typescript
import { createPublicClient, http } from 'viem';
import { worldchain } from '@/config/contracts';

const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(),
});
```

### 3. Reading Contract State

Contract functions are called using `readContract`:

```typescript
const matchCount = await publicClient.readContract({
  address: COMPETITION_CONTRACT_ADDRESS,
  abi: competitionAbi,
  functionName: 'matchCount',
});
```

### 4. Batch Fetching

Multiple matches are fetched in parallel using `Promise.all`:

```typescript
const matchPromises = [];
for (let i = 0n; i < matchCount; i++) {
  matchPromises.push(fetchMatchData(i));
}
const matches = await Promise.all(matchPromises);
```

## 📊 Data Flow

```
User Opens Challenges Page
         ↓
useContractMatches() hook
         ↓
createPublicClient (viem)
         ↓
RPC Call → Worldchain Mainnet
         ↓
Contract: matchCount()
         ↓
Contract: matches(i) for each match
         ↓
Contract: getParticipantCount(i)
         ↓
Transform to ChallengeData format
         ↓
Display in UI
```

## ⚡ Performance Considerations

### Advantages of Direct Contract Calls

✅ **No dependency on external indexers**
✅ **Always up-to-date data** (real-time from blockchain)
✅ **Simpler architecture** (no subgraph deployment needed)
✅ **Full control** over data fetching logic

### Potential Limitations

⚠️ **More RPC calls** - Fetching N matches requires N+1 calls
⚠️ **No historical queries** - Can't easily query past events
⚠️ **Rate limiting** - Public RPC endpoints may have limits
⚠️ **Slower for large datasets** - Consider pagination for 100+ matches

### Optimization Tips

1. **Use a paid RPC provider** (Alchemy, Infura) for better rate limits
2. **Implement caching** - Cache results in React state or local storage
3. **Add pagination** - Fetch matches in batches if there are many
4. **Use multicall** - Batch multiple read calls into one (already supported via viem)

## 🔍 Debugging

### Enable Console Logs

The hooks include detailed console logs:

```typescript
console.log('🔗 Fetching matches from contract:', contractAddress);
console.log('📊 Total matches:', matchCount);
console.log('✅ Fetched matches:', matches);
```

### Common Issues

**Issue**: "Error fetching matches: Contract call reverted"
**Solution**: Check that the contract address is correct and deployed on Worldchain

**Issue**: "RPC Error: Too Many Requests"
**Solution**: Use a paid RPC endpoint or reduce the frequency of calls

**Issue**: "Error: Missing environment variable"
**Solution**: Ensure all required variables are set in `.env.local`

## 🧪 Testing

You can test the integration by:

1. **Check Network**: Verify Worldchain config in browser console
2. **Monitor RPC Calls**: Open Network tab in DevTools, filter by RPC URL
3. **Test with Console**: Use the browser console to test viem directly

```javascript
// In browser console
import { createPublicClient, http } from 'viem';
import { worldchain } from '@/config/contracts';

const client = createPublicClient({
  chain: worldchain,
  transport: http(),
});

// Test fetching match count
const count = await client.readContract({
  address: '0x...',
  abi: [...],
  functionName: 'matchCount',
});
console.log('Match count:', count);
```

## 📚 Additional Resources

- [viem Documentation](https://viem.sh/)
- [Worldchain Docs](https://docs.world.org/)
- [Alchemy Worldchain Guide](https://docs.alchemy.com/docs/world-chain)
- [OP Stack RPC Methods](https://docs.optimism.io/builders/node-operators/json-rpc)

## 🔄 Migration from Subgraph

If you need to migrate back or compare:

### Before (Subgraph)
```typescript
import { useMatchData } from '@/hooks/useMatchData';

const { matches } = useMatchData();
// Returns: GraphQL Match[] with nested participants
```

### After (Contract)
```typescript
import { useContractMatches } from '@/hooks/useContractMatches';

const { matches } = useContractMatches();
// Returns: ContractMatch[] with participantCount
```

The data transformation layer (`transformMatchData.ts`) ensures both return the same `ChallengeData[]` format for the UI.

---

**Last Updated**: January 2026
**Version**: 1.0.0
