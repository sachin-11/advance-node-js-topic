import { FollowModel } from '../models/followModel';
import { UserModel } from '../models/userModel';
import { zadd, zrem } from '../config/redis';
import { PostModel } from '../models/postModel';

export class FollowService {
  /**
   * Follow a user
   */
  async followUser(followerId: number, followingId: number): Promise<void> {
    // Check if trying to follow self
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if user exists
    const user = await UserModel.findById(followingId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already following
    const isAlreadyFollowing = await FollowModel.isFollowing(followerId, followingId);
    if (isAlreadyFollowing) {
      throw new Error('Already following this user');
    }

    // Create follow relationship
    await FollowModel.create({
      follower_id: followerId,
      following_id: followingId,
    });

    // Update counters
    await UserModel.incrementFollowerCount(followingId);
    await UserModel.incrementFollowingCount(followerId);

    // Add followed user's posts to follower's feed cache
    await this.addUserPostsToFeed(followerId, followingId);
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    // Check if following
    const isFollowing = await FollowModel.isFollowing(followerId, followingId);
    if (!isFollowing) {
      throw new Error('Not following this user');
    }

    // Delete follow relationship
    await FollowModel.delete(followerId, followingId);

    // Update counters
    await UserModel.decrementFollowerCount(followingId);
    await UserModel.decrementFollowingCount(followerId);

    // Remove followed user's posts from follower's feed cache
    await this.removeUserPostsFromFeed(followerId, followingId);
  }

  /**
   * Add user's posts to follower's feed cache
   */
  private async addUserPostsToFeed(followerId: number, followingId: number): Promise<void> {
    try {
      const posts = await PostModel.findByUserId(followingId, 100, 0); // Get recent 100 posts

      const feedKey = `feed:${followerId}`;

      for (const post of posts) {
        if (post.created_at) {
          const timestamp = new Date(post.created_at).getTime();
          await zadd(feedKey, timestamp, post.id!.toString());
        }
      }
    } catch (error: any) {
      console.error('Failed to add posts to feed cache:', error.message);
      // Don't throw - feed cache update failure shouldn't break follow
    }
  }

  /**
   * Remove user's posts from follower's feed cache
   */
  private async removeUserPostsFromFeed(followerId: number, followingId: number): Promise<void> {
    try {
      const posts = await PostModel.findByUserId(followingId, 1000, 0); // Get all posts

      const feedKey = `feed:${followerId}`;

      for (const post of posts) {
        await zrem(feedKey, post.id!.toString());
      }
    } catch (error: any) {
      console.error('Failed to remove posts from feed cache:', error.message);
      // Don't throw - feed cache update failure shouldn't break unfollow
    }
  }

  /**
   * Get followers list
   */
  async getFollowers(userId: number, limit: number = 20, offset: number = 0) {
    return await FollowModel.getFollowers(userId, limit, offset);
  }

  /**
   * Get following list
   */
  async getFollowing(userId: number, limit: number = 20, offset: number = 0) {
    return await FollowModel.getFollowing(userId, limit, offset);
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return await FollowModel.isFollowing(followerId, followingId);
  }
}

