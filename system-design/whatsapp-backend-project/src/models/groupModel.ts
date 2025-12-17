import pool from '../config/database';
import { Group, GroupMember } from './types';

export class GroupModel {
  static async create(group: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
    const query = `
      INSERT INTO groups (name, description, profile_picture_url, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      group.name,
      group.description || null,
      group.profile_picture_url || null,
      group.created_by,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Group | null> {
    const query = 'SELECT * FROM groups WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number): Promise<Group[]> {
    const query = `
      SELECT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = $1
      ORDER BY g.updated_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async update(id: number, updates: Partial<Group>): Promise<Group | null> {
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

    const query = `UPDATE groups SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM groups WHERE id = $1', [id]);
  }
}

export class GroupMemberModel {
  static async addMember(
    groupId: number,
    userId: number,
    role: string = 'member'
  ): Promise<GroupMember> {
    const query = `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (group_id, user_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [groupId, userId, role]);
    return result.rows[0];
  }

  static async removeMember(groupId: number, userId: number): Promise<void> {
    await pool.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [
      groupId,
      userId,
    ]);
  }

  static async findByGroupId(groupId: number): Promise<GroupMember[]> {
    const query = 'SELECT * FROM group_members WHERE group_id = $1 ORDER BY joined_at ASC';
    const result = await pool.query(query, [groupId]);
    return result.rows;
  }

  static async findByGroupAndUser(groupId: number, userId: number): Promise<GroupMember | null> {
    const query = 'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2';
    const result = await pool.query(query, [groupId, userId]);
    return result.rows[0] || null;
  }

  static async updateRole(groupId: number, userId: number, role: string): Promise<void> {
    await pool.query(
      'UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3',
      [role, groupId, userId]
    );
  }

  static async incrementUnreadCount(groupId: number, userId: number): Promise<void> {
    await pool.query(
      'UPDATE group_members SET unread_count = unread_count + 1 WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
  }

  static async markAsRead(groupId: number, userId: number): Promise<void> {
    await pool.query(
      'UPDATE group_members SET unread_count = 0 WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
  }
}
