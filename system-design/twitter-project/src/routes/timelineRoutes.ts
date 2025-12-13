import { Router, Request, Response } from 'express';
import { TimelineService } from '../services/timelineService';
import { authenticate } from '../middlewares/auth';

const router = Router();
const timelineService = new TimelineService();

/**
 * @swagger
 * /api/timeline/home:
 *   get:
 *     summary: Get home timeline
 *     tags: [Timeline]
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
 *         description: List of tweets from followed users
 */
router.get('/home', authenticate, async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const tweets = await timelineService.getHomeTimeline(req.user!.userId, limit, offset);
        res.json(tweets);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/timeline/user/{id}:
 *   get:
 *     summary: Get user timeline
 *     tags: [Timeline]
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
 *         description: List of user's tweets
 */
router.get('/user/:id', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const tweets = await timelineService.getUserTimeline(userId, limit, offset);
        res.json(tweets);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

export default router;
