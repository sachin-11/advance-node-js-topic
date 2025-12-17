import pool from '../config/database';
import { Chat } from './types';

export class ChatModel {
  static async create(chat: Omit<Chat, 'id' | 'created_at' | 'updated_at'>): Promise<Chat> {
    // Ensure user1_id < user2_id for consistency
    const user1Id = Math.min(chat.user1_id, chat.user2_id);
    const user2Id = Math.max(chat.user1_id, chat.user2_id);

    const query = `
      INSERT INTO chats (user1_id, user2_id)
      VALUES ($1, $2)
      ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [user1Id, user2Id]);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Chat | null> {
    const query = 'SELECT * FROM chats WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUsers(user1Id: number, user2Id: number): Promise<Chat | null> {
    const u1 = Math.min(user1Id, user2Id);
    const u2 = Math.max(user1Id, user2Id);

    const query = 'SELECT * FROM chats WHERE user1_id = $1 AND user2_id = $2';
    const result = await pool.query(query, [u1, u2]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<Chat[]> {
    const query = `
      SELECT * FROM chats 
      WHERE user1_id = $1 OR user2_id = $1
      ORDER BY last_message_at DESC NULLS LAST, updated_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async updateLastMessage(
    chatId: number,
    messageId: number,
    userId: number
  ): Promise<void> {
    const chat = await this.findById(chatId);
    if (!chat) return;

    // Determine which user's unread count to increment
    const isUser1 = chat.user1_id === userId;
    const unreadField = isUser1 ? 'user1_unread_count' : 'user2_unread_count';

    await pool.query(
      `UPDATE chats 
       SET last_message_id = $1, 
           last_message_at = CURRENT_TIMESTAMP,
           ${unreadField} = ${unreadField} + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [messageId, chatId]
    );
  }

  static async markAsRead(chatId: number, userId: number): Promise<void> {
    const chat = await this.findById(chatId);
    if (!chat) return;

    const isUser1 = chat.user1_id === userId;
    const unreadField = isUser1 ? 'user1_unread_count' : 'user2_unread_count';

    await pool.query(
      `UPDATE chats SET ${unreadField} = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [chatId]
    );
  }

  static async getUnreadCount(chatId: number, userId: number): Promise<number> {
    const chat = await this.findById(chatId);
    if (!chat) return 0;

    const isUser1 = chat.user1_id === userId;
    return isUser1 ? (chat.user1_unread_count || 0) : (chat.user2_unread_count || 0);
  }
}
