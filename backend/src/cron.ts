import { getActiveUsers } from "./user";
import cron from 'node-cron';
import { CodeStatsService } from "./codestats";

// Setup cron job to run daily at 2 AM
export function setupCronJob(codeStatsService: CodeStatsService) {
    // Run every day at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running scheduled task: Fetch coding stats for all users');
      let users = await getActiveUsers();
      for (const user of users) {
        let stats = await codeStatsService.fetchUserStats(user.username);
        if (stats) {
        //   await storeUserStats(stats);
        //   await contractService.storeUserStats(stats);
        //   await updateUserLastFetch(user.id);
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