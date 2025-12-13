import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { FollowService } from '../services/followService';
import { TweetService } from '../services/tweetService';
import { authenticate } from '../middlewares/auth';

const router = Router();
const userService = new UserService();
const followService = new FollowService();
const tweetService = new TweetService();

/**
 * Get user profile
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * Update user profile
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);

        if (userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Can only update your own profile' });
        }

        const user = await userService.updateProfile(userId, req.body);
        res.json(user);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * Get user's tweets
 */
router.get('/:id/tweets', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const tweets = await tweetService.getUserTweets(userId, limit, offset);
        res.json(tweets);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * Follow user
 */
router.post('/:id/follow', authenticate, async (req: Request, res: Response) => {
    try {
        const followingId = parseInt(req.params.id);
        await followService.followUser(req.user!.userId, followingId);
        res.json({ message: 'User followed successfully' });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * Unfollow user
 */
router.delete('/:id/follow', authenticate, async (req: Request, res: Response) => {
    try {
        const followingId = parseInt(req.params.id);
        await followService.unfollowUser(req.user!.userId, followingId);
        res.json({ message: 'User unfollowed successfully' });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * Get followers
 */
router.get('/:id/followers', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const followers = await followService.getFollowers(userId, limit, offset);
        res.json(followers);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * Get following
 */
router.get('/:id/following', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const following = await followService.getFollowing(userId, limit, offset);
        res.json(following);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

/**
 * Search users
 */
router.get('/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const users = await userService.searchUsers(query, limit, offset);
        res.json(users);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

export default router;
