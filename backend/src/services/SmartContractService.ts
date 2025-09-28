import { CodingStats } from '../models';

// Mock Smart Contract Service
export class SmartContractService {
  async storeUserStats(stats: CodingStats): Promise<boolean> {
    return true;
  }
}
