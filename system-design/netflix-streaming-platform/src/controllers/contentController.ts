import { Request, Response } from 'express';
import { query } from '../config/database';
import { cache } from '../config/redis';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

export class ContentController {
  /**
   * @swagger
   * /api/content/browse:
   *   get:
   *     summary: Browse content by category
   *     tags: [Content]
   */
  browseContent = catchAsync(async (req: Request, res: Response) => {
    const { category_id, content_type, limit = 20, offset = 0 } = req.query;

    let sql = `
      SELECT DISTINCT c.*, 
      COALESCE(
        (SELECT AVG(rating_value) FROM ratings WHERE content_id = c.id AND rating_type = 'star_rating'),
        0
      ) as avg_rating
      FROM content c
      LEFT JOIN content_categories cc ON c.id = cc.content_id
      WHERE c.is_active = true
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (category_id) {
      sql += ` AND cc.category_id = $${paramCount++}`;
      params.push(category_id);
    }

    if (content_type) {
      sql += ` AND c.content_type = $${paramCount++}`;
      params.push(content_type);
    }

    sql += ` ORDER BY c.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  });

  /**
   * @swagger
   * /api/content/{id}:
   *   get:
   *     summary: Get content details by ID
   *     tags: [Content]
   */
  getContentById = catchAsync(async (req: Request, res: Response) => {
    const cacheKey = `content:${req.params.id}`;
    
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    const result = await query(
      `SELECT c.*, 
       COALESCE(
         (SELECT AVG(rating_value) FROM ratings WHERE content_id = c.id AND rating_type = 'star_rating'),
         0
       ) as avg_rating,
       (SELECT COUNT(*) FROM ratings WHERE content_id = c.id) as rating_count
       FROM content c
       WHERE c.id = $1 AND c.is_active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Content not found', 404);
    }

    const content = result.rows[0];

    // Get categories
    const categoriesResult = await query(
      `SELECT cat.* FROM categories cat
       JOIN content_categories cc ON cat.id = cc.category_id
       WHERE cc.content_id = $1`,
      [req.params.id]
    );
    content.categories = categoriesResult.rows;

    // Get video files
    const videoFilesResult = await query(
      'SELECT * FROM video_files WHERE content_id = $1 AND is_active = true ORDER BY quality',
      [req.params.id]
    );
    content.video_files = videoFilesResult.rows;

    // If TV show, get episodes
    if (content.content_type === 'tv_show') {
      const tvShowResult = await query('SELECT * FROM tv_shows WHERE id = $1', [req.params.id]);
      if (tvShowResult.rows.length > 0) {
        content.tv_show_info = tvShowResult.rows[0];

        const episodesResult = await query(
          `SELECT e.*, c.title as content_title
           FROM episodes e
           LEFT JOIN content c ON e.content_id = c.id
           WHERE e.tv_show_id = $1
           ORDER BY e.season_number, e.episode_number`,
          [req.params.id]
        );
        content.episodes = episodesResult.rows;
      }
    }

    // Cache for 1 hour
    await cache.set(cacheKey, content, 3600);

    res.json({
      success: true,
      data: content
    });
  });

  /**
   * @swagger
   * /api/content/categories:
   *   get:
   *     summary: Get all categories
   *     tags: [Content]
   */
  getCategories = catchAsync(async (req: Request, res: Response) => {
    const cacheKey = 'categories:all';
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    const result = await query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC'
    );

    await cache.set(cacheKey, result.rows, 3600);

    res.json({
      success: true,
      data: result.rows
    });
  });

  /**
   * @swagger
   * /api/content/categories/{categoryId}/content:
   *   get:
   *     summary: Get content by category
   *     tags: [Content]
   */
  getContentByCategory = catchAsync(async (req: Request, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT DISTINCT c.* FROM content c
       JOIN content_categories cc ON c.id = cc.content_id
       WHERE cc.category_id = $1 AND c.is_active = true
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.categoryId, parseInt(limit as string), parseInt(offset as string)]
    );

    res.json({
      success: true,
      data: result.rows
    });
  });

  /**
   * @swagger
   * /api/content/trending:
   *   get:
   *     summary: Get trending content
   *     tags: [Content]
   */
  getTrending = catchAsync(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await query(
      `SELECT c.*, COUNT(cv.id) as view_count
       FROM content c
       LEFT JOIN content_views cv ON c.id = cv.content_id
       WHERE c.is_active = true
       AND cv.view_start_time > NOW() - INTERVAL '7 days'
       GROUP BY c.id
       ORDER BY view_count DESC, c.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  });
}

export const contentController = new ContentController();