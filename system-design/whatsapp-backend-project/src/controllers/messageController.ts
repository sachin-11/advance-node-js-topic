import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/messageService';
import { AuthRequest } from '../middleware/auth';

const messageService = new MessageService();

/**
 * @swagger
 * /api/messages/chat:
 *   post:
 *     summary: Send a chat message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const sendChatMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { receiver_id, content, message_type, media_url, media_thumbnail_url, media_size, media_duration, reply_to_message_id } = req.body;

    if (!receiver_id) {
      res.status(400).json({ error: 'Receiver ID is required' });
      return;
    }

    const message = await messageService.sendChatMessage(
      userId,
      receiver_id,
      content,
      message_type || 'text',
      media_url,
      media_thumbnail_url,
      media_size,
      media_duration,
      reply_to_message_id
    );

    res.status(201).json(message);
  } catch (error: any) {
    if (error.message.includes('blocked') || error.message.includes('not found')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/group:
 *   post:
 *     summary: Send a group message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const sendGroupMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { group_id, content, message_type, media_url, media_thumbnail_url, media_size, media_duration, reply_to_message_id } = req.body;

    if (!group_id) {
      res.status(400).json({ error: 'Group ID is required' });
      return;
    }

    const message = await messageService.sendGroupMessage(
      userId,
      group_id,
      content,
      message_type || 'text',
      media_url,
      media_thumbnail_url,
      media_size,
      media_duration,
      reply_to_message_id
    );

    res.status(201).json(message);
  } catch (error: any) {
    if (error.message.includes('not a member') || error.message.includes('not found')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/group/:groupId:
 *   get:
 *     summary: Get group messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const getGroupMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const groupId = parseInt(req.params.groupId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await messageService.getGroupMessages(groupId, userId, limit, offset);
    res.json(messages);
  } catch (error: any) {
    if (error.message.includes('not a member') || error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/:messageId/status:
 *   put:
 *     summary: Update message status
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const updateMessageStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const messageId = parseInt(req.params.messageId);
    const { status } = req.body;

    if (!status || !['sent', 'delivered', 'read'].includes(status)) {
      res.status(400).json({ error: 'Valid status is required (sent, delivered, read)' });
      return;
    }

    await messageService.updateMessageStatus(messageId, userId, status);
    res.json({ message: 'Message status updated' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/:messageId:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const messageId = parseInt(req.params.messageId);

    await messageService.deleteMessage(messageId, userId);
    res.json({ message: 'Message deleted' });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};
