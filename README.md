# 🏆 DevRank

**DevRank** is a gamified developer productivity platform where coding activity becomes measurable, social, and competitive.  
We integrate with [Code::Stats](https://codestats.net) (via its IDE extensions like VS Code, Cursor, JetBrains, etc.) to track daily coding activity and then bring this data on-chain, enabling **verifiable coding competitions and bets** between developers.

---

## ✨ Features

- **Automatic Coding Stats**
  - Developers install the Code::Stats plugin in their preferred IDE (VS Code, Cursor, JetBrains, Vim, etc.).
  - We fetch coding stats (time spent, XP earned, language breakdowns) daily via the Code::Stats API.

- **On-Chain Leaderboards**
  - Daily and weekly snapshots of developer stats are stored on-chain.
  - Transparent, verifiable rankings that anyone can inspect.

- **Developer Competitions**
  - Create coding competitions with friends or teammates.
  - Bet on who will code the most lines, accumulate the most XP, or spend the most time in a specific language.
  - Track progress in real-time with on-chain checkpoints.

- **World ID Verification**
  - Competitions are **Sybil-resistant**.
  - Only verified humans (via [World ID](https://worldcoin.org/world-id)) can join.
  - Ensures fair play and opens up competitions to the massive user base of the [World App](https://worldcoin.org/world-app).

- **Miniapp Integration**
  - Exposed as a **World App miniapp**, leveraging its existing reach.
  - Developers discover and join competitions directly inside World App.
  - Boosts adoption through visibility in a widely used Web3 identity wallet.

---

## 🚀 How It Works

1. **Connect your IDE**
   - Install the [Code::Stats plugin](https://codestats.net/#install) in your editor.
   - Link your Code::Stats username in the DevRank app.

2. **Fetch & Verify Stats**
   - Our backend fetches daily coding stats via the Code::Stats API.
   - Stats are checkpointed and submitted to the blockchain.

3. **Create or Join Competitions**
   - Define competition parameters:
     - 📈 Metric (total XP, coding hours, streak length, per-language XP).
     - ⏳ Duration (daily, weekly, monthly).
     - 💰 Stakes (optional, bet against friends).
   - Invite friends to join via wallet address or World ID.

4. **World ID Gatekeeping**
   - Users prove they are humans using World ID.
   - Bots and fake accounts are prevented from joining.

5. **On-Chain Leaderboards**
   - Leaderboards are computed from on-chain data.
   - Everyone can verify competition results independently.

6. **Rewards & Payouts**
   - Winners claim prizes, NFTs, or tokenized rewards based on competition results.
   - Optionally integrate automated prize pools or DAO-governed competitions.

---

## ⚙️ User Setup

Getting started with DevRank is simple:

1. **Create a Code::Stats account**  
   - Visit [Code::Stats](https://codestats.net).  
   - Sign up for a free account.
   - Make sure its the same username as ur world username so miniapp successfully link accounts.
   - Add ur machine and get ur api key
  
     <img width="1280" height="444" alt="image" src="https://github.com/user-attachments/assets/c5248ee0-919f-4d49-be23-855922d9ed19" />
     <img width="1280" height="505" alt="image" src="https://github.com/user-attachments/assets/b03028bd-952b-4e3c-89a3-a0b98483de7a" />


2. **Install the Code::Stats extension in your IDE**  
   - For [VS Code](https://marketplace.visualstudio.com/items?itemName=riidom.codestats-vscode) or [Cursor](https://cursor.sh/), install the extension and log in with your Code::Stats API key.  
   - For other editors (IntelliJ, JetBrains, Vim, etc.), check [the full list of supported plugins](https://codestats.net/#install).

     <img width="892" height="860" alt="image" src="https://github.com/user-attachments/assets/fbea01ce-2c59-4a29-a6be-2d7207e20353" />


3. **Start coding**  
   - Your coding activity (XP, time, languages) will automatically sync to your Code::Stats account in the background.  

4. **Log in to DevRank**  
   - Connect your wallet and verify with World ID in our app.  
   - Link your Code::Stats username.  
   - From here, your daily stats will be fetched, checkpointed, and included in leaderboards and competitions.  

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + Cron Jobs  
  (fetch Code::Stats stats, checkpoint them, push to contracts)
- **Contracts**: Solidity (Foundry toolchain)  
  (store checkpoints, manage competitions, handle rewards)
- **Identity**: [World ID](https://worldcoin.org/world-id)  
  (human verification + World App miniapp integration)
- **Frontend**: React / Next.js miniapp  
  (competition creation, leaderboard visualization)
- **Indexing**: The Graph   
  (for efficient leaderboard queries)

---

## Link to deployments/demo

1. **World App Mini-app**: [https://world.org/mini-app?app_id=app_12d5c832010babfc7984dfaef82f27ec](https://world.org/mini-app?app_id=app_12d5c832010babfc7984dfaef82f27ec)
2. **Loom demo link**: https://www.loom.com/share/d01d20f20ebc4a8e81c1c98543811bc1
3. **Deployment link**: https://worldscan.org/address/0x8471C05150f72eA45fb71Cbae6961EAC44F74584
