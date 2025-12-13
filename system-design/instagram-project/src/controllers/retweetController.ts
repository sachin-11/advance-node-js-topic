import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RetweetService } from '../services/retweetService';

const retweetService = new RetweetService();

/**
 * @swagger
 * /api/posts/{id}/repost:
 *   post:
 *     summary: Repost a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID to repost
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Optional comment for quote repost
 *                 example: Great post!
 *     responses:
 *       200:
 *         description: Post reposted successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Post not found
 */
export const repost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const { comment } = req.body;

    await retweetService.repost(req.userId, postId, comment);

    res.json({ message: 'Post reposted successfully' });
  } catch (error: any) {
    if (error.message.includes('already reposted') || error.message.includes('own post')) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/posts/{id}/repost:
 *   delete:
 *     summary: Undo repost
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Repost undone successfully
 *       404:
 *         description: Repost not found
 */
export const undoRepost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    await retweetService.undoRepost(req.userId, postId);

    res.json({ message: 'Repost undone successfully' });
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
 * /api/posts/{id}/reposts:
 *   get:
 *     summary: Get users who reposted a post
 *     tags: [Posts]
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
 *         description: List of users who reposted
 */
export const getReposts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const reposts = await retweetService.getRepostUsers(postId, limit, offset);
    const count = await retweetService.getRepostCount(postId);

    res.json({
      reposts,
      count,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

