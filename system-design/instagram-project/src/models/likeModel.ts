import pool from '../config/database';

export class LikeModel {
    static async create(userId: number, postId: number): Promise<void> {
        await pool.query(
            'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, postId]
        );
    }

    static async delete(userId: number, postId: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async exists(userId: number, postId: number): Promise<boolean> {
        const result = await pool.query(
            'SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );
        return result.rows.length > 0;
    }

    static async countByPostId(postId: number): Promise<number> {
        const result = await pool.query(
            'SELECT COUNT(*) FROM likes WHERE post_id = $1',
            [postId]
        );
        return parseInt(result.rows[0].count);
    }
}
