# 🚀 Quick Start - Worldchain Integration

## ✅ What's Done

Your app now fetches match data directly from Worldchain Mainnet using viem!

## 🎯 What You Need to Do (5 minutes)

### Step 1: Create Environment File

```bash
cd frontend
touch .env.local
```

### Step 2: Add These Variables to `.env.local`

```bash
# Copy from ENV_TEMPLATE.txt and fill in your values:
NEXT_PUBLIC_APP_ID=app_staging_xxxxxxxxxxxx
NEXT_PUBLIC_WLD_TOKEN_ADDRESS=0x2cFc85d8E48F8EAB294be644d9E25C3030863003
NEXT_PUBLIC_COMPETITION_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

### Step 3: Run the App

```bash
npm install
npm run dev
```

### Step 4: Verify It Works

1. Open http://localhost:3000/challenges
2. Open browser console (F12)
3. Look for: `🔗 Fetching matches from contract`
4. Matches should load from blockchain!

## 📚 Full Documentation

- **SETUP.md** - Detailed setup guide
- **CONTRACT_INTEGRATION_README.md** - Complete overview
- **WORLDCHAIN_CONTRACT_INTEGRATION.md** - Technical details
- **ENV_TEMPLATE.txt** - Environment variable template

## 🆘 Problems?

Check SETUP.md for troubleshooting!

---

**That's it!** Your app is ready to use Worldchain Mainnet. 🎉
