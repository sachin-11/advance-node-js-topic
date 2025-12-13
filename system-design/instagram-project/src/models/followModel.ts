import pool from '../config/database';
import { Follow } from './types';

export class FollowModel {
  static async create(follow: Follow): Promise<Follow> {
    const query = `
      INSERT INTO follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [follow.follower_id, follow.following_id]);

    if (result.rows.length === 0) {
      throw new Error('Already following this user');
    }

    return result.rows[0];
  }

  static async delete(followerId: number, followingId: number): Promise<boolean> {
    const query = `
      DELETE FROM follows
      WHERE follower_id = $1 AND following_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [followerId, followingId]);
    return result.rows.length > 0;
  }

  static async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM follows
      WHERE follower_id = $1 AND following_id = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [followerId, followingId]);
    return result.rows.length > 0;
  }

  static async getFollowers(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.avatar_url,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async getFollowing(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.avatar_url,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async getFollowingIds(userId: number): Promise<number[]> {
    const query = `
      SELECT following_id FROM follows
      WHERE follower_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row) => row.following_id);
  }
}

