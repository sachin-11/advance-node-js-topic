import { BlockModel } from '../models/blockModel';
import { FollowModel } from '../models/followModel';
import { UserModel } from '../models/userModel';

export class BlockService {
  /**
   * Block a user
   */
  async blockUser(blockerId: number, blockedId: number): Promise<void> {
    // Check if trying to block self
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Check if user exists
    const user = await UserModel.findById(blockedId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already blocked
    const isAlreadyBlocked = await BlockModel.isBlocked(blockerId, blockedId);
    if (isAlreadyBlocked) {
      throw new Error('User already blocked');
    }

    // Create block relationship
    await BlockModel.create({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });

    // Unfollow if following
    const isFollowing = await FollowModel.isFollowing(blockerId, blockedId);
    if (isFollowing) {
      await FollowModel.delete(blockerId, blockedId);
      await UserModel.decrementFollowerCount(blockedId);
      await UserModel.decrementFollowingCount(blockerId);
    }

    // Unfollow if blocked user is following blocker
    const isFollowedBy = await FollowModel.isFollowing(blockedId, blockerId);
    if (isFollowedBy) {
      await FollowModel.delete(blockedId, blockerId);
      await UserModel.decrementFollowerCount(blockerId);
      await UserModel.decrementFollowingCount(blockedId);
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    const deleted = await BlockModel.delete(blockerId, blockedId);
    if (!deleted) {
      throw new Error('User not blocked');
    }
  }

  /**
   * Check if user is blocked
   */
  async isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    return await BlockModel.isBlocked(blockerId, blockedId);
  }

  /**
   * Get blocked users list
   */
  async getBlockedUsers(userId: number, limit: number = 20, offset: number = 0) {
    return await BlockModel.getBlockedUsers(userId, limit, offset);
  }

  /**
   * Get users who blocked this user
   */
  async getBlockedByUsers(userId: number): Promise<number[]> {
    return await BlockModel.getBlockedByUsers(userId);
  }
}

