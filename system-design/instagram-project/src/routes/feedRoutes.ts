import { Router } from 'express';
import { getFeed, getAlgorithmicFeed } from '../controllers/feedController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getFeed);
router.get('/algorithmic', authenticate, getAlgorithmicFeed);

export default router;

