import { Request, Response } from 'express';
import { UserService, CodeStatsService, SmartContractService } from '../services';
import { CodingStats } from '../models';

export class UserController {
  private static codeStatsService = new CodeStatsService();
  private static contractService = new SmartContractService();

  static async createUser(req: Request, res: Response) {
    try {
      const { username, github_username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      const userId = await UserService.addUser(username, github_username);
      
      // Immediately fetch stats for the new user
      setTimeout(async () => {
        try {
          const stats = await UserController.codeStatsService.fetchUserStats(github_username || username);
          if (stats) {
            const completeStats: CodingStats = {
              ...stats,
              user_id: userId,
              fetch_date: new Date().toISOString().split('T')[0]
            };
            
            await UserService.storeUserStats(completeStats);
            await UserController.contractService.storeUserStats(completeStats);
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
  }

  static async createUserWithWallet(req: Request, res: Response) {
    try {
      const { username, wallet_address } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      if (!wallet_address) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }
      
      // Check if user already exists with this username and wallet
      const existingUser = await UserService.getUserByUsernameAndWallet(username, wallet_address);
      
      if (existingUser) {
        // User already exists, return success
        console.log(`User ${username} with wallet ${wallet_address} already exists with ID: ${existingUser.id}`);
        return res.json({ 
          success: true, 
          message: 'User already exists', 
          userId: existingUser.id,
          wallet_address,
          existing: true
        });
      }
      
      const userId = await UserService.addUserWithWallet(username, wallet_address);
      
      // Immediately fetch stats for the new user
      setTimeout(async () => {
        try {
          const stats = await UserController.codeStatsService.fetchUserStats(username);
          if (stats) {
            const completeStats: CodingStats = {
              ...stats,
              user_id: userId,
              fetch_date: new Date().toISOString().split('T')[0]
            };
            
            await UserService.storeUserStats(completeStats);
            await UserController.contractService.storeUserStats(completeStats);
            await UserService.updateUserLastFetch(userId);
            
            console.log(`Initial stats fetch completed for user: ${username}`);
          }
        } catch (error) {
          console.error(`Error in initial stats fetch for ${username}:`, error);
        }
      }, 1000);
      
      res.json({ 
        success: true, 
        message: 'User with wallet added successfully', 
        userId,
        wallet_address,
        existing: false,
        note: 'Initial stats fetch scheduled'
      });
    } catch (error) {
      console.error('Error adding user with wallet:', error);
      res.status(500).json({ error: 'Failed to add user with wallet' });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getActiveUsers();
      res.json({ success: true, users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async getUserStats(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await UserService.getUserStats(userId);
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  static async getUserStatsByWallet(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }
      
      const stats = await UserService.getUserStatsByWallet(walletAddress);
      const user = await UserService.getUserByWallet(walletAddress);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found with this wallet address' });
      }
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          wallet_address: user.wallet_address,
          created_at: user.created_at,
          last_fetch: user.last_fetch
        },
        stats 
      });
    } catch (error) {
      console.error('Error fetching user stats by wallet:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  static async fetchUserStats(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const stats = await UserController.codeStatsService.fetchUserStats(user.github_username || user.username);
      
      if (stats) {
        const completeStats: CodingStats = {
          ...stats,
          user_id: userId,
          fetch_date: new Date().toISOString().split('T')[0]
        };
        
        await UserService.storeUserStats(completeStats);
        await UserController.contractService.storeUserStats(completeStats);
        await UserService.updateUserLastFetch(userId);
        
        res.json({ 
          success: true, 
          message: 'Stats fetched and stored successfully',
          stats: completeStats
        });
      } else {
        res.status(500).json({ error: 'Failed to fetch stats from GitHub' });
      }
    } catch (error) {
      console.error('Error in manual stats fetch:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}
