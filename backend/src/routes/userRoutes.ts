import { Router } from 'express';
import { UserController } from '../controllers';

const router = Router();

// User routes
router.post('/users', UserController.createUser);
router.post('/users/wallet', UserController.createUserWithWallet);
router.get('/users', UserController.getUsers);
router.get('/users/:userId/stats', UserController.getUserStats);
router.post('/fetch-stats/:userId', UserController.fetchUserStats);

export default router;
