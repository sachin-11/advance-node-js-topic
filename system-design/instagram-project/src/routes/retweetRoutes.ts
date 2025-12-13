import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { repost, undoRepost, getReposts } from '../controllers/retweetController';

const router = Router();

router.post('/posts/:id/repost', authenticate, repost);
router.delete('/posts/:id/repost', authenticate, undoRepost);
router.get('/posts/:id/reposts', authenticate, getReposts);

export default router;

