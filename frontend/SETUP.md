# Quick Setup Guide - Worldchain Contract Integration

## 🚀 Getting Started

This guide will help you set up the application to fetch match data directly from the Competition smart contract on Worldchain Mainnet.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Competition contract deployed on Worldchain Mainnet
- Contract address
- WLD Token address
- World ID App ID

---

## ⚙️ Setup Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
# or
pnpm install
```

**Key Dependency**: `viem@2.23.5` (already in package.json)

### 2. Configure Environment Variables

Create or update `.env.local` in the `frontend` directory:

```bash
# World ID & App Configuration (Required)
NEXT_PUBLIC_APP_ID=app_xxxxxxxxxxxx

# Contract Addresses (Required)
NEXT_PUBLIC_WLD_TOKEN_ADDRESS=0x2cFc85d8E48F8EAB294be644d9E25C3030863003
NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS=0xYourContractAddress

# RPC Configuration (Optional - uses public endpoint by default)
NEXT_PUBLIC_WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

### 3. Get an Alchemy API Key (Recommended)

For better performance and reliability:

1. Visit [alchemy.com](https://www.alchemy.com/)
2. Sign up for free account
3. Create new app
4. Select **"World Chain"** as network
5. Copy API key
6. Add to `.env.local`: 
   ```
   NEXT_PUBLIC_WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/v2/YOUR_KEY
   ```

**Note**: Public endpoints work but may have rate limits. Alchemy free tier gives 100k requests/day.

### 4. Verify Contract ABI

The contract ABI is already included at:
```
frontend/src/abi/smartcontract-competitions.json
```

If your contract has a different ABI, replace this file.

### 5. Start Development Server

```bash
npm run dev
```

Application will start at `http://localhost:3000`

---

## ✅ Verification

### Check if it's working:

1. **Open the app**: Navigate to `/challenges`
2. **Open browser console**: Look for logs like:
   ```
   🔗 Fetching matches from contract: 0x...
   📊 Total matches in contract: 3
   ✅ Fetched matches: [...]
   ```
3. **Check Network tab**: Filter by RPC URL, verify calls to Worldchain
4. **View matches**: You should see all matches from the contract

### Common Console Logs

**Success:**
```
🔗 Fetching matches from contract: 0xYourAddress
📊 Total matches in contract: 5
✅ Fetched matches: [Array of matches]
```

**Error:**
```
❌ Error fetching matches from contract: Contract call reverted
```

---

## 🔍 Troubleshooting

### Issue: "Missing required environment variable"

**Solution:**
- Verify all required variables are in `.env.local`
- Restart dev server after adding variables
- Check for typos in variable names

### Issue: "Error fetching matches: Contract call reverted"

**Possible causes:**
- Wrong contract address
- Contract not deployed on Worldchain
- ABI mismatch

**Solutions:**
1. Verify contract address on [Worldscan](https://worldscan.org)
2. Check contract is deployed on Worldchain (Chain ID: 480)
3. Verify ABI matches deployed contract

### Issue: "Network Error" or "RPC Error"

**Possible causes:**
- RPC endpoint down
- Rate limiting
- No internet connection

**Solutions:**
1. Try public RPC endpoint (remove custom RPC URL)
2. Get Alchemy API key for better rate limits
3. Check internet connection
4. Wait a moment and retry

### Issue: "Matches show but participation check fails"

**Possible causes:**
- Wallet address not connected
- Wrong wallet address format

**Solutions:**
1. Ensure wallet is connected via MiniKit
2. Check console for wallet address
3. Verify contract's `isParticipant` function is working

---

## 🏗️ Architecture Overview

```
User Opens /challenges
        ↓
ChallengesView Component
        ↓
useContractMatches() Hook
        ↓
viem publicClient
        ↓
RPC Call → Worldchain Mainnet
        ↓
Competition Contract
        ↓
Returns Match Data
        ↓
Transform to ChallengeData
        ↓
Render in UI
```

---

## 📚 Key Files

### Hooks (Data Fetching)
- `src/hooks/useContractMatches.ts` - Fetch all matches
- `src/hooks/useContractParticipation.ts` - Check participation
- `src/hooks/useContractMatchDetail.ts` - Fetch match details

### Configuration
- `src/config/contracts.ts` - Network & contract config
- `.env.local` - Environment variables (create this)

### Views
- `src/views/Challenges/page.tsx` - Challenges list page
- `src/views/ChallengeDetails/page.tsx` - Challenge detail page

### Utils
- `src/utils/transformMatchData.ts` - Transform contract data for UI

---

## 🔗 Worldchain Network Details

- **Chain ID**: 480
- **Name**: World Chain
- **Type**: OP Stack Layer 2
- **Explorer**: https://worldscan.org
- **Native Token**: ETH
- **RPC (Public)**: https://worldchain-mainnet.g.alchemy.com/public

---

## 📖 Next Steps

1. ✅ Complete setup above
2. 📖 Read [Integration Guide](./WORLDCHAIN_CONTRACT_INTEGRATION.md) for details
3. 📖 Read [Hooks Documentation](./src/hooks/README.md) for usage
4. 🧪 Test the application thoroughly
5. 🚀 Deploy to production

---

## 🆘 Need Help?

1. **Check documentation**:
   - [Full Integration Guide](./WORLDCHAIN_CONTRACT_INTEGRATION.md)
   - [Migration Summary](./MIGRATION_SUMMARY.md)

2. **Check console logs**:
   - Browser console shows detailed logs for debugging
   - Look for 🔗, 📊, ✅, or ❌ emoji prefixes

3. **Verify on blockchain**:
   - Use Worldscan to verify contract state
   - Check if matches exist in contract

4. **Test RPC endpoint**:
   ```bash
   curl -X POST https://worldchain-mainnet.g.alchemy.com/public \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
   ```
   Should return: `{"jsonrpc":"2.0","id":1,"result":"0x1e0"}` (480 in hex)

---

**Setup Time**: ~10 minutes  
**Difficulty**: Easy  
**Status**: ✅ Ready to use
