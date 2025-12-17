import { Request, Response } from 'express';
import { query } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

export class WatchHistoryController {
  /**
   * @swagger
   * /api/user/watch-history:
   *   post:
   *     summary: Update watch history/progress
   *     tags: [Watch History]
   *     security:
   *       - bearerAuth: []
   */
  updateWatchHistory = catchAsync(async (req: Request, res: Response) => {
    if (!req.profile) {
      throw new AppError('Profile required', 400);
    }

    const { content_id, episode_id, watch_duration_seconds, total_duration_seconds, device_type, device_id } = req.body;

    if (!content_id || !watch_duration_seconds || !total_duration_seconds) {
      throw new AppError('Missing required fields', 400);
    }

    const completion_percentage = (watch_duration_seconds / total_duration_seconds) * 100;

    // Check if watch history exists
    const existingResult = await query(
      `SELECT id FROM watch_history 
       WHERE profile_id = $1 AND content_id = $2 AND episode_id IS NOT DISTINCT FROM $3
       ORDER BY watched_at DESC LIMIT 1`,
      [req.profile.id, content_id, episode_id || null]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      const result = await query(
        `UPDATE watch_history 
         SET watch_duration_seconds = $1, 
             total_duration_seconds = $2,
             completion_percentage = $3,
             device_type = $4,
             device_id = $5,
             watched_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [watch_duration_seconds, total_duration_seconds, completion_percentage, device_type, device_id, existingResult.rows[0].id]
      );

      return res.json({
        success: true,
        data: result.rows[0]
      });
    } else {
      // Create new
      const result = await query(
        `INSERT INTO watch_history 
         (profile_id, content_id, episode_id, watch_duration_seconds, total_duration_seconds, 
          completion_percentage, device_type, device_id, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          req.profile.id,
          content_id,
          episode_id || null,
          watch_duration_seconds,
          total_duration_seconds,
          completion_percentage,
          device_type,
          device_id,
          req.ip,
          req.get('user-agent')
        ]
      );

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    }
  });

  /**
   * @swagger
   * /api/user/watch-history/{contentId}:
   *   delete:
   *     summary: Remove from watch history
   *     tags: [Watch History]
   *     security:
   *       - bearerAuth: []
   */
  removeFromHistory = catchAsync(async (req: Request, res: Response) => {
    if (!req.profile) {
      throw new AppError('Profile required', 400);
    }

    await query(
      'DELETE FROM watch_history WHERE profile_id = $1 AND content_id = $2',
      [req.profile.id, req.params.contentId]
    );

    res.json({
      success: true,
      message: 'Removed from watch history'
    });
  });
}

export const watchHistoryController = new WatchHistoryController();