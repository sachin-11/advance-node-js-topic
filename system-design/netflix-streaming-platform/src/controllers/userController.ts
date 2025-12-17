import { Request, Response } from 'express';
import { query } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  /**
   * @swagger
   * /api/user/profiles:
   *   get:
   *     summary: Get all profiles for authenticated user
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of user profiles
   */
  getProfiles = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const profiles = await query(
      'SELECT * FROM profiles WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: profiles.rows,
      count: profiles.rows.length
    });
  });

  /**
   * @swagger
   * /api/user/profiles:
   *   post:
   *     summary: Create a new profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *               avatar_url:
   *                 type: string
   *               is_kids_profile:
   *                 type: boolean
   *               pin_code:
   *                 type: string
   *               language:
   *                 type: string
   *               autoplay:
   *                 type: boolean
   */
  createProfile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { name, avatar_url, is_kids_profile, pin_code, language, autoplay } = req.body;

    // Check profile limit
    const userResult = await query('SELECT max_profiles FROM users WHERE id = $1', [req.user.id]);
    const currentProfiles = await query('SELECT COUNT(*) FROM profiles WHERE user_id = $1', [req.user.id]);
    
    if (parseInt(currentProfiles.rows[0].count) >= userResult.rows[0].max_profiles) {
      throw new AppError('Maximum profile limit reached', 400);
    }

    const result = await query(
      `INSERT INTO profiles (user_id, name, avatar_url, is_kids_profile, pin_code, language, autoplay)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, name, avatar_url || null, is_kids_profile || false, pin_code || null, language || 'en', autoplay !== false]
    );

    // Create default "My List" for new profile
    await query(
      'INSERT INTO user_lists (profile_id, name, is_default) VALUES ($1, $2, $3)',
      [result.rows[0].id, 'My List', true]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  });

  /**
   * @swagger
   * /api/user/profiles/{profileId}:
   *   get:
   *     summary: Get profile by ID
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  getProfile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const result = await query(
      'SELECT * FROM profiles WHERE id = $1 AND user_id = $2',
      [req.params.profileId, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Profile not found', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  });

  /**
   * @swagger
   * /api/user/profiles/{profileId}:
   *   put:
   *     summary: Update profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  updateProfile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { name, avatar_url, language, autoplay } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(avatar_url);
    }
    if (language) {
      updates.push(`language = $${paramCount++}`);
      values.push(language);
    }
    if (autoplay !== undefined) {
      updates.push(`autoplay = $${paramCount++}`);
      values.push(autoplay);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(req.params.profileId, req.user.id);

    const result = await query(
      `UPDATE profiles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount++} AND user_id = $${paramCount++}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('Profile not found', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  });

  /**
   * @swagger
   * /api/user/profiles/{profileId}:
   *   delete:
   *     summary: Delete profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  deleteProfile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const result = await query(
      'DELETE FROM profiles WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.profileId, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Profile not found', 404);
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  });

  /**
   * @swagger
   * /api/user/watch-history:
   *   get:
   *     summary: Get watch history for current profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  getWatchHistory = catchAsync(async (req: Request, res: Response) => {
    if (!req.profile) {
      throw new AppError('Profile required', 400);
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT wh.*, c.title, c.poster_url, c.content_type, c.duration_minutes
       FROM watch_history wh
       JOIN content c ON wh.content_id = c.id
       WHERE wh.profile_id = $1
       ORDER BY wh.watched_at DESC
       LIMIT $2 OFFSET $3`,
      [req.profile.id, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM watch_history WHERE profile_id = $1',
      [req.profile.id]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit,
        offset,
        hasMore: offset + limit < parseInt(countResult.rows[0].count)
      }
    });
  });

  /**
   * @swagger
   * /api/user/continue-watching:
   *   get:
   *     summary: Get continue watching content
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  getContinueWatching = catchAsync(async (req: Request, res: Response) => {
    if (!req.profile) {
      throw new AppError('Profile required', 400);
    }

    const result = await query(
      `SELECT DISTINCT ON (wh.content_id) 
       wh.*, c.title, c.poster_url, c.content_type, c.duration_minutes,
       (wh.watch_duration_seconds::float / wh.total_duration_seconds::float * 100) as progress_percentage
       FROM watch_history wh
       JOIN content c ON wh.content_id = c.id
       WHERE wh.profile_id = $1 
       AND wh.completion_percentage < 90
       ORDER BY wh.content_id, wh.watched_at DESC
       LIMIT 20`,
      [req.profile.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  });
}

export const userController = new UserController();