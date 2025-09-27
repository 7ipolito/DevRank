"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const sqlite3_1 = require("sqlite3");
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Database setup
const dbPath = path_1.default.join(__dirname, '../data/devrank.db');
let db;
// Initialize database
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3_1.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database.');
            // Create tables
            const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          github_username TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_fetch DATETIME,
          is_active BOOLEAN DEFAULT 1
        )
      `;
            const createStatsTable = `
        CREATE TABLE IF NOT EXISTS coding_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          fetch_date DATE NOT NULL,
          commits_count INTEGER DEFAULT 0,
          repos_count INTEGER DEFAULT 0,
          languages TEXT, -- JSON string
          total_stars INTEGER DEFAULT 0,
          contributions TEXT, -- JSON string with detailed stats
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `;
            db.run(createUsersTable, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                    reject(err);
                    return;
                }
                db.run(createStatsTable, (err) => {
                    if (err) {
                        console.error('Error creating stats table:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('Database tables created successfully.');
                    resolve();
                });
            });
        });
    });
}
// Mock GitHub API service
class GitHubStatsService {
    constructor() {
        this.baseUrl = 'https://api.github.com';
        // Real GitHub API implementation (commented out for now)
        /*
        async fetchUserStats(username: string): Promise<CodingStats | null> {
          try {
            const [userResponse, reposResponse] = await Promise.all([
              axios.get(`${this.baseUrl}/users/${username}`, {
                headers: {
                  'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json'
                }
              }),
              axios.get(`${this.baseUrl}/users/${username}/repos?per_page=100`, {
                headers: {
                  'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json'
                }
              })
            ]);
            
            const repos = reposResponse.data;
            const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
            
            // Fetch language statistics
            const languages: Record<string, number> = {};
            for (const repo of repos.slice(0, 10)) { // Limit to avoid rate limiting
              try {
                const langResponse = await axios.get(repo.languages_url, {
                  headers: {
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                  }
                });
                
                Object.entries(langResponse.data).forEach(([lang, bytes]) => {
                  languages[lang] = (languages[lang] || 0) + (bytes as number);
                });
              } catch (error) {
                console.error(`Error fetching languages for repo ${repo.name}:`, error);
              }
            }
            
            return {
              commits_count: repos.length, // Approximation
              repos_count: repos.length,
              languages,
              total_stars: totalStars,
              contributions: {
                total_commits: repos.length * 10, // Rough estimate
                streak_days: Math.floor(Math.random() * 30) + 1,
                avg_commits_per_day: repos.length * 10 / 365,
              }
            } as CodingStats;
          } catch (error) {
            console.error(`Error fetching GitHub stats for ${username}:`, error);
            return null;
          }
        }
        */
    }
    async fetchUserStats(username) {
        try {
            console.log(`Fetching GitHub stats for user: ${username}`);
            // In a real implementation, you would make actual GitHub API calls
            // For now, we'll generate mock data
            const mockStats = {
                commits_count: Math.floor(Math.random() * 100) + 10,
                repos_count: Math.floor(Math.random() * 20) + 5,
                languages: {
                    'TypeScript': Math.floor(Math.random() * 50000) + 10000,
                    'Python': Math.floor(Math.random() * 30000) + 5000,
                    'JavaScript': Math.floor(Math.random() * 40000) + 8000,
                    'Go': Math.floor(Math.random() * 20000) + 2000,
                },
                total_stars: Math.floor(Math.random() * 500) + 10,
                contributions: {
                    total_commits: Math.floor(Math.random() * 1000) + 100,
                    streak_days: Math.floor(Math.random() * 30) + 1,
                    avg_commits_per_day: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
                }
            };
            console.log(`Successfully fetched stats for ${username}:`, mockStats);
            return mockStats;
        }
        catch (error) {
            console.error(`Error fetching stats for ${username}:`, error);
            return null;
        }
    }
}
// Mock Smart Contract Service
class SmartContractService {
    async storeUserStats(stats) {
        try {
            console.log('Storing stats to smart contract:', {
                user_id: stats.user_id,
                commits: stats.commits_count,
                repos: stats.repos_count,
                stars: stats.total_stars
            });
            // Mock smart contract interaction
            // In real implementation, this would interact with Starknet/Cairo contracts
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
            console.log('Successfully stored stats to smart contract');
            return true;
        }
        catch (error) {
            console.error('Error storing stats to smart contract:', error);
            return false;
        }
    }
}
// Services
const githubService = new GitHubStatsService();
const contractService = new SmartContractService();
// Database helper functions
function addUser(username, github_username) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO users (username, github_username) VALUES (?, ?)');
        stmt.run([username, github_username || username], function (err) {
            if (err) {
                console.error('Error adding user:', err.message);
                reject(err);
            }
            else {
                console.log(`User ${username} added with ID: ${this.lastID}`);
                resolve(this.lastID);
            }
        });
        stmt.finalize();
    });
}
function getActiveUsers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users WHERE is_active = 1', (err, rows) => {
            if (err) {
                console.error('Error fetching active users:', err.message);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
function storeUserStats(stats) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
      INSERT INTO coding_stats 
      (user_id, fetch_date, commits_count, repos_count, languages, total_stars, contributions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const today = new Date().toISOString().split('T')[0];
        stmt.run([
            stats.user_id,
            today,
            stats.commits_count,
            stats.repos_count,
            JSON.stringify(stats.languages),
            stats.total_stars,
            JSON.stringify(stats.contributions)
        ], function (err) {
            if (err) {
                console.error('Error storing user stats:', err.message);
                reject(err);
            }
            else {
                console.log(`Stats stored for user ${stats.user_id}`);
                resolve();
            }
        });
        stmt.finalize();
    });
}
function updateUserLastFetch(userId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('UPDATE users SET last_fetch = ? WHERE id = ?');
        stmt.run([new Date().toISOString(), userId], function (err) {
            if (err) {
                console.error('Error updating user last fetch:', err.message);
                reject(err);
            }
            else {
                resolve();
            }
        });
        stmt.finalize();
    });
}
// Cron job function to fetch stats for all active users
async function fetchStatsForAllUsers() {
    try {
        console.log('Starting daily stats fetch for all users...');
        const users = await getActiveUsers();
        for (const user of users) {
            try {
                const stats = await githubService.fetchUserStats(user.github_username || user.username);
                if (stats) {
                    // Add user_id and fetch_date
                    const completeStats = {
                        ...stats,
                        user_id: user.id,
                        fetch_date: new Date().toISOString().split('T')[0]
                    };
                    // Store in database
                    await storeUserStats(completeStats);
                    // Store in smart contract
                    await contractService.storeUserStats(completeStats);
                    // Update last fetch time
                    await updateUserLastFetch(user.id);
                    console.log(`Successfully processed stats for user: ${user.username}`);
                }
            }
            catch (error) {
                console.error(`Error processing stats for user ${user.username}:`, error);
            }
        }
        console.log('Completed daily stats fetch for all users.');
    }
    catch (error) {
        console.error('Error in fetchStatsForAllUsers:', error);
    }
}
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
                const stats = await githubService.fetchUserStats(github_username || username);
                if (stats) {
                    const completeStats = {
                        ...stats,
                        user_id: userId,
                        fetch_date: new Date().toISOString().split('T')[0]
                    };
                    await storeUserStats(completeStats);
                    await contractService.storeUserStats(completeStats);
                    await updateUserLastFetch(userId);
                    console.log(`Initial stats fetch completed for user: ${username}`);
                }
            }
            catch (error) {
                console.error(`Error in initial stats fetch for ${username}:`, error);
            }
        }, 1000);
        res.json({
            success: true,
            message: 'User added successfully',
            userId,
            note: 'Initial stats fetch scheduled'
        });
    }
    catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Failed to add user' });
    }
});
app.get('/api/users', async (req, res) => {
    try {
        const users = await getActiveUsers();
        res.json({ success: true, users });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
app.get('/api/users/:userId/stats', (req, res) => {
    const userId = parseInt(req.params.userId);
    db.all('SELECT * FROM coding_stats WHERE user_id = ? ORDER BY created_at DESC LIMIT 30', [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching user stats:', err.message);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
        else {
            const stats = rows.map((row) => ({
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
    });
});
app.post('/api/fetch-stats/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        // Get user info
        db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
            if (err) {
                console.error('Error fetching user:', err.message);
                return res.status(500).json({ error: 'Failed to fetch user' });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            try {
                const stats = await githubService.fetchUserStats(user.github_username || user.username);
                if (stats) {
                    const completeStats = {
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
                }
                else {
                    res.status(500).json({ error: 'Failed to fetch stats from GitHub' });
                }
            }
            catch (error) {
                console.error('Error fetching stats:', error);
                res.status(500).json({ error: 'Failed to fetch stats' });
            }
        });
    }
    catch (error) {
        console.error('Error in manual stats fetch:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'DevRank backend is running'
    });
});
// Setup cron job to run daily at 2 AM
function setupCronJob() {
    // Run every day at 2:00 AM
    node_cron_1.default.schedule('0 2 * * *', async () => {
        console.log('Running scheduled task: Fetch coding stats for all users');
        await fetchStatsForAllUsers();
    }, {
        scheduled: true,
        timezone: "UTC"
    });
    console.log('Cron job scheduled: Daily stats fetch at 2:00 AM UTC');
    // For testing purposes, also run every 5 minutes (uncomment to enable)
    // cron.schedule('*/5 * * * *', async () => {
    //   console.log('Running test task: Fetch coding stats for all users');
    //   await fetchStatsForAllUsers();
    // });
}
// Initialize and start server
async function startServer() {
    try {
        // Create data directory if it doesn't exist
        const dataDir = path_1.default.join(__dirname, '../data');
        const fs = require('fs');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        // Initialize database
        await initializeDatabase();
        // Setup cron job
        setupCronJob();
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 DevRank backend server running on port ${PORT}`);
            console.log(`📊 Database: ${dbPath}`);
            console.log(`⏰ Cron job: Daily stats fetch at 2:00 AM UTC`);
            console.log(`\nAPI Endpoints:`);
            console.log(`  POST /api/users - Add new user`);
            console.log(`  GET /api/users - Get all active users`);
            console.log(`  GET /api/users/:userId/stats - Get user stats history`);
            console.log(`  POST /api/fetch-stats/:userId - Manually trigger stats fetch for user`);
            console.log(`  GET /api/health - Health check`);
        });
    }
    catch (error) {
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
            }
            else {
                console.log('Database connection closed.');
            }
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
});
// Start the server
startServer();
//# sourceMappingURL=index.js.map