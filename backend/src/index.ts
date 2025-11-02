import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase, setupCronJob } from './config';
import { CodeStatsService, UserService, SmartContractService } from './services';
import { User, CodingStats } from './models';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Services
const codeStatsService = new CodeStatsService();
const contractService = new SmartContractService();


// API Routes
app.post('/api/users', async (req, res) => {
  try {
    const { username, github_username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const userId = await UserService.addUser(username, github_username);
    
    // Immediately fetch stats for the new user
    setTimeout(async () => {
      try {
        const stats = await codeStatsService.fetchUserStats(github_username || username);
        if (stats) {
          const completeStats: CodingStats = {
            ...stats,
            user_id: userId,
            fetch_date: new Date().toISOString().split('T')[0]
          };
          
          await UserService.storeUserStats(completeStats);
          await contractService.storeUserStats(completeStats);
          await UserService.updateUserLastFetch(userId);
          
          console.log(`Initial stats fetch completed for user: ${username}`);
        }
      } catch (error) {
        console.error(`Error in initial stats fetch for ${username}:`, error);
      }
    }, 1000);
    
    res.json({ 
      success: true, 
      message: 'User added successfully', 
      userId,
      note: 'Initial stats fetch scheduled'
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Legacy user endpoints (keeping for backwards compatibility)
app.post('/api/users/wallet', async (req, res) => {
  try {
    const { username, wallet_address } = req.body;
    
    if (!username || !wallet_address) {
      return res.status(400).json({ error: 'Username and wallet address are required' });
    }
    
    const userId = await UserService.addUserWithWallet(username, wallet_address);
    
    res.json({ 
      success: true, 
      message: 'User added successfully with wallet', 
      userId 
    });
  } catch (error) {
    console.error('Error adding user with wallet:', error);
    res.status(500).json({ error: 'Failed to add user with wallet' });
  }
});

app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const stats = await UserService.getUserStats(userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.post('/api/fetch-stats/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Get user info
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    try {
      const stats = await codeStatsService.fetchUserStats(user.github_username || user.username);
      
      if (stats) {
        const completeStats: CodingStats = {
          ...stats,
          user_id: userId,
          fetch_date: new Date().toISOString().split('T')[0]
        };
        
        await UserService.storeUserStats(completeStats);
        await contractService.storeUserStats(completeStats);
        await UserService.updateUserLastFetch(userId);
        
        res.json({ 
          success: true, 
          message: 'Stats fetched and stored successfully',
          stats: completeStats
        });
      } else {
        res.status(500).json({ error: 'Failed to fetch stats from Code::Stats' });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  } catch (error) {
    console.error('Error in manual stats fetch:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'XPBets Competition backend is running'
  });
});

// ============ XPBets Competition API Endpoints ============
// TODO: Implement SmartContractService methods for these endpoints

// // Create a new competition
// app.post('/api/competitions', async (req, res) => {
//   try {
//     const { name, description, entryFeeWLD, maxParticipants, durationHours } = req.body;
//     
//     if (!name || !entryFeeWLD || !maxParticipants || !durationHours) {
//       return res.status(400).json({ 
//         error: 'Missing required fields: name, entryFeeWLD, maxParticipants, durationHours' 
//       });
//     }
//
//     const result = await contractService.createCompetition(
//       name,
//       description || '',
//       entryFeeWLD,
//       maxParticipants,
//       durationHours
//     );
//
//     if (result.success) {
//       res.json({
//         success: true,
//         competitionId: result.competitionId,
//         txHash: result.txHash,
//         message: 'Competition created successfully'
//       });
//     } else {
//       res.status(500).json({ error: 'Failed to create competition' });
//     }
//   } catch (error) {
//     console.error('Error creating competition:', error);
//     res.status(500).json({ error: 'Failed to create competition' });
//   }
// });
//
// // Get all active competitions
// app.get('/api/competitions', async (req, res) => {
//   try {
//     const competitions = await contractService.getActiveCompetitions();
//     res.json({ 
//       success: true, 
//       competitions,
//       count: competitions.length 
//     });
//   } catch (error) {
//     console.error('Error fetching competitions:', error);
//     res.status(500).json({ error: 'Failed to fetch competitions' });
//   }
// });
//
// // Get specific competition details
// app.get('/api/competitions/:competitionId', async (req, res) => {
//   try {
//     const competitionId = parseInt(req.params.competitionId);
//     
//     if (isNaN(competitionId)) {
//       return res.status(400).json({ error: 'Invalid competition ID' });
//     }
//
//     const competition = await contractService.getCompetition(competitionId);
//     
//     if (!competition) {
//       return res.status(404).json({ error: 'Competition not found' });
//     }
//
//     // Get participants
//     const participants = await contractService.getParticipants(competitionId);
//
//     res.json({ 
//       success: true, 
//       competition: {
//         ...competition,
//         participants
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching competition:', error);
//     res.status(500).json({ error: 'Failed to fetch competition' });
//   }
// });
//
// // Get competition participants
// app.get('/api/competitions/:competitionId/participants', async (req, res) => {
//   try {
//     const competitionId = parseInt(req.params.competitionId);
//     
//     if (isNaN(competitionId)) {
//       return res.status(400).json({ error: 'Invalid competition ID' });
//     }
//
//     const participants = await contractService.getParticipants(competitionId);
//     
//     res.json({ 
//       success: true, 
//       participants,
//       count: participants.length
//     });
//   } catch (error) {
//     console.error('Error fetching participants:', error);
//     res.status(500).json({ error: 'Failed to fetch participants' });
//   }
// });
//
// // End a competition (admin only)
// app.post('/api/competitions/:competitionId/end', async (req, res) => {
//   try {
//     const competitionId = parseInt(req.params.competitionId);
//     const { winner } = req.body;
//     
//     if (isNaN(competitionId)) {
//       return res.status(400).json({ error: 'Invalid competition ID' });
//     }
//     
//     if (!winner) {
//       return res.status(400).json({ error: 'Winner address is required' });
//     }
//
//     const result = await contractService.endCompetition(competitionId, winner);
//     
//     if (result.success) {
//       res.json({
//         success: true,
//         txHash: result.txHash,
//         message: 'Competition ended successfully'
//       });
//     } else {
//       res.status(500).json({ error: 'Failed to end competition' });
//     }
//   } catch (error) {
//     console.error('Error ending competition:', error);
//     res.status(500).json({ error: 'Failed to end competition' });
//   }
// });
//
// // Get contract information
// app.get('/api/contract/info', async (req, res) => {
//   try {
//     const contractInfo = await contractService.getContractInfo();
//     res.json({ success: true, contractInfo });
//   } catch (error) {
//     console.error('Error fetching contract info:', error);
//     res.status(500).json({ error: 'Failed to fetch contract info' });
//   }
// });
//
// // Get leaderboard (adapted for competitions)
// app.get('/api/leaderboard', async (req, res) => {
//   try {
//     const limit = parseInt(req.query.limit as string) || 100;
//     const leaderboard = await contractService.getLeaderboard(limit);
//     res.json({ success: true, leaderboard, count: leaderboard.length });
//   } catch (error) {
//     console.error('Error fetching leaderboard:', error);
//     res.status(500).json({ error: 'Failed to fetch leaderboard' });
//   }
// });

// Get all users endpoint (legacy compatibility)
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserService.getActiveUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});



// Initialize and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Setup cron job
    setupCronJob(codeStatsService);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 DevRank backend server running on port ${PORT}`);
      console.log(`⏰ Cron job: Stats fetch every 12 hours (00:00 and 12:00 UTC)`);
      console.log(`\n📊 User Management Endpoints:`);
      console.log(`  POST /api/users - Add new user`);
      console.log(`  POST /api/users/wallet - Add new user with wallet address`);
      console.log(`  GET /api/users - Get all active users`);
      console.log(`  GET /api/users/:userId/stats - Get user stats history`);
      console.log(`  POST /api/fetch-stats/:userId - Manually trigger stats fetch`);
      console.log(`\n🔧 Admin Endpoints:`);
      console.log(`  POST /api/admin/update-all-users - Force update all users (manual trigger)`);
      console.log(`\n🏥 System Endpoints:`);
      console.log(`  GET /api/health - Health check`);
      console.log(`\n💡 Note: Competition endpoints are commented out - implement SmartContractService methods to enable`);

    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();