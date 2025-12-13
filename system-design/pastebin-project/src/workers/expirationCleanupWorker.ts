import pool from '../config/database';
import { del, keys, getRedisStatus } from '../config/redis';

/**
 * Background worker to clean up expired pastes
 * Runs periodically to remove expired pastes from database and cache
 */
let workerInterval: NodeJS.Timeout | null = null;

export function startExpirationCleanupWorker(): void {
  console.log('Starting expiration cleanup worker...');
  
  // Run every hour
  workerInterval = setInterval(async () => {
    try {
      const redisStatus = getRedisStatus();
      if (!redisStatus.connected) {
        return; // Skip if Redis is not available
      }

      // Find expired pastes
      const expiredPastes = await pool.query(
        `SELECT paste_id, content_location, content_url 
         FROM pastes 
         WHERE (expires_at IS NOT NULL AND expires_at < NOW()) 
            OR (max_views IS NOT NULL AND view_count >= max_views)
            OR (burn_after_reading = TRUE AND viewed_once = TRUE)
         AND deleted_at IS NULL
         LIMIT 1000`
      );

      if (expiredPastes.rows.length === 0) {
        return; // No expired pastes
      }

      let cleaned = 0;
      for (const paste of expiredPastes.rows) {
        try {
          // Delete from database (soft delete)
          await pool.query(
            'UPDATE pastes SET deleted_at = NOW() WHERE paste_id = $1',
            [paste.paste_id]
          );

          // Delete from cache
          await del(`paste:${paste.paste_id}`);
          await del(`views:${paste.paste_id}`);

          // TODO: Delete from S3 if content_location = 's3'
          // if (paste.content_location === 's3' && paste.content_url) {
          //   await s3.deleteObject(paste.content_url);
          // }

          cleaned++;
        } catch (error: any) {
          console.error(`Error cleaning paste ${paste.paste_id}:`, error.message);
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired pastes`);
      }
    } catch (error: any) {
      console.error('Error in expiration cleanup worker', error.message);
    }
  }, 3600000); // 1 hour = 3600000ms
}

/**
 * Stop the expiration cleanup worker
 */
export function stopExpirationCleanupWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('Expiration cleanup worker stopped');
  }
}

