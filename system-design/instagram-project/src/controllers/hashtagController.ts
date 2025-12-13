import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { HashtagService } from '../services/hashtagService';

const hashtagService = new HashtagService();

/**
 * @swagger
 * /api/hashtags/{tag}:
 *   get:
 *     summary: Get posts with a specific hashtag
 *     tags: [Hashtags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         description: Hashtag (without #)
 *         example: photography
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
 *         description: Posts with hashtag
 */
export const getHashtagPosts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tag = req.params.tag;
    if (!tag) {
      res.status(400).json({ error: 'Hashtag is required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await hashtagService.getPostsByHashtag(tag, limit, offset);

    res.json({
      hashtag: result.hashtag,
      posts: result.posts,
      pagination: {
        limit,
        offset,
        count: result.posts.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/hashtags/trending:
 *   get:
 *     summary: Get trending hashtags
 *     tags: [Hashtags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Trending hashtags
 */
export const getTrending = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const hashtags = await hashtagService.getTrending(limit);

    res.json({
      hashtags,
      count: hashtags.length,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/search/hashtags:
 *   get:
 *     summary: Search hashtags
 *     tags: [Hashtags, Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: photo
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results
 */
export const searchHashtags = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      res.status(400).json({ error: 'Search query must be at least 2 characters' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const hashtags = await hashtagService.search(query, limit);

    res.json({
      hashtags,
      count: hashtags.length,
    });
  } catch (error: any) {
    next(error);
  }
};

