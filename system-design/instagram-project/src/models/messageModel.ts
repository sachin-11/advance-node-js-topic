import pool from '../config/database';
import { Message } from './types';

export class MessageModel {
  static async create(message: Omit<Message, 'id' | 'created_at' | 'is_read'>): Promise<Message> {
    const query = `
      INSERT INTO messages (sender_id, receiver_id, content, media_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      message.sender_id,
      message.receiver_id,
      message.content,
      message.media_url || null,
    ]);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Message | null> {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getConversation(
    userId1: number,
    userId2: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const query = `
      SELECT 
        m.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as sender
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    const result = await pool.query(query, [userId1, userId2, limit, offset]);
    return result.rows.reverse(); // Reverse to show oldest first
  }

  static async getConversations(userId: number, limit: number = 20): Promise<any[]> {
    const query = `
      SELECT DISTINCT ON (other_user_id)
        m.*,
        json_build_object(
          'id', other_user.id,
          'username', other_user.username,
          'avatar_url', other_user.avatar_url
        ) as other_user,
        (
          SELECT COUNT(*)
          FROM messages
          WHERE receiver_id = $1
            AND sender_id = other_user_id
            AND is_read = FALSE
        ) as unread_count
      FROM (
        SELECT 
          CASE 
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END as other_user_id,
          *
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
      ) m
      JOIN users other_user ON m.other_user_id = other_user.id
      ORDER BY other_user_id, m.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  static async markAsRead(messageId: number, userId: number): Promise<boolean> {
    const query = `
      UPDATE messages
      SET is_read = TRUE
      WHERE id = $1 AND receiver_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [messageId, userId]);
    return result.rows.length > 0;
  }

  static async markConversationAsRead(senderId: number, receiverId: number): Promise<number> {
    const query = `
      UPDATE messages
      SET is_read = TRUE
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
      RETURNING id
    `;
    const result = await pool.query(query, [senderId, receiverId]);
    return result.rows.length;
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE receiver_id = $1 AND is_read = FALSE
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }
}

