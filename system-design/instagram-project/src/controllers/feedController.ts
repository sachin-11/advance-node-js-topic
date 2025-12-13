import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FeedService } from '../services/feedService';

const feedService = new FeedService();

/**
 * @swagger
 * /api/feed:
 *   get:
 *     summary: Get user's chronological feed
 *     description: Returns posts from users you follow, ordered by creation time (newest first). Uses Redis cache for fast retrieval.
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip (for pagination)
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     count:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getFeed = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const posts = await feedService.getChronologicalFeed(req.userId, limit, offset);

    res.json({
      posts,
      pagination: {
        limit,
        offset,
        count: posts.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/feed/algorithmic:
 *   get:
 *     summary: Get algorithmic feed
 *     description: Returns posts from users you follow, sorted by engagement score. Score = (likes × 2) + (comments × 3) + recency_score. Only includes posts from last 7 days.
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip (for pagination)
 *     responses:
 *       200:
 *         description: Algorithmic feed retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Post'
 *                       - type: object
 *                         properties:
 *                           score:
 *                             type: number
 *                             description: Engagement score
 *                             example: 760.5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     count:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getAlgorithmicFeed = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const posts = await feedService.getAlgorithmicFeed(req.userId, limit, offset);

    res.json({
      posts,
      pagination: {
        limit,
        offset,
        count: posts.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

