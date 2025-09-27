import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase, db } from './database';
import { CodeStatsService, CodingStats } from './codestats';
import { SmartContractService } from './smart-contract';
import { addUser, getActiveUsers, storeUserStats, updateUserLastFetch, User} from './user';
import { setupCronJob } from './cron';
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
    
    const userId = await addUser(username, github_username);
    
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
          
          await storeUserStats(completeStats);
          await contractService.storeUserStats(completeStats);
          await updateUserLastFetch(userId);
          
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

app.get('/api/users', async (req, res) => {
  try {
    const users = await getActiveUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:userId/stats', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  db.all(
    'SELECT * FROM coding_stats WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
    [userId],
    (err, rows: any[]) => {
      if (err) {
        console.error('Error fetching user stats:', err.message);
        res.status(500).json({ error: 'Failed to fetch stats' });
      } else {
        const stats = rows.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          fetch_date: row.fetch_date,
          commits_count: row.commits_count,
          repos_count: row.repos_count,
          total_stars: row.total_stars,
          created_at: row.created_at,
          languages: JSON.parse(row.languages || '{}'),
          contributions: JSON.parse(row.contributions || '{}')
        }));
        res.json({ success: true, stats });
      }
    }
  );
});

app.post('/api/fetch-stats/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user info
    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user: User) => {
      if (err) {
        console.error('Error fetching user:', err.message);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      
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
          
          await storeUserStats(completeStats);
          await contractService.storeUserStats(completeStats);
          await updateUserLastFetch(userId);
          
          res.json({ 
            success: true, 
            message: 'Stats fetched and stored successfully',
            stats: completeStats
          });
        } else {
          res.status(500).json({ error: 'Failed to fetch stats from GitHub' });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
      }
    });
  } catch (error) {
    console.error('Error in manual stats fetch:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Initialize and start server
async function startServer() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    const fs = require('fs');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize database
    await initializeDatabase();
    
    // Setup cron job
    setupCronJob(codeStatsService);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 DevRank backend server running on port ${PORT}`);
      console.log(`⏰ Cron job: Daily stats fetch at 2:00 AM UTC`);
      console.log(`\nAPI Endpoints:`);
      console.log(`  POST /api/users - Add new user`);
      console.log(`  GET /api/users - Get all active users`);
      console.log(`  GET /api/users/:userId/stats - Get user stats history`);
      console.log(`  POST /api/fetch-stats/:userId - Manually trigger stats fetch for user`);
      console.log(`  GET /api/health - Health check`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down gracefully...');
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start the server
startServer();
