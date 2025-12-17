import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { messageRateLimiter } from '../middleware/rateLimiter';
import {
  sendChatMessage,
  sendGroupMessage,
  getGroupMessages,
  updateMessageStatus,
  deleteMessage,
} from '../controllers/messageController';

const router = Router();

router.post('/chat', authenticate, messageRateLimiter(), sendChatMessage);
router.post('/group', authenticate, messageRateLimiter(), sendGroupMessage);
router.get('/group/:groupId', authenticate, getGroupMessages);
router.put('/:messageId/status', authenticate, updateMessageStatus);
router.delete('/:messageId', authenticate, deleteMessage);

export default router;
