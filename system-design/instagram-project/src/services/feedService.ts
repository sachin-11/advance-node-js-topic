import pool from '../config/database';
import { zrange, zcard, zadd, getRedisStatus } from '../config/redis';
import { PostModel } from '../models/postModel';
import { FollowModel } from '../models/followModel';

export class FeedService {
  /**
   * Get chronological feed from cache or database
   */
  async getChronologicalFeed(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const feedKey = `feed:${userId}`;
    const redisStatus = getRedisStatus();

    // Try to get from Redis cache
    if (redisStatus.connected) {
      const cachedPostIds = await zrange(feedKey, offset, offset + limit - 1, true); // Reverse order (newest first)

      if (cachedPostIds.length > 0) {
        // Fetch posts from database
        const posts = await this.getPostsByIds(cachedPostIds.map((id) => parseInt(id)));
        return posts;
      }
    }

    // Cache miss - generate from database
    return await this.generateChronologicalFeed(userId, limit, offset);
  }

  /**
   * Generate chronological feed from database
   * Includes posts from users you follow AND your own posts
   */
  private async generateChronologicalFeed(userId: number, limit: number, offset: number): Promise<any[]> {
    const query = `
      SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as user
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.deleted_at IS NULL
        AND (
          p.user_id = $1 
          OR p.user_id IN (
            SELECT following_id 
            FROM follows 
            WHERE follower_id = $1
          )
        )
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Get algorithmic feed with scoring
   * Includes posts from users you follow AND your own posts
   */
  async getAlgorithmicFeed(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    // Get posts from followed users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const query = `
      SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as user,
        (
          (p.like_count * 2) + 
          (p.comment_count * 3) + 
          (1000.0 / (EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 + 1))
        ) as score
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.deleted_at IS NULL
        AND p.created_at >= $2
        AND (
          p.user_id = $1 
          OR p.user_id IN (
            SELECT following_id 
            FROM follows 
            WHERE follower_id = $1
          )
        )
      ORDER BY score DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await pool.query(query, [userId, sevenDaysAgo, limit, offset]);
    return result.rows;
  }

  /**
   * Add post to all followers' feed caches AND creator's own feed
   */
  async addPostToFollowersFeeds(postId: number, userId: number): Promise<void> {
    try {
      const redisStatus = getRedisStatus();
      if (!redisStatus.connected) {
        return;
      }

      // Get all followers
      const followers = await FollowModel.getFollowers(userId, 10000, 0); // Get all followers

      const post = await PostModel.findById(postId);
      if (!post || !post.created_at) {
        return;
      }

      const timestamp = new Date(post.created_at).getTime();

      // Add to creator's own feed cache
      const creatorFeedKey = `feed:${userId}`;
      await zadd(creatorFeedKey, timestamp, postId.toString());

      // Add to each follower's feed cache
      for (const follower of followers) {
        const feedKey = `feed:${follower.id}`;
        await zadd(feedKey, timestamp, postId.toString());
      }
    } catch (error: any) {
      console.error('Failed to add post to followers feeds:', error.message);
      // Don't throw - feed cache update failure shouldn't break post creation
    }
  }

  /**
   * Get posts by IDs
   */
  private async getPostsByIds(postIds: number[]): Promise<any[]> {
    if (postIds.length === 0) {
      return [];
    }

    const query = `
      SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as user
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ANY($1::int[]) AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [postIds]);
    return result.rows;
  }

  /**
   * Refresh feed cache for a user
   * Includes posts from followed users AND own posts
   */
  async refreshFeedCache(userId: number): Promise<void> {
    try {
      const redisStatus = getRedisStatus();
      if (!redisStatus.connected) {
        return;
      }

      const feedKey = `feed:${userId}`;
      const followingIds = await FollowModel.getFollowingIds(userId);

      // Include own user ID in the list
      const userIdsToInclude = followingIds.length > 0 
        ? [...followingIds, userId]
        : [userId];

      // Get recent posts from followed users AND own posts
      const query = `
        SELECT id, created_at
        FROM posts
        WHERE user_id = ANY($1::int[]) 
          AND deleted_at IS NULL
          AND created_at >= NOW() - INTERVAL '30 days'
        ORDER BY created_at DESC
        LIMIT 1000
      `;

      const result = await pool.query(query, [userIdsToInclude]);

      // Clear existing cache
      // Note: We'll keep old posts and add new ones (Redis ZADD updates scores)

      // Add posts to cache
      for (const post of result.rows) {
        const timestamp = new Date(post.created_at).getTime();
        await zadd(feedKey, timestamp, post.id.toString());
      }
    } catch (error: any) {
      console.error('Failed to refresh feed cache:', error.message);
    }
  }
}

