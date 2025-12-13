import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getConversations,
  getConversation,
  sendMessage,
  markConversationAsRead,
} from '../controllers/messageController';

const router = Router();

router.get('/messages', authenticate, getConversations);
router.get('/messages/:userId', authenticate, getConversation);
router.post('/messages/:userId', authenticate, sendMessage);
router.put('/messages/:userId/read', authenticate, markConversationAsRead);

export default router;

