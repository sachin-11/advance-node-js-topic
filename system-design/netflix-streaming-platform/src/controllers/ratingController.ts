import { Request, Response } from 'express';
import { query } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

export class RatingController {
  /**
   * @swagger
   * /api/content/{contentId}/rating:
   *   post:
   *     summary: Rate content
   *     tags: [Ratings]
   *     security:
   *       - bearerAuth: []
   */
  rateContent = catchAsync(async (req: Request, res: Response) => {
    if (!req.profile) {
      throw new AppError('Profile required', 400);
    }

    const { rating_type, rating_value, review_text, is_public } = req.body;
    const content_id = req.params.contentId;

    if (!rating_type) {
      throw new AppError('Rating type is required', 400);
    }

    // Validate rating value based on type
    if (rating_type === 'star_rating' && (!rating_value || rating_value < 1 || rating_value > 5)) {
      throw new AppError('Star rating must be between 1 and 5', 400);
    }

    // Check if rating exists
    const existingResult = await query(
      'SELECT id FROM ratings WHERE profile_id = $1 AND content_id = $2',
      [req.profile.id, content_id]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      const result = await query(
        `UPDATE ratings 
         SET rating_type = $1, rating_value = $2, review_text = $3, is_public = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [rating_type, rating_value, review_text || null, is_public || false, existingResult.rows[0].id]
      );

      return res.json({
        success: true,
        data: result.rows[0]
      });
    } else {
      // Create new
      const result = await query(
        `INSERT INTO ratings (profile_id, content_id, rating_type, rating_value, review_text, is_public)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.profile.id, content_id, rating_type, rating_value, review_text || null, is_public || false]
      );

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    }
  });

  /**
   * @swagger
   * /api/content/{contentId}/rating:
   *   get:
   *     summary: Get user's rating for content
   *     tags: [Ratings]
   *     security:
   *       - bearerAuth: []
   */
  getUserRating = catchAsync(async (req: Request, res: Response) => {
    if (!req.profile) {
      throw new AppError('Profile required', 400);
    }

    const result = await query(
      'SELECT * FROM ratings WHERE profile_id = $1 AND content_id = $2',
      [req.profile.id, req.params.contentId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  });

  /**
   * @swagger
   * /api/content/{contentId}/ratings:
   *   get:
   *     summary: Get all ratings for content
   *     tags: [Ratings]
   */
  getContentRatings = catchAsync(async (req: Request, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT r.*, p.name as profile_name
       FROM ratings r
       JOIN profiles p ON r.profile_id = p.id
       WHERE r.content_id = $1 AND r.is_public = true
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.contentId, parseInt(limit as string), parseInt(offset as string)]
    );

    const avgResult = await query(
      `SELECT 
       AVG(rating_value) as avg_rating,
       COUNT(*) as total_ratings
       FROM ratings 
       WHERE content_id = $1 AND rating_type = 'star_rating'`,
      [req.params.contentId]
    );

    res.json({
      success: true,
      data: result.rows,
      summary: avgResult.rows[0],
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  });
}

export const ratingController = new RatingController();