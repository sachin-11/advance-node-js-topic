import pool from '../config/database';
import { Retweet } from './types';

export class RetweetModel {
  static async create(retweet: Omit<Retweet, 'id' | 'created_at'>): Promise<Retweet> {
    const query = `
      INSERT INTO retweets (user_id, post_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [
      retweet.user_id,
      retweet.post_id,
      retweet.comment || null,
    ]);
    return result.rows[0];
  }

  static async delete(userId: number, postId: number): Promise<boolean> {
    const query = `
      DELETE FROM retweets
      WHERE user_id = $1 AND post_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [userId, postId]);
    return result.rows.length > 0;
  }

  static async isRetweeted(userId: number, postId: number): Promise<boolean> {
    const query = `
      SELECT id FROM retweets
      WHERE user_id = $1 AND post_id = $2
    `;
    const result = await pool.query(query, [userId, postId]);
    return result.rows.length > 0;
  }

  static async findByPostId(postId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        r.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url,
          'verified', u.verified
        ) as user
      FROM retweets r
      JOIN users u ON r.user_id = u.id
      WHERE r.post_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [postId, limit, offset]);
    return result.rows;
  }

  static async countByPostId(postId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM retweets
      WHERE post_id = $1
    `;
    const result = await pool.query(query, [postId]);
    return parseInt(result.rows[0].count, 10);
  }

  static async findByUserId(userId: number, limit: number = 20, offset: number = 0): Promise<Retweet[]> {
    const query = `
      SELECT * FROM retweets
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }
}

