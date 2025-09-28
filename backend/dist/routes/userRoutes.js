"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
// User routes
router.post('/users', controllers_1.UserController.createUser);
router.post('/users/wallet', controllers_1.UserController.createUserWithWallet);
router.get('/users', controllers_1.UserController.getUsers);
router.get('/users/:userId/stats', controllers_1.UserController.getUserStats);
router.get('/users/wallet/:walletAddress/stats', controllers_1.UserController.getUserStatsByWallet);
router.post('/fetch-stats/:userId', controllers_1.UserController.fetchUserStats);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map