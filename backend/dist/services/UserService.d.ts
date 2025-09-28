import { User, CodingStats } from "../models";
export declare class UserService {
    static addUser(username: string, github_username?: string): Promise<number>;
    static addUserWithWallet(username: string, wallet_address: string): Promise<number>;
    static getActiveUsers(): Promise<User[]>;
    static getUserById(userId: number): Promise<User | null>;
    static storeUserStats(stats: CodingStats): Promise<void>;
    static updateUserLastFetch(userId: number): Promise<void>;
    static getUserStats(userId: number): Promise<any[]>;
    static getUserStatsByWallet(walletAddress: string): Promise<any[]>;
    static getUserByWallet(walletAddress: string): Promise<User | null>;
}
//# sourceMappingURL=UserService.d.ts.map