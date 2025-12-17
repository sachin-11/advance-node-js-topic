import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getUserChats, getChatMessages, markChatAsRead } from '../controllers/chatController';

const router = Router();

router.get('/', authenticate, getUserChats);
router.get('/:chatId/messages', authenticate, getChatMessages);
router.post('/:chatId/read', authenticate, markChatAsRead);

export default router;
