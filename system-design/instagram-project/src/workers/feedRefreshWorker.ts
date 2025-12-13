import { FeedService } from '../services/feedService';
import { getRedisStatus } from '../config/redis';
import pool from '../config/database';

const feedService = new FeedService();
const REFRESH_INTERVAL_MS = 300000; // 5 minutes

let workerInterval: NodeJS.Timeout | null = null;

/**
 * Background worker to refresh feed caches
 * Updates feed scores and handles new posts
 */
export function startFeedRefreshWorker(): void {
  console.log('Starting feed refresh worker...');

  workerInterval = setInterval(async () => {
    try {
      const redisStatus = getRedisStatus();
      if (!redisStatus.connected) {
        return; // Skip if Redis is not available
      }

      // Get all active users
      const users = await pool.query(
        'SELECT id FROM users WHERE is_active = TRUE LIMIT 1000'
      );

      let refreshed = 0;
      for (const user of users.rows) {
        try {
          await feedService.refreshFeedCache(user.id);
          refreshed++;
        } catch (error: any) {
          console.error(`Failed to refresh feed for user ${user.id}:`, error.message);
        }
      }

      if (refreshed > 0) {
        console.log(`🔄 Refreshed feed cache for ${refreshed} users`);
      }
    } catch (error: any) {
      console.error('Error in feed refresh worker', error.message);
    }
  }, REFRESH_INTERVAL_MS);
}

/**
 * Stop the feed refresh worker
 */
export function stopFeedRefreshWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('Feed refresh worker stopped');
  }
}

