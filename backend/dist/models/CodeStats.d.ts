export interface CodeStatsResponse {
    user: string;
    total_xp: number;
    new_xp: number;
    machines: Record<string, {
        xps: number;
        new_xps: number;
    }>;
    languages: Record<string, {
        xps: number;
        new_xps: number;
    }>;
    dates: Record<string, number>;
}
export interface CodingStats {
    user_id: number;
    fetch_date: string;
    total_xp: number;
    new_xp: number;
    languages: Record<string, {
        xps: number;
        new_xps: number;
    }>;
    machines: Record<string, {
        xps: number;
        new_xps: number;
    }>;
    daily_xp: Record<string, number>;
}
export type CodeStatsUser = {
    user: string;
    total_xp: number;
    last_update: string;
    languages: Record<string, {
        xps: number;
    }>;
};
//# sourceMappingURL=CodeStats.d.ts.map