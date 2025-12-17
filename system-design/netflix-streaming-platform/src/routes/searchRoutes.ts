import express from 'express';
import { query } from '../config/database';
import { optionalAuth } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = express.Router();

router.use(optionalAuth);

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search content
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: content_type
 *         schema:
 *           type: string
 *           enum: [movie, tv_show, episode]
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get('/', catchAsync(async (req, res) => {
  const { q, content_type, genre, limit = 20, offset = 0 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  let sql = `
    SELECT DISTINCT c.*,
    ts_rank(
      to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.description, '')),
      plainto_tsquery('english', $1)
    ) as rank
    FROM content c
    WHERE c.is_active = true
    AND (
      to_tsvector('english', COALESCE(c.title, '') || ' ' || COALESCE(c.description, '')) 
      @@ plainto_tsquery('english', $1)
      OR c.title ILIKE $2
      OR EXISTS (
        SELECT 1 FROM unnest(c.cast) AS actor 
        WHERE actor ILIKE $2
      )
      OR EXISTS (
        SELECT 1 FROM unnest(c.genres) AS g 
        WHERE g ILIKE $2
      )
    )
  `;

  const params: any[] = [q, `%${q}%`];
  let paramCount = 3;

  if (content_type) {
    sql += ` AND c.content_type = $${paramCount++}`;
    params.push(content_type);
  }

  if (genre) {
    sql += ` AND $${paramCount++} = ANY(c.genres)`;
    params.push(genre);
  }

  sql += ` ORDER BY rank DESC, c.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(parseInt(limit as string), parseInt(offset as string));

  const result = await query(sql, params);

  res.json({
    success: true,
    data: result.rows,
    query: q,
    pagination: {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }
  });
}));

export default router;