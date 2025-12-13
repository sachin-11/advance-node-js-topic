import { HashtagModel } from '../models/hashtagModel';
import { extractHashtags, isValidHashtag } from '../utils/textParser';
import { getRedisStatus, set, get } from '../config/redis';

export class HashtagService {
  /**
   * Process hashtags from text and link to post
   */
  async processHashtags(text: string, postId: number): Promise<void> {
    if (!text) return;

    const hashtags = extractHashtags(text);

    for (const tag of hashtags) {
      if (!isValidHashtag(tag)) {
        continue; // Skip invalid hashtags
      }

      try {
        // Find or create hashtag
        const hashtag = await HashtagModel.findOrCreate(tag);

        // Link post to hashtag
        await HashtagModel.linkPostToHashtag(postId, hashtag.id!);

        // Increment post count
        await HashtagModel.incrementPostCount(hashtag.id!);
      } catch (error) {
        console.error(`Failed to process hashtag ${tag}:`, error);
        // Continue with other hashtags
      }
    }
  }

  /**
   * Remove hashtags from post
   */
  async removeHashtags(postId: number): Promise<void> {
    const hashtags = await HashtagModel.getPostHashtags(postId);

    for (const hashtag of hashtags) {
      await HashtagModel.unlinkPostFromHashtag(postId, hashtag.id!);
      await HashtagModel.decrementPostCount(hashtag.id!);
    }
  }

  /**
   * Get posts with a specific hashtag
   */
  async getPostsByHashtag(tag: string, limit: number = 20, offset: number = 0) {
    const hashtag = await HashtagModel.findByTag(tag);
    if (!hashtag) {
      return { posts: [], hashtag: null };
    }

    // Get post IDs from junction table
    const { default: pool } = await import('../config/database');
    const query = `
      SELECT p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url,
          'verified', u.verified
        ) as user
      FROM posts p
      JOIN post_hashtags ph ON p.id = ph.post_id
      JOIN users u ON p.user_id = u.id
      WHERE ph.hashtag_id = $1 AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [hashtag.id, limit, offset]);
    return { posts: result.rows, hashtag };
  }

  /**
   * Get trending hashtags
   */
  async getTrending(limit: number = 50): Promise<any[]> {
    const cacheKey = `trending:hashtags:${limit}`;
    const redisStatus = getRedisStatus();

    // Try cache first
    if (redisStatus.connected) {
      const cached = await get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // Get from database
    const hashtags = await HashtagModel.getTrending(limit);

    // Cache for 5 minutes
    if (redisStatus.connected) {
      await set(cacheKey, JSON.stringify(hashtags), 300);
    }

    return hashtags;
  }

  /**
   * Search hashtags
   */
  async search(query: string, limit: number = 20): Promise<any[]> {
    if (!query || query.length < 2) {
      return [];
    }

    return await HashtagModel.search(query, limit);
  }

  /**
   * Get hashtags for a post
   */
  async getPostHashtags(postId: number): Promise<any[]> {
    return await HashtagModel.getPostHashtags(postId);
  }
}

