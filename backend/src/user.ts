import { db } from "./database";
import { CodingStats } from "./codestats";

// User interface
export interface User {
    id?: number;
    username: string;
    github_username?: string;
    created_at?: string;
    last_fetch?: string;
    is_active?: boolean;
  }
  
// Database helper functions
export function addUser(username: string, github_username?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO users (username, github_username) VALUES (?, ?)');
      stmt.run([username, github_username || username], function(err) {
        if (err) {
          console.error('Error adding user:', err.message);
          reject(err);
        } else {
          console.log(`User ${username} added with ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      });
      stmt.finalize();
    });
  }
  
  export function getActiveUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users WHERE is_active = 1', (err, rows) => {
        if (err) {
          console.error('Error fetching active users:', err.message);
          reject(err);
        } else {
          resolve(rows as User[]);
        }
      });
    });
  }
  
  export function storeUserStats(stats: CodingStats): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO coding_stats 
        (user_id, fetch_date, total_xp, new_xp, languages, machines, daily_xp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const today = new Date().toISOString().split('T')[0];
      stmt.run([
        stats.user_id,
        today,
        stats.total_xp,
        stats.new_xp,
        JSON.stringify(stats.languages),
        JSON.stringify(stats.machines),
        JSON.stringify(stats.daily_xp)
      ], function(err) {
        if (err) {
          console.error('Error storing user stats:', err.message);
          reject(err);
        } else {
          console.log(`Code::Stats data stored for user ${stats.user_id}:`, {
            total_xp: stats.total_xp,
            new_xp: stats.new_xp,
            languages_count: Object.keys(stats.languages).length
          });
          resolve();
        }
      });
      stmt.finalize();
    });
  }
  
  export function updateUserLastFetch(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('UPDATE users SET last_fetch = ? WHERE id = ?');
      stmt.run([new Date().toISOString(), userId], function(err) {
        if (err) {
          console.error('Error updating user last fetch:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
      stmt.finalize();
    });
  }