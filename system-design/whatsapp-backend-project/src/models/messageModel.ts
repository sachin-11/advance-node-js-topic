import pool from '../config/database';
import { Message, MessageStatus } from './types';

export class MessageModel {
  static async create(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message> {
    const query = `
      INSERT INTO messages (
        chat_id, group_id, sender_id, content, message_type, 
        media_url, media_thumbnail_url, media_size, media_duration,
        location_latitude, location_longitude, reply_to_message_id, is_forwarded
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      message.chat_id || null,
      message.group_id || null,
      message.sender_id,
      message.content || null,
      message.message_type || 'text',
      message.media_url || null,
      message.media_thumbnail_url || null,
      message.media_size || null,
      message.media_duration || null,
      message.location_latitude || null,
      message.location_longitude || null,
      message.reply_to_message_id || null,
      message.is_forwarded || false,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Message | null> {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByChatId(
    chatId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE chat_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [chatId, limit, offset]);
    return result.rows.reverse(); // Return in chronological order
  }

  static async findByGroupId(
    groupId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE group_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [groupId, limit, offset]);
    return result.rows.reverse(); // Return in chronological order
  }

  static async updateStatus(
    messageId: number,
    userId: number,
    status: string
  ): Promise<MessageStatus> {
    const query = `
      INSERT INTO message_status (message_id, user_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (message_id, user_id) 
      DO UPDATE SET status = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [messageId, userId, status]);
    return result.rows[0];
  }

  static async updateGroupMessageStatus(
    messageId: number,
    userId: number,
    status: string
  ): Promise<MessageStatus> {
    const query = `
      INSERT INTO group_message_status (message_id, user_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (message_id, user_id) 
      DO UPDATE SET status = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [messageId, userId, status]);
    return result.rows[0];
  }

  static async getStatus(messageId: number, userId: number): Promise<MessageStatus | null> {
    const query = 'SELECT * FROM message_status WHERE message_id = $1 AND user_id = $2';
    const result = await pool.query(query, [messageId, userId]);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
  }
}
