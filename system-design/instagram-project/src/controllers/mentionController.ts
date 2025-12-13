import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MentionService } from '../services/mentionService';

const mentionService = new MentionService();

/**
 * @swagger
 * /api/mentions:
 *   get:
 *     summary: Get mentions timeline
 *     tags: [Mentions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Mentions timeline
 */
export const getMentions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const mentions = await mentionService.getUserMentions(req.userId, limit, offset);

    res.json({
      mentions,
      pagination: {
        limit,
        offset,
        count: mentions.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/mentions:
 *   get:
 *     summary: Get user mentions
 *     tags: [Mentions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: User mentions
 */
export const getUserMentions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const mentions = await mentionService.getUserMentions(userId, limit, offset);

    res.json({
      mentions,
      pagination: {
        limit,
        offset,
        count: mentions.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

