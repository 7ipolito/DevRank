import axios from 'axios';
import dotenv from 'dotenv';
import { CodeStatsResponse, CodingStats, CodeStatsUser } from '../models';

dotenv.config();
const CODESTATS_BASE_URL = process.env.CODESTATS_BASE_URL || 'https://codestats.net';

export class CodeStatsService {
  private readonly baseUrl = CODESTATS_BASE_URL;

  async fetchCodeStatsUser(username: string): Promise<CodeStatsUser> {
    if (!username || !/^[A-Za-z0-9_\-]{1,32}$/.test(username)) {
      throw new Error('Invalid username format');
    }
  
    const url = `${CODESTATS_BASE_URL}/api/users/${encodeURIComponent(username)}`;
    const resp = await axios.get<CodeStatsUser>(url, {
      // If you ever switch to private endpoints, prefer headers for tokens
      // headers: { 'X-API-Token': process.env.CODESTATS_API_TOKEN! }
      timeout: 10_000,
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    });
  
    if (resp.status === 404) {
      const err: any = new Error('User not found');
      (err as any).response = resp;
      throw err;
    }
    return resp.data;
  }

  async fetchUserStats(username: string): Promise<CodingStats | null> {
    try {
      console.log(`Fetching Code::Stats for user: ${username}`);
      
      const response = await axios.get(`${this.baseUrl}/api/users/${username}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DevRank-Backend/1.0.0'
        },
        timeout: 10000 // 10 second timeout
      });
      
      const data: CodeStatsResponse = response.data;
      
      const stats: Omit<CodingStats, 'user_id' | 'fetch_date'> = {
        total_xp: data.total_xp,
        new_xp: data.new_xp,
        languages: data.languages,
        machines: data.machines,
        daily_xp: data.dates
      };
      
      console.log(`Successfully fetched Code::Stats for ${username}:`, {
        total_xp: stats.total_xp,
        new_xp: stats.new_xp,
        languages_count: Object.keys(stats.languages).length,
        machines_count: Object.keys(stats.machines).length
      });
      
      return stats as CodingStats;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log(`User ${username} not found on Code::Stats or profile is private`);
          return null;
        }
        console.error(`HTTP Error fetching Code::Stats for ${username}:`, error.response?.status, error.response?.statusText);
      } else {
        console.error(`Error fetching Code::Stats for ${username}:`, error);
      }
      return null;
    }
  }
  
  // Mock implementation for testing (can be enabled by setting MOCK_API=true in env)
  private async fetchMockUserStats(username: string): Promise<CodingStats | null> {
    console.log(`Fetching MOCK Code::Stats for user: ${username}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockStats: Omit<CodingStats, 'user_id' | 'fetch_date'> = {
      total_xp: Math.floor(Math.random() * 100000) + 10000,
      new_xp: Math.floor(Math.random() * 500) + 10,
      languages: {
        'TypeScript': { xps: Math.floor(Math.random() * 50000) + 10000, new_xps: Math.floor(Math.random() * 100) },
        'Python': { xps: Math.floor(Math.random() * 30000) + 5000, new_xps: Math.floor(Math.random() * 50) },
        'JavaScript': { xps: Math.floor(Math.random() * 40000) + 8000, new_xps: Math.floor(Math.random() * 75) },
        'Rust': { xps: Math.floor(Math.random() * 20000) + 2000, new_xps: Math.floor(Math.random() * 25) },
      },
      machines: {
        'Main Workstation': { xps: Math.floor(Math.random() * 80000) + 20000, new_xps: Math.floor(Math.random() * 200) },
        'Laptop': { xps: Math.floor(Math.random() * 30000) + 5000, new_xps: Math.floor(Math.random() * 50) }
      },
      daily_xp: {
        '2024-01-15': Math.floor(Math.random() * 1000) + 100,
        '2024-01-14': Math.floor(Math.random() * 800) + 50,
        '2024-01-13': Math.floor(Math.random() * 1200) + 200,
      }
    };
    
    console.log(`Successfully generated mock Code::Stats for ${username}`);
    return mockStats as CodingStats;
  }
  
  async fetchUserStatsWithFallback(username: string): Promise<CodingStats | null> {
    // If MOCK_API is set to true, use mock data
    if (process.env.MOCK_API === 'true') {
      return this.fetchMockUserStats(username);
    }
    
    // Try real API first
    const realStats = await this.fetchUserStats(username);
    if (realStats) {
      return realStats;
    }
    
    // Fallback to mock if real API fails and FALLBACK_TO_MOCK is true
    if (process.env.FALLBACK_TO_MOCK === 'true') {
      console.log(`Falling back to mock data for user: ${username}`);
      return this.fetchMockUserStats(username);
    }
    
    return null;
  }
}
