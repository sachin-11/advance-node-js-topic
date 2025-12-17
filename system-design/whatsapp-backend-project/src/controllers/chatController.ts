import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chatService';
import { AuthRequest } from '../middleware/auth';

const chatService = new ChatService();

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get user's chats
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 */
export const getUserChats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const chats = await chatService.getUserChats(userId, limit, offset);
    res.json(chats);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/chats/:chatId/messages:
 *   get:
 *     summary: Get chat messages
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 */
export const getChatMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const chatId = parseInt(req.params.chatId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await chatService.getChatMessages(chatId, userId, limit, offset);
    res.json(messages);
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/chats/:chatId/read:
 *   post:
 *     summary: Mark chat as read
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 */
export const markChatAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const chatId = parseInt(req.params.chatId);

    await chatService.markChatAsRead(chatId, userId);
    res.json({ message: 'Chat marked as read' });
  } catch (error) {
    next(error);
  }
};
