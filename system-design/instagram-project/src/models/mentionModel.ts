import pool from '../config/database';
import { Mention } from './types';

export class MentionModel {
  static async create(mention: Omit<Mention, 'id' | 'created_at'>): Promise<Mention> {
    const query = `
      INSERT INTO mentions (post_id, comment_id, mentioned_user_id, mentioned_by_user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      mention.post_id || null,
      mention.comment_id || null,
      mention.mentioned_user_id,
      mention.mentioned_by_user_id,
    ]);
    return result.rows[0];
  }

  static async findByUserId(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        m.*,
        CASE 
          WHEN m.post_id IS NOT NULL THEN json_build_object('id', p.id, 'caption', p.caption)
          ELSE NULL
        END as post,
        CASE 
          WHEN m.comment_id IS NOT NULL THEN json_build_object('id', c.id, 'content', c.content)
          ELSE NULL
        END as comment,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as mentioned_by
      FROM mentions m
      LEFT JOIN posts p ON m.post_id = p.id
      LEFT JOIN comments c ON m.comment_id = c.id
      JOIN users u ON m.mentioned_by_user_id = u.id
      WHERE m.mentioned_user_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async countUnread(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM mentions
      WHERE mentioned_user_id = $1
      AND created_at > (
        SELECT COALESCE(MAX(created_at), '1970-01-01'::timestamp)
        FROM notifications
        WHERE user_id = $1 AND type = 'mention'
      )
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }
}

