import pool from '../config/database';
import { Mute } from './types';

export class MuteModel {
  static async create(mute: Omit<Mute, 'created_at'>): Promise<Mute> {
    const query = `
      INSERT INTO mutes (muter_id, muted_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [mute.muter_id, mute.muted_id]);
    return result.rows[0];
  }

  static async delete(muterId: number, mutedId: number): Promise<boolean> {
    const query = `
      DELETE FROM mutes
      WHERE muter_id = $1 AND muted_id = $2
      RETURNING muter_id
    `;
    const result = await pool.query(query, [muterId, mutedId]);
    return result.rows.length > 0;
  }

  static async isMuted(muterId: number, mutedId: number): Promise<boolean> {
    const query = `
      SELECT muter_id FROM mutes
      WHERE muter_id = $1 AND muted_id = $2
    `;
    const result = await pool.query(query, [muterId, mutedId]);
    return result.rows.length > 0;
  }

  static async getMutedUsers(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        m.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_url', u.avatar_url
        ) as muted_user
      FROM mutes m
      JOIN users u ON m.muted_id = u.id
      WHERE m.muter_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }
}

