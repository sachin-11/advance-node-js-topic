import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        if (!redisDisabled) {
          console.log('⚠️  Redis: Max reconnection attempts reached. Running without Redis cache.');
          redisDisabled = true;
        }
        return false;
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

let isConnected = false;
let connectionAttempted = false;
let redisDisabled = false;

redisClient.on('error', (err) => {
  if (redisDisabled || !connectionAttempted) {
    return;
  }
  if (isConnected) {
    console.error('Redis Client Error', err.message);
  }
});

redisClient.on('connect', () => {
  isConnected = true;
  redisDisabled = false;
  console.log('✅ Redis Client Connected');
});

redisClient.on('ready', () => {
  isConnected = true;
  redisDisabled = false;
  console.log('✅ Redis Client Ready');
});

async function initializeRedis(): Promise<void> {
  if (connectionAttempted) return;
  
  connectionAttempted = true;
  try {
    await redisClient.connect();
    isConnected = true;
  } catch (error: any) {
    isConnected = false;
    redisDisabled = true;
    console.warn('⚠️  Redis not available. App will run without caching.');
  }
}

initializeRedis().catch(() => {});

function isRedisConnected(): boolean {
  if (redisDisabled) {
    return false;
  }
  try {
    return isConnected && redisClient.isReady === true;
  } catch {
    return false;
  }
}

export async function get(key: string): Promise<string | null> {
  if (!isRedisConnected()) {
    return null;
  }
  try {
    return await redisClient.get(key);
  } catch (error: any) {
    if (isConnected) {
      console.error('Redis GET error', { key, error: error.message });
    }
    return null;
  }
}

export async function set(key: string, value: string, expireSeconds?: number): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }
  try {
    if (expireSeconds) {
      await redisClient.setEx(key, expireSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error: any) {
    if (isConnected) {
      console.error('Redis SET error', { key, error: error.message });
    }
  }
}

export async function del(key: string): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }
  try {
    await redisClient.del(key);
  } catch (error: any) {
    if (isConnected) {
      console.error('Redis DEL error', { key, error: error.message });
    }
  }
}

export async function zadd(key: string, score: number, member: string): Promise<number> {
  if (!isRedisConnected()) {
    return 0;
  }
  try {
    return await redisClient.zAdd(key, { score, value: member });
  } catch (error: any) {
    if (isConnected) {
      console.error('Redis ZADD error', { key, error: error.message });
    }
    return 0;
  }
}

export async function zrem(key: string, member: string): Promise<number> {
  if (!isRedisConnected()) {
    return 0;
  }
  try {
    return await redisClient.zRem(key, member);
  } catch (error: any) {
    if (isConnected) {
      console.error('Redis ZREM error', { key, error: error.message });
    }
    return 0;
  }
}

export async function zrange(key: string, start: number, stop: number, rev: boolean = false): Promise<string[]> {
  if (!isRedisConnected()) {
    return [];
  }
  try {
    return await redisClient.zRange(key, start, stop, { REV: rev });
  } catch (error: any) {
    if (isConnected) {
      console.error('Redis ZRANGE error', { key, error: error.message });
    }
    return [];
  }
}

export async function zcard(key: string): Promise<number> {
  if (!isRedisConnected()) {
    return 0;
  }
  try {
    return await redisClient.zCard(key);
  } catch (error: any) {
    if (isConnected) {
      console.error('Redis ZCARD error', { key, error: error.message });
    }
    return 0;
  }
}

export async function closeRedis(): Promise<void> {
  if (isRedisConnected()) {
    try {
      await redisClient.quit();
    } catch (error: any) {
      console.error('Error closing Redis connection', error.message);
    }
  }
}

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

export const connectRedis = initializeRedis;

export default redisClient;
