import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Redis client for caching and rate limiting
 */
const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        if (!redisDisabled) {
          console.log('⚠️  Redis: Max reconnection attempts reached. Running without Redis cache.');
          console.log('💡 To enable Redis: brew services start redis (macOS) or docker run -d -p 6379:6379 redis');
          redisDisabled = true; // Mark Redis as disabled
        }
        return false; // Stop reconnecting
      }
      return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
    },
  },
});

let isConnected = false;
let connectionAttempted = false;
let redisDisabled = false; // Track if we've given up on Redis

redisClient.on('error', (err) => {
  // Suppress errors if Redis is disabled or not yet attempted
  if (redisDisabled || !connectionAttempted) {
    return;
  }
  // Only log errors if we're actively trying to connect
  if (isConnected) {
    console.error('Redis Client Error', err.message);
  }
});

redisClient.on('connect', () => {
  isConnected = true;
  redisDisabled = false; // Reset disabled flag if we reconnect
  console.log('✅ Redis Client Connected');
});

redisClient.on('ready', () => {
  isConnected = true;
  redisDisabled = false; // Reset disabled flag if we reconnect
  console.log('✅ Redis Client Ready');
});

redisClient.on('reconnecting', () => {
  // Suppress reconnection messages if we've disabled Redis
  if (!redisDisabled) {
    // Only log first few reconnection attempts
    const retryCount = (redisClient as any).reconnectAttempts || 0;
    if (retryCount <= 3) {
      console.log('🔄 Redis Client Reconnecting...');
    }
  }
});

redisClient.on('end', () => {
  isConnected = false;
  if (!redisDisabled) {
    console.log('⚠️  Redis Client Disconnected');
  }
});

/**
 * Initialize Redis connection (non-blocking)
 */
async function initializeRedis(): Promise<void> {
  if (connectionAttempted) return;
  
  connectionAttempted = true;
  try {
    await redisClient.connect();
    isConnected = true;
  } catch (error: any) {
    isConnected = false;
    redisDisabled = true;
    // Only show warning once
    console.warn('⚠️  Redis not available. App will run without caching.');
    console.warn('💡 To enable Redis: brew services start redis (macOS) or docker run -d -p 6379:6379 redis');
  }
}

// Initialize connection in background (non-blocking)
initializeRedis().catch(() => {
  // Silent fail - app continues without Redis
});

/**
 * Check if Redis is connected
 */
function isRedisConnected(): boolean {
  if (redisDisabled) {
    return false; // Don't try to use Redis if we've disabled it
  }
  try {
    return isConnected && redisClient.isReady === true;
  } catch {
    return false;
  }
}

/**
 * Get a value from Redis cache
 */
export async function get(key: string): Promise<string | null> {
  if (!isRedisConnected()) {
    return null; // Fail silently if Redis is not available
  }
  try {
    return await redisClient.get(key);
  } catch (error: any) {
    // Don't log errors if Redis is intentionally not available
    if (isConnected) {
      console.error('Redis GET error', { key, error: error.message });
    }
    return null;
  }
}

/**
 * Set a value in Redis cache with optional expiration
 */
export async function set(key: string, value: string, expireSeconds?: number): Promise<void> {
  if (!isRedisConnected()) {
    return; // Fail silently if Redis is not available
  }
  try {
    if (expireSeconds) {
      await redisClient.setEx(key, expireSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error: any) {
    // Don't log errors if Redis is intentionally not available
    if (isConnected) {
      console.error('Redis SET error', { key, error: error.message });
    }
  }
}

/**
 * Delete a key from Redis
 */
export async function del(key: string): Promise<void> {
  if (!isRedisConnected()) {
    return; // Fail silently if Redis is not available
  }
  try {
    await redisClient.del(key);
  } catch (error: any) {
    // Don't log errors if Redis is intentionally not available
    if (isConnected) {
      console.error('Redis DEL error', { key, error: error.message });
    }
  }
}

/**
 * Increment a counter in Redis
 */
export async function incr(key: string): Promise<number> {
  if (!isRedisConnected()) {
    return 0; // Fail silently if Redis is not available
  }
  try {
    return await redisClient.incr(key);
  } catch (error: any) {
    // Don't log errors if Redis is intentionally not available
    if (isConnected) {
      console.error('Redis INCR error', { key, error: error.message });
    }
    return 0;
  }
}

/**
 * Get multiple keys matching a pattern
 */
export async function keys(pattern: string): Promise<string[]> {
  if (!isRedisConnected()) {
    return []; // Fail silently if Redis is not available
  }
  try {
    return await redisClient.keys(pattern);
  } catch (error: any) {
    // Don't log errors if Redis is intentionally not available
    if (isConnected) {
      console.error('Redis KEYS error', { pattern, error: error.message });
    }
    return [];
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (isRedisConnected()) {
    try {
      await redisClient.quit();
    } catch (error: any) {
      console.error('Error closing Redis connection', error.message);
    }
  }
}

/**
 * Get Redis connection status
 */
export function getRedisStatus(): { connected: boolean; ready: boolean; disabled: boolean } {
  try {
    return {
      connected: isConnected && !redisDisabled,
      ready: (redisClient.isReady === true) && !redisDisabled,
      disabled: redisDisabled,
    };
  } catch {
    return {
      connected: false,
      ready: false,
      disabled: true,
    };
  }
}

export default redisClient;

