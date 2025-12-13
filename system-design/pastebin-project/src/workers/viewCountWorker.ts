import { PasteService } from '../services/pasteService';
import { getRedisStatus } from '../config/redis';

const pasteService = new PasteService();
const FLUSH_INTERVAL_MS = 10000; // Flush every 10 seconds

let workerInterval: NodeJS.Timeout | null = null;

/**
 * Background worker to flush view counts from Redis to PostgreSQL
 * Runs periodically to batch update view counts
 */
export function startViewCountWorker(): void {
  console.log('Starting view count worker...');
  
  workerInterval = setInterval(async () => {
    try {
      // Only flush if Redis is connected
      const redisStatus = getRedisStatus();
      if (!redisStatus.connected) {
        return; // Skip if Redis is not available
      }
      
      await pasteService.flushViewCounts();
      console.log('View counts flushed to database');
    } catch (error: any) {
      // Don't log errors if Redis is intentionally not available
      if (error?.message?.includes('closed') || error?.message?.includes('ClientClosed')) {
        return; // Silent fail if Redis is closed
      }
      console.error('Error flushing view counts', error?.message || error);
    }
  }, FLUSH_INTERVAL_MS);
}

/**
 * Stop the view count worker
 */
export function stopViewCountWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('View count worker stopped');
  }
}

