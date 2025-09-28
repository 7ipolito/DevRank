"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config");
const services_1 = require("./services");
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Services
const codeStatsService = new services_1.CodeStatsService();
// Routes
app.use('/', routes_1.default);
// Initialize and start server
async function startServer() {
    try {
        // Initialize database
        await (0, config_1.initializeDatabase)();
        // Setup cron job
        (0, config_1.setupCronJob)(codeStatsService);
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 DevRank backend server running on port ${PORT}`);
            console.log(`⏰ Cron job: Daily stats fetch at 2:00 AM UTC`);
            console.log(`\nAPI Endpoints:`);
            console.log(`  POST /api/users - Add new user`);
            console.log(`  POST /api/users/wallet - Add new user with wallet address`);
            console.log(`  GET /api/users - Get all active users`);
            console.log(`  GET /api/users/:userId/stats - Get user stats history`);
            console.log(`  POST /api/fetch-stats/:userId - Manually trigger stats fetch for user`);
            console.log(`  GET /api/health - Health check`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    try {
        await (0, config_1.closeDatabase)();
        process.exit(0);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
// Start the server
startServer();
//# sourceMappingURL=index.js.map