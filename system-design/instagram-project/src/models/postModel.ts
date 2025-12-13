import pool from '../config/database';
import { Post, PostWithUser } from './types';

export class PostModel {
  static async create(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    const query = `
      INSERT INTO posts (
        user_id, caption, image_url, thumbnail_url, medium_url, image_metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      post.user_id,
      post.caption || null,
      post.image_url,
      post.thumbnail_url || null,
      post.medium_url || null,
      post.image_metadata ? JSON.stringify(post.image_metadata) : null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<PostWithUser | null> {
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
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const post = result.rows[0];
    post.user = post.user;
    return post;
  }

  static async findByUserId(userId: number, limit: number = 20, offset: number = 0): Promise<Post[]> {
    const query = `
      SELECT * FROM posts
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const query = `
      UPDATE posts
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows.length > 0;
  }

  static async incrementLikeCount(postId: number): Promise<void> {
    await pool.query('UPDATE posts SET like_count = like_count + 1 WHERE id = $1', [postId]);
  }

  static async decrementLikeCount(postId: number): Promise<void> {
    await pool.query('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1', [postId]);
  }

  static async incrementCommentCount(postId: number): Promise<void> {
    await pool.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [postId]);
  }

  static async decrementCommentCount(postId: number): Promise<void> {
    await pool.query('UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1', [postId]);
  }

  static async incrementRetweetCount(postId: number): Promise<void> {
    await pool.query('UPDATE posts SET retweet_count = retweet_count + 1 WHERE id = $1', [postId]);
  }

  static async decrementRetweetCount(postId: number): Promise<void> {
    await pool.query('UPDATE posts SET retweet_count = GREATEST(retweet_count - 1, 0) WHERE id = $1', [postId]);
  }
}

