import pool from '../config/database';
import { User } from './types';

export class UserModel {
  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const query = `
      INSERT INTO users (phone_number, username, email, password_hash, full_name, profile_picture_url, status_message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      user.phone_number,
      user.username || null,
      user.email || null,
      user.password_hash,
      user.full_name || null,
      user.profile_picture_url || null,
      user.status_message || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, phone_number, username, email, full_name, profile_picture_url, 
             status_message, last_seen, is_online, created_at 
      FROM users 
      WHERE id = $1 AND is_active = TRUE
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  static async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE phone_number = $1 AND is_active = TRUE';
    const result = await pool.query(query, [phoneNumber]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, phone_number, username, email, full_name, profile_picture_url, 
             status_message, last_seen, is_online, created_at 
      FROM users 
      WHERE username = $1 AND is_active = TRUE
    `;
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, phone_number, username, email, full_name, profile_picture_url, 
             status_message, last_seen, is_online, created_at 
      FROM users 
      WHERE email = $1 AND is_active = TRUE
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  static async update(id: number, updates: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  }

  static async updateOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    await pool.query(
      'UPDATE users SET is_online = $1, last_seen = CURRENT_TIMESTAMP WHERE id = $2',
      [isOnline, id]
    );
  }

  static async findByPhoneNumbers(phoneNumbers: string[]): Promise<User[]> {
    if (phoneNumbers.length === 0) {
      return [];
    }

    const query = `
      SELECT id, phone_number, username, email, full_name, profile_picture_url, 
             status_message, last_seen, is_online, created_at 
      FROM users 
      WHERE phone_number = ANY($1::text[]) AND is_active = TRUE
    `;
    const result = await pool.query(query, [phoneNumbers]);
    return result.rows;
  }
}
