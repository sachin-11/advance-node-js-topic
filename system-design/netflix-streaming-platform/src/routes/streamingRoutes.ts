import express from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Streaming
 *     description: Video streaming endpoints
 */

/**
 * @swagger
 * /api/streaming/manifest/{contentId}:
 *   get:
 *     summary: Get streaming manifest (HLS/DASH)
 *     tags: [Streaming]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: episode_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: quality
 *         schema:
 *           type: string
 *           enum: [240p, 360p, 480p, 720p, 1080p, 4k, 8k]
 */
router.get('/manifest/:contentId', catchAsync(async (req, res) => {
  if (!req.profile) {
    throw new AppError('Profile required', 400);
  }

  const { episode_id, quality = '720p' } = req.query;

  // Get video file
  const videoResult = await query(
    `SELECT * FROM video_files 
     WHERE content_id = $1 
     AND episode_id IS NOT DISTINCT FROM $2
     AND quality = $3
     AND is_active = true
     LIMIT 1`,
    [req.params.contentId, episode_id || null, quality]
  );

  if (videoResult.rows.length === 0) {
    throw new AppError('Video file not found for requested quality', 404);
  }

  const videoFile = videoResult.rows[0];

  // Get content info
  const contentResult = await query(
    'SELECT * FROM content WHERE id = $1',
    [req.params.contentId]
  );

  if (contentResult.rows.length === 0) {
    throw new AppError('Content not found', 404);
  }

  // Record view analytics
  await query(
    `INSERT INTO content_views (content_id, episode_id, profile_id, quality_played, device_type, location_country)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      req.params.contentId,
      episode_id || null,
      req.profile.id,
      quality,
      req.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
      req.get('cf-ipcountry') || 'unknown'
    ]
  );

  res.json({
    success: true,
    data: {
      manifest_url: videoFile.manifest_url || videoFile.file_path,
      content_info: contentResult.rows[0],
      video_file: {
        quality: videoFile.quality,
        protocol: videoFile.protocol,
        duration_seconds: videoFile.duration_seconds,
        bitrate_kbps: videoFile.bitrate_kbps
      },
      available_qualities: await getAvailableQualities(req.params.contentId, episode_id as string)
    }
  });
}));

/**
 * @swagger
 * /api/streaming/qualities/{contentId}:
 *   get:
 *     summary: Get available video qualities
 *     tags: [Streaming]
 *     security:
 *       - bearerAuth: []
 */
router.get('/qualities/:contentId', catchAsync(async (req, res) => {
  const { episode_id } = req.query;

  const qualities = await getAvailableQualities(req.params.contentId, episode_id as string);

  res.json({
    success: true,
    data: qualities
  });
}));

async function getAvailableQualities(contentId: string, episodeId?: string): Promise<string[]> {
  const result = await query(
    `SELECT DISTINCT quality FROM video_files 
     WHERE content_id = $1 
     AND episode_id IS NOT DISTINCT FROM $2
     AND is_active = true
     ORDER BY 
       CASE quality
         WHEN '8k' THEN 1
         WHEN '4k' THEN 2
         WHEN '1080p' THEN 3
         WHEN '720p' THEN 4
         WHEN '480p' THEN 5
         WHEN '360p' THEN 6
         WHEN '240p' THEN 7
       END`,
    [contentId, episodeId || null]
  );

  return result.rows.map(row => row.quality);
}

export default router;