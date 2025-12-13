import pool from '../config/database';
import { User } from './types';

export class UserModel {
  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const query = `
      INSERT INTO users (username, email, password_hash, bio, avatar_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      user.username,
      user.email,
      user.password_hash,
      user.bio || null,
      user.avatar_url || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<User | null> {
    const query = 'SELECT id, username, email, bio, avatar_url, follower_count, following_count, post_count, created_at FROM users WHERE id = $1 AND is_active = TRUE';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = TRUE';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT id, username, email, bio, avatar_url, follower_count, following_count, post_count, created_at FROM users WHERE username = $1 AND is_active = TRUE';
    const result = await pool.query(query, [username]);

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
      if (value !== undefined && key !== 'id') {
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

  static async incrementPostCount(userId: number): Promise<void> {
    await pool.query('UPDATE users SET post_count = post_count + 1 WHERE id = $1', [userId]);
  }

  static async decrementPostCount(userId: number): Promise<void> {
    await pool.query('UPDATE users SET post_count = GREATEST(post_count - 1, 0) WHERE id = $1', [userId]);
  }

  static async incrementFollowerCount(userId: number): Promise<void> {
    await pool.query('UPDATE users SET follower_count = follower_count + 1 WHERE id = $1', [userId]);
  }

  static async decrementFollowerCount(userId: number): Promise<void> {
    await pool.query('UPDATE users SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = $1', [userId]);
  }

  static async incrementFollowingCount(userId: number): Promise<void> {
    await pool.query('UPDATE users SET following_count = following_count + 1 WHERE id = $1', [userId]);
  }

  static async decrementFollowingCount(userId: number): Promise<void> {
    await pool.query('UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = $1', [userId]);
  }
}

