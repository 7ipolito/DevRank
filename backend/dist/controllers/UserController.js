"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const services_1 = require("../services");
class UserController {
    static async createUser(req, res) {
        try {
            const { username, github_username } = req.body;
            if (!username) {
                return res.status(400).json({ error: 'Username is required' });
            }
            const userId = await services_1.UserService.addUser(username, github_username);
            // Immediately fetch stats for the new user
            setTimeout(async () => {
                try {
                    const stats = await UserController.codeStatsService.fetchUserStats(github_username || username);
                    if (stats) {
                        const completeStats = {
                            ...stats,
                            user_id: userId,
                            fetch_date: new Date().toISOString().split('T')[0]
                        };
                        await services_1.UserService.storeUserStats(completeStats);
                        await UserController.contractService.storeUserStats(completeStats);
                        await services_1.UserService.updateUserLastFetch(userId);
                        console.log(`Initial stats fetch completed for user: ${username}`);
                    }
                }
                catch (error) {
                    console.error(`Error in initial stats fetch for ${username}:`, error);
                }
            }, 1000);
            res.json({
                success: true,
                message: 'User added successfully',
                userId,
                note: 'Initial stats fetch scheduled'
            });
        }
        catch (error) {
            console.error('Error adding user:', error);
            res.status(500).json({ error: 'Failed to add user' });
        }
    }
    static async createUserWithWallet(req, res) {
        try {
            const { username, wallet_address } = req.body;
            if (!username) {
                return res.status(400).json({ error: 'Username is required' });
            }
            if (!wallet_address) {
                return res.status(400).json({ error: 'Wallet address is required' });
            }
            // Check if user already exists with this username and wallet
            const existingUser = await services_1.UserService.getUserByUsernameAndWallet(username, wallet_address);
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
            const userId = await services_1.UserService.addUserWithWallet(username, wallet_address);
            // Immediately fetch stats for the new user
            setTimeout(async () => {
                try {
                    const stats = await UserController.codeStatsService.fetchUserStats(username);
                    if (stats) {
                        const completeStats = {
                            ...stats,
                            user_id: userId,
                            fetch_date: new Date().toISOString().split('T')[0]
                        };
                        await services_1.UserService.storeUserStats(completeStats);
                        await UserController.contractService.storeUserStats(completeStats);
                        await services_1.UserService.updateUserLastFetch(userId);
                        console.log(`Initial stats fetch completed for user: ${username}`);
                    }
                }
                catch (error) {
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
        }
        catch (error) {
            console.error('Error adding user with wallet:', error);
            res.status(500).json({ error: 'Failed to add user with wallet' });
        }
    }
    static async getUsers(req, res) {
        try {
            const users = await services_1.UserService.getActiveUsers();
            res.json({ success: true, users });
        }
        catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
    static async getUserStats(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const stats = await services_1.UserService.getUserStats(userId);
            res.json({ success: true, stats });
        }
        catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }
    static async getUserStatsByWallet(req, res) {
        try {
            const { walletAddress } = req.params;
            if (!walletAddress) {
                return res.status(400).json({ error: 'Wallet address is required' });
            }
            const stats = await services_1.UserService.getUserStatsByWallet(walletAddress);
            const user = await services_1.UserService.getUserByWallet(walletAddress);
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
        }
        catch (error) {
            console.error('Error fetching user stats by wallet:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }
    static async fetchUserStats(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const user = await services_1.UserService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const stats = await UserController.codeStatsService.fetchUserStats(user.github_username || user.username);
            if (stats) {
                const completeStats = {
                    ...stats,
                    user_id: userId,
                    fetch_date: new Date().toISOString().split('T')[0]
                };
                await services_1.UserService.storeUserStats(completeStats);
                await UserController.contractService.storeUserStats(completeStats);
                await services_1.UserService.updateUserLastFetch(userId);
                res.json({
                    success: true,
                    message: 'Stats fetched and stored successfully',
                    stats: completeStats
                });
            }
            else {
                res.status(500).json({ error: 'Failed to fetch stats from GitHub' });
            }
        }
        catch (error) {
            console.error('Error in manual stats fetch:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }
    /**
     * Atualiza dados de todos os usuários
     * Endpoint para forçar atualização manual (útil para testes e administração)
     */
    static async updateAllUsersStats(req, res) {
        try {
            const startTime = new Date();
            console.log(`🔄 Manual update started at ${startTime.toISOString()}`);
            const users = await services_1.UserService.getActiveUsers();
            if (users.length === 0) {
                return res.json({
                    success: true,
                    message: 'No active users to update',
                    stats: {
                        total: 0,
                        success: 0,
                        failed: 0,
                        duration: 0
                    }
                });
            }
            console.log(`📊 Updating ${users.length} users...`);
            let successCount = 0;
            let failCount = 0;
            const results = [];
            // Processar todos os usuários
            for (const user of users) {
                try {
                    // Skip users without ID
                    if (!user.id) {
                        failCount++;
                        results.push({
                            userId: undefined,
                            username: user.username,
                            status: 'error',
                            message: 'User ID is missing'
                        });
                        console.error(`❌ User ${user.username} has no ID`);
                        continue;
                    }
                    const stats = await UserController.codeStatsService.fetchUserStats(user.github_username || user.username);
                    if (stats) {
                        const completeStats = {
                            ...stats,
                            user_id: user.id,
                            fetch_date: new Date().toISOString().split('T')[0]
                        };
                        await services_1.UserService.storeUserStats(completeStats);
                        await UserController.contractService.storeUserStats(completeStats);
                        await services_1.UserService.updateUserLastFetch(user.id);
                        successCount++;
                        results.push({
                            userId: user.id,
                            username: user.username,
                            status: 'success',
                            totalXp: stats.total_xp
                        });
                        console.log(`✅ Updated ${user.username} - XP: ${stats.total_xp}`);
                    }
                    else {
                        failCount++;
                        results.push({
                            userId: user.id,
                            username: user.username,
                            status: 'no_stats',
                            message: 'No stats found'
                        });
                        console.log(`⚠️  No stats found for ${user.username}`);
                    }
                }
                catch (error) {
                    failCount++;
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    results.push({
                        userId: user.id,
                        username: user.username,
                        status: 'error',
                        message: errorMessage
                    });
                    console.error(`❌ Error updating ${user.username}:`, errorMessage);
                }
            }
            const endTime = new Date();
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;
            console.log(`\n✨ Manual update completed in ${duration}s`);
            console.log(`   Success: ${successCount} | Failed: ${failCount} | Total: ${users.length}\n`);
            res.json({
                success: true,
                message: 'Batch update completed',
                stats: {
                    total: users.length,
                    success: successCount,
                    failed: failCount,
                    duration: `${duration}s`,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString()
                },
                results
            });
        }
        catch (error) {
            console.error('Error in batch stats update:', error);
            res.status(500).json({
                error: 'Failed to update all users stats',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.UserController = UserController;
UserController.codeStatsService = new services_1.CodeStatsService();
UserController.contractService = new services_1.SmartContractService();
//# sourceMappingURL=UserController.js.map