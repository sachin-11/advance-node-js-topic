import { RetweetModel } from '../models/retweetModel';
import { PostModel } from '../models/postModel';
import { NotificationModel } from '../models/notificationModel';
import { Post } from '../models/types';

export class RetweetService {
  /**
   * Repost a post
   */
  async repost(userId: number, postId: number, comment?: string): Promise<void> {
    // Check if already reposted
    const isAlreadyReposted = await RetweetModel.isRetweeted(userId, postId);
    if (isAlreadyReposted) {
      throw new Error('Post already reposted');
    }

    // Check if post exists
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Prevent reposting own post
    if (post.user_id === userId) {
      throw new Error('Cannot repost your own post');
    }

    // Create retweet
    await RetweetModel.create({
      user_id: userId,
      post_id: postId,
      comment: comment || undefined,
    });

    // Increment retweet count
    await PostModel.incrementRetweetCount(postId);

    // Create notification for post owner
    if (post.user_id !== userId) {
      try {
        await NotificationModel.create({
          user_id: post.user_id,
          actor_id: userId,
          type: 'repost',
          post_id: postId,
        });
      } catch (error) {
        console.error('Failed to create repost notification:', error);
        // Don't throw - notification failure shouldn't break repost
      }
    }
  }

  /**
   * Undo repost
   */
  async undoRepost(userId: number, postId: number): Promise<void> {
    const deleted = await RetweetModel.delete(userId, postId);
    if (!deleted) {
      throw new Error('Repost not found');
    }

    // Decrement retweet count
    await PostModel.decrementRetweetCount(postId);
  }

  /**
   * Get users who reposted a post
   */
  async getRepostUsers(postId: number, limit: number = 20, offset: number = 0) {
    return await RetweetModel.findByPostId(postId, limit, offset);
  }

  /**
   * Get repost count for a post
   */
  async getRepostCount(postId: number): Promise<number> {
    return await RetweetModel.countByPostId(postId);
  }

  /**
   * Check if user has reposted a post
   */
  async isReposted(userId: number, postId: number): Promise<boolean> {
    return await RetweetModel.isRetweeted(userId, postId);
  }
}

