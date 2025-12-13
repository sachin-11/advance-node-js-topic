import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMentions, getUserMentions } from '../controllers/mentionController';

const router = Router();

router.get('/mentions', authenticate, getMentions);
router.get('/users/:id/mentions', authenticate, getUserMentions);

export default router;

