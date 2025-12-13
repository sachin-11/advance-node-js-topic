import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/userModel';
import { FollowService } from '../services/followService';
import { BlockService } from '../services/blockService';
import { MuteService } from '../services/muteService';

const followService = new FollowService();
const blockService = new BlockService();
const muteService = new MuteService();

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 avatar_url:
 *                   type: string
 *                 follower_count:
 *                   type: integer
 *                 following_count:
 *                   type: integer
 *                 post_count:
 *                   type: integer
 *                 is_following:
 *                   type: boolean
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.userId) {
      isFollowing = await followService.isFollowing(req.userId, userId);
    }

    res.json({
      ...user,
      is_following: isFollowing,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to follow
 *         example: 2
 *     responses:
 *       200:
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User followed successfully
 *       400:
 *         description: Cannot follow (self-follow, already following, or user not found)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Follow rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const followUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const followingId = parseInt(req.params.id);

    if (isNaN(followingId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    await followService.followUser(req.userId, followingId);

    res.json({ message: 'User followed successfully' });
  } catch (error: any) {
    if (error.message.includes('Cannot follow') || error.message.includes('Already following') || error.message.includes('not found')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to unfollow
 *         example: 2
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User unfollowed successfully
 *       400:
 *         description: Not following this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const unfollowUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const followingId = parseInt(req.params.id);

    if (isNaN(followingId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    await followService.unfollowUser(req.userId, followingId);

    res.json({ message: 'User unfollowed successfully' });
  } catch (error: any) {
    if (error.message.includes('Not following')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/followers:
 *   get:
 *     summary: Get user's followers list
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of followers to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of followers to skip
 *     responses:
 *       200:
 *         description: Followers list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       avatar_url:
 *                         type: string
 *                       followed_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     count:
 *                       type: integer
 */
export const getFollowers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const followers = await followService.getFollowers(userId, limit, offset);

    res.json({
      followers,
      pagination: {
        limit,
        offset,
        count: followers.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/following:
 *   get:
 *     summary: Get users that this user is following
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of users to skip
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       avatar_url:
 *                         type: string
 *                       followed_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     count:
 *                       type: integer
 */
export const getFollowing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const following = await followService.getFollowing(userId, limit, offset);

    res.json({
      following,
      pagination: {
        limit,
        offset,
        count: following.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/block:
 *   post:
 *     summary: Block a user
 *     tags: [Users]
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
 *         description: User blocked successfully
 */
export const blockUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    await blockService.blockUser(req.userId, userId);

    res.json({ message: 'User blocked successfully' });
  } catch (error: any) {
    if (error.message.includes('yourself') || error.message.includes('already blocked')) {
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
 * /api/users/{id}/block:
 *   delete:
 *     summary: Unblock a user
 *     tags: [Users]
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
 *         description: User unblocked successfully
 */
export const unblockUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    await blockService.unblockUser(req.userId, userId);

    res.json({ message: 'User unblocked successfully' });
  } catch (error: any) {
    if (error.message.includes('not blocked')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/mute:
 *   post:
 *     summary: Mute a user
 *     tags: [Users]
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
 *         description: User muted successfully
 */
export const muteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    await muteService.muteUser(req.userId, userId);

    res.json({ message: 'User muted successfully' });
  } catch (error: any) {
    if (error.message.includes('yourself') || error.message.includes('already muted')) {
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
 * /api/users/{id}/mute:
 *   delete:
 *     summary: Unmute a user
 *     tags: [Users]
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
 *         description: User unmuted successfully
 */
export const unmuteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    await muteService.unmuteUser(req.userId, userId);

    res.json({ message: 'User unmuted successfully' });
  } catch (error: any) {
    if (error.message.includes('not muted')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/blocked:
 *   get:
 *     summary: Get blocked users list
 *     tags: [Users]
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
 *         description: Blocked users list
 */
export const getBlockedUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId) || userId !== req.userId) {
      res.status(403).json({ error: 'Can only view your own blocked users' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const blockedUsers = await blockService.getBlockedUsers(userId, limit, offset);

    res.json({
      blocked_users: blockedUsers,
      pagination: {
        limit,
        offset,
        count: blockedUsers.length,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

