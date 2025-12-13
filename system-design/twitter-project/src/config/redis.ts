import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: RedisClientType;
let isConnected = false;
let isReady = false;

/**
 * Connect to Redis
 */
export async function connectRedis(): Promise<void> {
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });

        redisClient.on('connect', () => {
            isConnected = true;
            console.log('✅ Redis connecting...');
        });

        redisClient.on('ready', () => {
            isReady = true;
            console.log('✅ Redis ready');
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis error:', err.message);
            isConnected = false;
            isReady = false;
        });

        redisClient.on('end', () => {
            isConnected = false;
            isReady = false;
            console.log('Redis connection closed');
        });

        await redisClient.connect();
    } catch (error: any) {
        console.error('❌ Redis connection failed:', error.message);
        console.log('⚠️  Continuing without Redis cache');
    }
}

/**
 * Get Redis connection status
 */
export function getRedisStatus() {
    return {
        connected: isConnected,
        ready: isReady,
    };
}

/**
 * Get a value from Redis
 */
export async function get(key: string): Promise<string | null> {
    if (!isReady) return null;

    try {
        return await redisClient.get(key);
    } catch (error: any) {
        console.error(`Redis GET error for key ${key}:`, error.message);
        return null;
    }
}

/**
 * Set a value in Redis with optional TTL
 */
export async function set(
    key: string,
    value: string,
    ttlSeconds?: number
): Promise<void> {
    if (!isReady) return;

    try {
        if (ttlSeconds) {
            await redisClient.setEx(key, ttlSeconds, value);
        } else {
            await redisClient.set(key, value);
        }
    } catch (error: any) {
        console.error(`Redis SET error for key ${key}:`, error.message);
    }
}

/**
 * Delete a key from Redis
 */
export async function del(key: string): Promise<void> {
    if (!isReady) return;

    try {
        await redisClient.del(key);
    } catch (error: any) {
        console.error(`Redis DEL error for key ${key}:`, error.message);
    }
}

/**
 * Increment a counter in Redis
 */
export async function incr(key: string): Promise<number> {
    if (!isReady) return 0;

    try {
        return await redisClient.incr(key);
    } catch (error: any) {
        console.error(`Redis INCR error for key ${key}:`, error.message);
        return 0;
    }
}

/**
 * Get all keys matching a pattern
 */
export async function keys(pattern: string): Promise<string[]> {
    if (!isReady) return [];

    try {
        return await redisClient.keys(pattern);
    } catch (error: any) {
        console.error(`Redis KEYS error for pattern ${pattern}:`, error.message);
        return [];
    }
}

/**
 * Add to sorted set (for timelines)
 */
export async function zadd(
    key: string,
    score: number,
    member: string
): Promise<void> {
    if (!isReady) return;

    try {
        await redisClient.zAdd(key, { score, value: member });
    } catch (error: any) {
        console.error(`Redis ZADD error for key ${key}:`, error.message);
    }
}

/**
 * Get range from sorted set (for timelines)
 */
export async function zrevrange(
    key: string,
    start: number,
    stop: number
): Promise<string[]> {
    if (!isReady) return [];

    try {
        return await redisClient.zRange(key, start, stop, { REV: true });
    } catch (error: any) {
        console.error(`Redis ZREVRANGE error for key ${key}:`, error.message);
        return [];
    }
}

/**
 * Remove from sorted set
 */
export async function zrem(key: string, member: string): Promise<void> {
    if (!isReady) return;

    try {
        await redisClient.zRem(key, member);
    } catch (error: any) {
        console.error(`Redis ZREM error for key ${key}:`, error.message);
    }
}

/**
 * Set expiration on a key
 */
export async function expire(key: string, seconds: number): Promise<void> {
    if (!isReady) return;

    try {
        await redisClient.expire(key, seconds);
    } catch (error: any) {
        console.error(`Redis EXPIRE error for key ${key}:`, error.message);
    }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        console.log('Redis connection closed');
    }
}

export { redisClient };
