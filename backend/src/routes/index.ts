import { Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

// API routes
router.use('/api', userRoutes);

// Health check
router.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DevRank API is running' });
});

export default router;
