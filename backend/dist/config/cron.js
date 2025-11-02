"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCronJob = setupCronJob;
const node_cron_1 = __importDefault(require("node-cron"));
const services_1 = require("../services");
// Setup cron job to run every 12 hours
function setupCronJob(codeStatsService) {
    // Run every 12 hours (at 00:00 and 12:00)
    node_cron_1.default.schedule('0 */12 * * *', async () => {
        console.log('Running scheduled task: Fetch coding stats for all users');
        const startTime = new Date();
        console.log(`🔄 Starting data update at ${startTime.toISOString()}`);
        let users = await services_1.UserService.getActiveUsers();
        console.log(`📊 Found ${users.length} active users to update`);
        let successCount = 0;
        let failCount = 0;
        for (const user of users) {
            try {
                let stats = await codeStatsService.fetchUserStats(user.username);
                if (stats) {
                    successCount++;
                    console.log(`✅ Successfully updated ${user.username}`);
                    // await UserService.storeUserStats(stats);
                    // await contractService.storeUserStats(stats);
                    // await UserService.updateUserLastFetch(user.id);
                }
                else {
                    failCount++;
                    console.log(`⚠️  No stats found for ${user.username}`);
                }
            }
            catch (error) {
                failCount++;
                console.error(`❌ Error updating ${user.username}:`, error);
            }
        }
        const endTime = new Date();
        const duration = (endTime.getTime() - startTime.getTime()) / 1000;
        console.log(`\n✨ Update completed in ${duration}s`);
        console.log(`   Success: ${successCount} | Failed: ${failCount} | Total: ${users.length}`);
        console.log(`   Next update: ${new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()}\n`);
    }, {
        scheduled: true,
        timezone: "UTC"
    });
    console.log('✅ Cron job scheduled: Stats fetch every 12 hours (00:00 and 12:00 UTC)');
    // For testing purposes, also run every 5 minutes (uncomment to enable)
    // cron.schedule('*/5 * * * *', async () => {
    //   console.log('Running test task: Fetch coding stats for all users');
    //   await fetchStatsForAllUsers();
    // });
}
//# sourceMappingURL=cron.js.map