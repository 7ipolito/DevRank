"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoutes_1 = __importDefault(require("./userRoutes"));
const router = (0, express_1.Router)();
// API routes
router.use('/api', userRoutes_1.default);
// Health check
router.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'DevRank API is running' });
});
exports.default = router;
//# sourceMappingURL=index.js.map