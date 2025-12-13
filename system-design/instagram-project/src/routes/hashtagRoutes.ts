import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getHashtagPosts, getTrending, searchHashtags } from '../controllers/hashtagController';

const router = Router();

router.get('/hashtags/:tag', authenticate, getHashtagPosts);
router.get('/hashtags/trending', authenticate, getTrending);
router.get('/search/hashtags', authenticate, searchHashtags);

export default router;

