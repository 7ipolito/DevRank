"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// PostgreSQL connection configuration
const connectionString = process.env.DATABASE_URL;
exports.pool = new pg_1.Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false // For Railway and other cloud providers
    }
});
// Initialize database
async function initializeDatabase() {
    try {
        console.log('Connecting to PostgreSQL database...');
        // Test connection
        const client = await exports.pool.connect();
        console.log('Connected to PostgreSQL database successfully.');
        // Create tables
        const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          github_username VARCHAR(255),
          wallet_address VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_fetch TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        )
      `;
        const createStatsTable = `
      CREATE TABLE IF NOT EXISTS coding_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        fetch_date DATE NOT NULL,
        total_xp INTEGER DEFAULT 0,
        new_xp INTEGER DEFAULT 0,
        languages TEXT, -- JSON string with language XP data
        machines TEXT, -- JSON string with machine data
        daily_xp TEXT, -- JSON string with daily XP history
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;
        await client.query(createUsersTable);
        console.log('Users table created successfully.');
        await client.query(createStatsTable);
        console.log('Coding stats table created successfully.');
        client.release();
        console.log('Database tables initialized successfully.');
    }
    catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}
// Graceful shutdown
async function closeDatabase() {
    try {
        await exports.pool.end();
        console.log('Database connection pool closed.');
    }
    catch (error) {
        console.error('Error closing database:', error);
    }
}
//# sourceMappingURL=database.js.map