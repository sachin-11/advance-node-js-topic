import pool from '../config/database';
import { Notification } from './types';

export class NotificationModel {
  static async create(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      notification.user_id,
      notification.actor_id,
      notification.type,
      notification.post_id || null,
      notification.comment_id || null,
    ]);
    return result.rows[0];
  }

  static async findByUserId(
    userId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    const query = `
      SELECT 
        n.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url,
          'verified', u.verified
        ) as actor,
        CASE 
          WHEN n.post_id IS NOT NULL THEN json_build_object('id', p.id, 'caption', p.caption, 'image_url', p.image_url)
          ELSE NULL
        END as post
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows.length > 0;
  }

  static async markAllAsRead(userId: number): Promise<number> {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING id
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.length;
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = FALSE
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  static async deleteByPostId(postId: number): Promise<void> {
    await pool.query('DELETE FROM notifications WHERE post_id = $1', [postId]);
  }

  static async deleteByCommentId(commentId: number): Promise<void> {
    await pool.query('DELETE FROM notifications WHERE comment_id = $1', [commentId]);
  }
}

