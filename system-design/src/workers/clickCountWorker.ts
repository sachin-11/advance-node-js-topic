import { UrlService } from '../services/urlService';
import { getRedisStatus } from '../cache/redis';

const urlService = new UrlService();
const FLUSH_INTERVAL_MS = 10000; // Flush every 10 seconds

let workerInterval: NodeJS.Timeout | null = null;

/**
 * Background worker to flush click counts from Redis to PostgreSQL
 * Runs periodically to batch update click counts
 */
export function startClickCountWorker(): void {
  console.log('Starting click count worker...');
  
  workerInterval = setInterval(async () => {
    try {
      // Only flush if Redis is connected
      const redisStatus = getRedisStatus();
      if (!redisStatus.connected) {
        return; // Skip if Redis is not available
      }
      
      await urlService.flushClickCounts();
      console.log('Click counts flushed to database');
    } catch (error: any) {
      // Don't log errors if Redis is intentionally not available
      if (error?.message?.includes('closed') || error?.message?.includes('ClientClosed')) {
        return; // Silent fail if Redis is closed
      }
      console.error('Error flushing click counts', error?.message || error);
    }
  }, FLUSH_INTERVAL_MS);
}

/**
 * Stop the click count worker
 */
export function stopClickCountWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('Click count worker stopped');
  }
}

