import path from "path";
import { Database } from "sqlite3";

// Database setup
const dbPath = path.join(__dirname, '../data/devrank.db');
export let db: Database;

// Initialize database
export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new Database(dbPath, (err) => {
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
          total_xp INTEGER DEFAULT 0,
          new_xp INTEGER DEFAULT 0,
          languages TEXT, -- JSON string with language XP data
          machines TEXT, -- JSON string with machine data
          daily_xp TEXT, -- JSON string with daily XP history
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