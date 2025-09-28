"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCronJob = setupCronJob;
const node_cron_1 = __importDefault(require("node-cron"));
const services_1 = require("../services");
// Setup cron job to run daily at 2 AM
function setupCronJob(codeStatsService) {
    // Run every day at 2:00 AM
    node_cron_1.default.schedule('0 2 * * *', async () => {
        console.log('Running scheduled task: Fetch coding stats for all users');
        let users = await services_1.UserService.getActiveUsers();
        for (const user of users) {
            let stats = await codeStatsService.fetchUserStats(user.username);
            if (stats) {
                // await UserService.storeUserStats(stats);
                // await contractService.storeUserStats(stats);
                // await UserService.updateUserLastFetch(user.id);
            }
        }
    }, {
        scheduled: true,
        timezone: "UTC"
    });
    console.log('Cron job scheduled: Daily stats fetch at 2:00 AM UTC');
    // For testing purposes, also run every 5 minutes (uncomment to enable)
    // cron.schedule('*/5 * * * *', async () => {
    //   console.log('Running test task: Fetch coding stats for all users');
    //   await fetchStatsForAllUsers();
    // });
}
//# sourceMappingURL=cron.js.map