import { Router, Request, Response } from 'express';
import { TweetService } from '../services/tweetService';
import { authenticate } from '../middlewares/auth';

const router = Router();
const tweetService = new TweetService();

/**
 * @swagger
 * /api/tweets:
 *   post:
 *     summary: Create a new tweet
 *     tags: [Tweets]
 *     security:
 *       - bearerAuth: []
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
 *               media_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *               reply_to_id:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tweet created successfully
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const tweet = await tweetService.createTweet(req.user!.userId, req.body);
        res.status(201).json(tweet);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/tweets/{id}:
 *   get:
 *     summary: Get tweet by ID
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tweet details
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const tweetId = parseInt(req.params.id);
        const tweet = await tweetService.getTweetById(tweetId, req.user?.userId);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        res.json(tweet);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/tweets/{id}:
 *   delete:
 *     summary: Delete a tweet
 *     tags: [Tweets]
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
 *         description: Tweet deleted successfully
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const tweetId = parseInt(req.params.id);
        await tweetService.deleteTweet(tweetId, req.user!.userId);
        res.json({ message: 'Tweet deleted successfully' });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/tweets/{id}/replies:
 *   get:
 *     summary: Get tweet replies
 *     tags: [Tweets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of replies
 */
router.get('/:id/replies', async (req: Request, res: Response) => {
    try {
        const tweetId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const replies = await tweetService.getTweetReplies(tweetId, limit, offset);
        res.json(replies);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

export default router;
