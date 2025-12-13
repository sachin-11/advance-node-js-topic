import pool from '../config/database';
import { Hashtag } from './types';

export class HashtagModel {
  static async findOrCreate(tag: string): Promise<Hashtag> {
    // Normalize tag (lowercase, remove #)
    const normalizedTag = tag.toLowerCase().replace(/^#/, '');

    // Try to find existing
    const findQuery = 'SELECT * FROM hashtags WHERE tag = $1';
    const findResult = await pool.query(findQuery, [normalizedTag]);

    if (findResult.rows.length > 0) {
      return findResult.rows[0];
    }

    // Create new
    const createQuery = `
      INSERT INTO hashtags (tag)
      VALUES ($1)
      RETURNING *
    `;
    const createResult = await pool.query(createQuery, [normalizedTag]);
    return createResult.rows[0];
  }

  static async findById(id: number): Promise<Hashtag | null> {
    const query = 'SELECT * FROM hashtags WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByTag(tag: string): Promise<Hashtag | null> {
    const normalizedTag = tag.toLowerCase().replace(/^#/, '');
    const query = 'SELECT * FROM hashtags WHERE tag = $1';
    const result = await pool.query(query, [normalizedTag]);
    return result.rows[0] || null;
  }

  static async incrementPostCount(hashtagId: number): Promise<void> {
    await pool.query(
      'UPDATE hashtags SET post_count = post_count + 1 WHERE id = $1',
      [hashtagId]
    );
  }

  static async decrementPostCount(hashtagId: number): Promise<void> {
    await pool.query(
      'UPDATE hashtags SET post_count = GREATEST(post_count - 1, 0) WHERE id = $1',
      [hashtagId]
    );
  }

  static async getTrending(limit: number = 50): Promise<Hashtag[]> {
    const query = `
      SELECT * FROM hashtags
      WHERE post_count > 0
      ORDER BY post_count DESC, created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async search(query: string, limit: number = 20): Promise<Hashtag[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    const searchQuery = `
      SELECT * FROM hashtags
      WHERE tag LIKE $1
      ORDER BY post_count DESC
      LIMIT $2
    `;
    const result = await pool.query(searchQuery, [searchTerm, limit]);
    return result.rows;
  }

  static async linkPostToHashtag(postId: number, hashtagId: number): Promise<void> {
    const query = `
      INSERT INTO post_hashtags (post_id, hashtag_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;
    await pool.query(query, [postId, hashtagId]);
  }

  static async unlinkPostFromHashtag(postId: number, hashtagId: number): Promise<void> {
    const query = `
      DELETE FROM post_hashtags
      WHERE post_id = $1 AND hashtag_id = $2
    `;
    await pool.query(query, [postId, hashtagId]);
  }

  static async getPostHashtags(postId: number): Promise<Hashtag[]> {
    const query = `
      SELECT h.*
      FROM hashtags h
      JOIN post_hashtags ph ON h.id = ph.hashtag_id
      WHERE ph.post_id = $1
    `;
    const result = await pool.query(query, [postId]);
    return result.rows;
  }
}

