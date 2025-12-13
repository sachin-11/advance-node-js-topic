import { Router } from 'express';
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  blockUser,
  unblockUser,
  muteUser,
  unmuteUser,
  getBlockedUsers,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { followRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/:id', authenticate, getUserProfile);
router.post('/:id/follow', authenticate, followRateLimiter(), followUser);
router.delete('/:id/follow', authenticate, unfollowUser);
router.get('/:id/followers', authenticate, getFollowers);
router.get('/:id/following', authenticate, getFollowing);
router.post('/:id/block', authenticate, blockUser);
router.delete('/:id/block', authenticate, unblockUser);
router.post('/:id/mute', authenticate, muteUser);
router.delete('/:id/mute', authenticate, unmuteUser);
router.get('/:id/blocked', authenticate, getBlockedUsers);

export default router;

