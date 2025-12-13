import pool from '../config/database';
import { Comment } from './types';

export class CommentModel {
    static async create(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<Comment> {
        const query = `
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
        const result = await pool.query(query, [comment.post_id, comment.user_id, comment.content]);
        return result.rows[0];
    }

    static async findByPostId(postId: number, limit: number = 50, offset: number = 0): Promise<Comment[]> {
        const query = `
      SELECT c.*, u.username, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1 AND c.deleted_at IS NULL
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3
    `;
        const result = await pool.query(query, [postId, limit, offset]);
        return result.rows;
    }

    static async delete(id: number, userId: number): Promise<boolean> {
        const query = `
      UPDATE comments
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
        const result = await pool.query(query, [id, userId]);
        return (result.rowCount ?? 0) > 0;
    }
}
