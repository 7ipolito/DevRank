import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase, setupCronJob } from './config';
import { CodeStatsService } from './services';
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

// Routes
app.use('/', routes);

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
      console.log(`⏰ Cron job: Daily stats fetch at 2:00 AM UTC`);
      console.log(`\nAPI Endpoints:`);
      console.log(`  POST /api/users - Add new user`);
      console.log(`  POST /api/users/wallet - Add new user with wallet address`);
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