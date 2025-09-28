import { CodingStats, CodeStatsUser } from '../models';
export declare class CodeStatsService {
    private readonly baseUrl;
    fetchCodeStatsUser(username: string): Promise<CodeStatsUser>;
    fetchUserStats(username: string): Promise<CodingStats | null>;
    private fetchMockUserStats;
    fetchUserStatsWithFallback(username: string): Promise<CodingStats | null>;
}
//# sourceMappingURL=CodeStatsService.d.ts.map