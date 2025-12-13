import pool from '../config/database';
import { Block } from './types';

export class BlockModel {
  static async create(block: Omit<Block, 'created_at'>): Promise<Block> {
    const query = `
      INSERT INTO blocks (blocker_id, blocked_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [block.blocker_id, block.blocked_id]);
    return result.rows[0];
  }

  static async delete(blockerId: number, blockedId: number): Promise<boolean> {
    const query = `
      DELETE FROM blocks
      WHERE blocker_id = $1 AND blocked_id = $2
      RETURNING blocker_id
    `;
    const result = await pool.query(query, [blockerId, blockedId]);
    return result.rows.length > 0;
  }

  static async isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    const query = `
      SELECT blocker_id FROM blocks
      WHERE blocker_id = $1 AND blocked_id = $2
    `;
    const result = await pool.query(query, [blockerId, blockedId]);
    return result.rows.length > 0;
  }

  static async getBlockedUsers(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        b.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as blocked_user
      FROM blocks b
      JOIN users u ON b.blocked_id = u.id
      WHERE b.blocker_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async getBlockedByUsers(userId: number): Promise<number[]> {
    const query = `
      SELECT blocker_id
      FROM blocks
      WHERE blocked_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row) => row.blocker_id);
  }
}

