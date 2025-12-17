import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from '../models/types';

const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0')
};

// Create Redis client
const redisClient: RedisClientType = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  password: redisConfig.password,
  database: redisConfig.db,
});

// Event handlers
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Redis client connected');
  }
});

redisClient.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Redis client ready');
  }
});

redisClient.on('end', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Redis client disconnected');
  }
});

// Connect to Redis
export const connectRedis = async (): Promise<boolean> => {
  try {
    await redisClient.connect();
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.disconnect();
  } catch (error) {
    console.error('Error disconnecting Redis:', error);
  }
};

// Cache helper functions
export const cache = {
  // Set key with expiration (in seconds)
  set: async (key: string, value: any, expireInSeconds?: number): Promise<void> => {
    try {
      const serializedValue = JSON.stringify(value);
      if (expireInSeconds) {
        await redisClient.setEx(key, expireInSeconds, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  },

  // Get value by key
  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // Delete key
  del: async (key: string): Promise<boolean> => {
    try {
      const result = await redisClient.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redisClient.exists(key);
      return result > 0;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },

  // Set expiration on existing key
  expire: async (key: string, seconds: number): Promise<boolean> => {
    try {
      const result = await redisClient.expire(key, seconds);
      return result > 0;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  },

  // Get TTL (time to live) for key
  ttl: async (key: string): Promise<number> => {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  },

  // Increment counter
  incr: async (key: string): Promise<number> => {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  },

  // Hash operations
  hset: async (key: string, field: string, value: any): Promise<void> => {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.hSet(key, field, serializedValue);
    } catch (error) {
      console.error('Redis HSET error:', error);
      throw error;
    }
  },

  hget: async <T = any>(key: string, field: string): Promise<T | null> => {
    try {
      const value = await redisClient.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  },

  hgetall: async <T = any>(key: string): Promise<Record<string, T> | null> => {
    try {
      const hash = await redisClient.hGetAll(key);
      if (!hash || Object.keys(hash).length === 0) return null;

      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      console.error('Redis HGETALL error:', error);
      return null;
    }
  },

  // Set operations
  sadd: async (key: string, ...members: string[]): Promise<number> => {
    try {
      return await redisClient.sAdd(key, members);
    } catch (error) {
      console.error('Redis SADD error:', error);
      return 0;
    }
  },

  sismember: async (key: string, member: string): Promise<boolean> => {
    try {
      return await redisClient.sIsMember(key, member);
    } catch (error) {
      console.error('Redis SISMEMBER error:', error);
      return false;
    }
  },

  // List operations
  lpush: async (key: string, ...values: any[]): Promise<number> => {
    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      return await redisClient.lPush(key, serializedValues);
    } catch (error) {
      console.error('Redis LPUSH error:', error);
      return 0;
    }
  },

  lrange: async <T = any>(key: string, start: number, end: number): Promise<T[]> => {
    try {
      const values = await redisClient.lRange(key, start, end);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      console.error('Redis LRANGE error:', error);
      return [];
    }
  },

  // Clear all cache (dangerous - use with caution)
  flushall: async (): Promise<void> => {
    try {
      await redisClient.flushAll();
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      throw error;
    }
  }
};

export default redisClient;
export { cache };