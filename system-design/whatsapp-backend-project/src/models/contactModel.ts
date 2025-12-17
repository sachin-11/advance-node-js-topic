import pool from '../config/database';
import { Contact, BlockedUser } from './types';

export class ContactModel {
  static async create(contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
    const query = `
      INSERT INTO contacts (user_id, contact_phone_number, contact_name, is_blocked)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, contact_phone_number) 
      DO UPDATE SET contact_name = $3, is_blocked = $4
      RETURNING *
    `;
    const values = [
      contact.user_id,
      contact.contact_phone_number,
      contact.contact_name || null,
      contact.is_blocked || false,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId: number): Promise<Contact[]> {
    const query = 'SELECT * FROM contacts WHERE user_id = $1 ORDER BY contact_name ASC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findByUserAndPhone(
    userId: number,
    phoneNumber: string
  ): Promise<Contact | null> {
    const query = 'SELECT * FROM contacts WHERE user_id = $1 AND contact_phone_number = $2';
    const result = await pool.query(query, [userId, phoneNumber]);
    return result.rows[0] || null;
  }

  static async update(userId: number, phoneNumber: string, updates: Partial<Contact>): Promise<Contact | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'user_id' && key !== 'contact_phone_number' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(userId, phoneNumber);

    const query = `UPDATE contacts SET ${fields.join(', ')} WHERE user_id = $${paramCount} AND contact_phone_number = $${paramCount + 1} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  }

  static async delete(userId: number, phoneNumber: string): Promise<void> {
    await pool.query('DELETE FROM contacts WHERE user_id = $1 AND contact_phone_number = $2', [
      userId,
      phoneNumber,
    ]);
  }
}

export class BlockedUserModel {
  static async block(blockerId: number, blockedId: number): Promise<BlockedUser> {
    const query = `
      INSERT INTO blocked_users (blocker_id, blocked_id)
      VALUES ($1, $2)
      ON CONFLICT (blocker_id, blocked_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [blockerId, blockedId]);
    return result.rows[0];
  }

  static async unblock(blockerId: number, blockedId: number): Promise<void> {
    await pool.query('DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2', [
      blockerId,
      blockedId,
    ]);
  }

  static async isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    const query = 'SELECT 1 FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2';
    const result = await pool.query(query, [blockerId, blockedId]);
    return result.rows.length > 0;
  }

  static async getBlockedUsers(userId: number): Promise<BlockedUser[]> {
    const query = 'SELECT * FROM blocked_users WHERE blocker_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}
