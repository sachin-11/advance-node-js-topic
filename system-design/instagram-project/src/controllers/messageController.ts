import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MessageService } from '../services/messageService';

const messageService = new MessageService();

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get all conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Conversations list
 */
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const conversations = await messageService.getConversations(req.userId, limit);
    const unreadCount = await messageService.getUnreadCount(req.userId);

    res.json({
      conversations,
      unread_count: unreadCount,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Get conversation with a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Conversation messages
 */
export const getConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await messageService.getConversation(req.userId, userId, limit, offset);

    res.json({
      messages,
      pagination: {
        limit,
        offset,
        count: messages.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/{userId}:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Hello!
 *               media_url:
 *                 type: string
 *                 example: https://cdn.example.com/image.jpg
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const { content, media_url } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const message = await messageService.sendMessage(req.userId, userId, content, media_url);

    res.status(201).json(message);
  } catch (error: any) {
    if (error.message.includes('yourself') || error.message.includes('blocked') || error.message.includes('too long')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/{userId}/read:
 *   put:
 *     summary: Mark conversation as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation marked as read
 */
export const markConversationAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const count = await messageService.markConversationAsRead(userId, req.userId);

    res.json({
      message: 'Conversation marked as read',
      count,
    });
  } catch (error: any) {
    next(error);
  }
};

