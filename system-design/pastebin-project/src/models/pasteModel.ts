import pool from '../config/database';
import { Paste } from './types';

export class PasteModel {
    static async create(paste: Partial<Paste>): Promise<Paste> {
        const query = `
            INSERT INTO pastes (
                paste_id, title, content, content_location, content_url,
                language, user_id, privacy, password_hash,
                expires_at, max_views, burn_after_reading, content_size
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        const values = [
            paste.paste_id,
            paste.title || null,
            paste.content || null,
            paste.content_location || 'db',
            paste.content_url || null,
            paste.language || 'text',
            paste.user_id || null,
            paste.privacy || 'public',
            paste.password_hash || null,
            paste.expires_at || null,
            paste.max_views || null,
            paste.burn_after_reading || false,
            paste.content_size || 0,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findById(pasteId: string): Promise<Paste | null> {
        const query = 'SELECT * FROM pastes WHERE paste_id = $1 AND deleted_at IS NULL';
        const result = await pool.query(query, [pasteId]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    static async incrementViewCount(pasteId: string): Promise<void> {
        const query = 'UPDATE pastes SET view_count = view_count + 1 WHERE paste_id = $1';
        await pool.query(query, [pasteId]);
    }

    static async update(pasteId: string, updates: Partial<Paste>): Promise<Paste | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return null;
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(pasteId);

        const query = `UPDATE pastes SET ${fields.join(', ')} WHERE paste_id = $${paramCount} RETURNING *`;
        const result = await pool.query(query, values);

        return result.rows[0] || null;
    }

    static async delete(pasteId: string): Promise<void> {
        const query = 'UPDATE pastes SET deleted_at = CURRENT_TIMESTAMP WHERE paste_id = $1';
        await pool.query(query, [pasteId]);
    }
}
