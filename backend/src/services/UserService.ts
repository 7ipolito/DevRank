import { pool } from "../config/database";
import { User, CodingStats } from "../models";

export class UserService {
  static async addUser(username: string, github_username?: string): Promise<number> {
    try {
      const query = 'INSERT INTO users (username, github_username) VALUES ($1, $2) RETURNING id';
      const values = [username, github_username || username];
      
      const result = await pool.query(query, values);
      const userId = result.rows[0].id;
      
      console.log(`User ${username} added with ID: ${userId}`);
      return userId;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  static async addUserWithWallet(username: string, wallet_address: string): Promise<number> {
    try {
      const query = 'INSERT INTO users (username, github_username, wallet_address) VALUES ($1, $2, $3) RETURNING id';
      const values = [username, username, wallet_address];
      
      const result = await pool.query(query, values);
      const userId = result.rows[0].id;
      
      console.log(`User ${username} added with wallet ${wallet_address} and ID: ${userId}`);
      return userId;
    } catch (error) {
      console.error('Error adding user with wallet:', error);
      throw error;
    }
  }

  static async getActiveUsers(): Promise<User[]> {
    try {
      const query = 'SELECT * FROM users WHERE is_active = true';
      const result = await pool.query(query);
      return result.rows as User[];
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  }

  static async getUserById(userId: number): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async storeUserStats(stats: CodingStats): Promise<void> {
    try {
      const query = `
        INSERT INTO coding_stats 
        (user_id, fetch_date, total_xp, new_xp, languages, machines, daily_xp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      const today = new Date().toISOString().split('T')[0];
      const values = [
        stats.user_id,
        today,
        stats.total_xp,
        stats.new_xp,
        JSON.stringify(stats.languages),
        JSON.stringify(stats.machines),
        JSON.stringify(stats.daily_xp)
      ];
      
      await pool.query(query, values);
      
      console.log(`Code::Stats data stored for user ${stats.user_id}:`, {
        total_xp: stats.total_xp,
        new_xp: stats.new_xp,
        languages_count: Object.keys(stats.languages).length
      });
    } catch (error) {
      console.error('Error storing user stats:', error);
      throw error;
    }
  }

  static async updateUserLastFetch(userId: number): Promise<void> {
    try {
      const query = 'UPDATE users SET last_fetch = $1 WHERE id = $2';
      const values = [new Date().toISOString(), userId];
      
      await pool.query(query, values);
    } catch (error) {
      console.error('Error updating user last fetch:', error);
      throw error;
    }
  }

  static async getUserStats(userId: number): Promise<any[]> {
    try {
      const query = `
        SELECT * FROM coding_stats 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 30
      `;
      
      const result = await pool.query(query, [userId]);
      
      const stats = result.rows.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        fetch_date: row.fetch_date,
        total_xp: row.total_xp,
        new_xp: row.new_xp,
        created_at: row.created_at,
        languages: JSON.parse(row.languages || '{}'),
        machines: JSON.parse(row.machines || '{}'),
        daily_xp: JSON.parse(row.daily_xp || '{}')
      }));
      
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  static async getUserStatsByWallet(walletAddress: string): Promise<any[]> {
    try {
      const query = `
        SELECT cs.* FROM coding_stats cs
        INNER JOIN users u ON cs.user_id = u.id
        WHERE u.wallet_address = $1 
        ORDER BY cs.created_at DESC 
        LIMIT 30
      `;
      
      const result = await pool.query(query, [walletAddress]);
      
      const stats = result.rows.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        fetch_date: row.fetch_date,
        total_xp: row.total_xp,
        new_xp: row.new_xp,
        created_at: row.created_at,
        languages: JSON.parse(row.languages || '{}'),
        machines: JSON.parse(row.machines || '{}'),
        daily_xp: JSON.parse(row.daily_xp || '{}')
      }));
      
      return stats;
    } catch (error) {
      console.error('Error fetching user stats by wallet:', error);
      throw error;
    }
  }

  static async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE wallet_address = $1';
      const result = await pool.query(query, [walletAddress]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by wallet:', error);
      throw error;
    }
  }
}