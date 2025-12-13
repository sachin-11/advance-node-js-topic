import pool from '../config/database';
import { encodeBase62 } from './base62';

/**
 * Generate unique paste ID using database sequence + Base62 encoding
 * Similar to TinyURL approach - guaranteed unique IDs
 */
export const generatePasteId = async (): Promise<string> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Insert a placeholder row to get the next ID
        const insertResult = await client.query(
            'INSERT INTO pastes (paste_id, content) VALUES ($1, $2) RETURNING id',
            ['', '']
        );
        
        const id = insertResult.rows[0].id;
        const pasteId = encodeBase62(id);
        
        // Delete the placeholder row
        await client.query('DELETE FROM pastes WHERE id = $1', [id]);
        
        await client.query('COMMIT');
        return pasteId;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
