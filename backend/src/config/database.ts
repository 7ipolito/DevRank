import { Pool, Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection configuration
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // For Railway and other cloud providers
  }
});

// Initialize database
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Test connection
    const client = await pool.connect();
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
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connection pool closed.');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}