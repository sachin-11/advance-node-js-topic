import { Request, Response, NextFunction } from 'express';
import { incr, expire } from '../config/redis';
import { RateLimitError } from '../models/types';

/**
 * Rate limiting middleware using Redis
 */
export function rateLimiter(
    maxRequests: number = 100,
    windowMs: number = 60000
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get client identifier (IP address or user ID)
            const identifier = req.user?.userId?.toString() || req.ip || 'unknown';
            const key = `rate:${identifier}`;

            // Increment counter
            const count = await incr(key);

            // Set expiration on first request
            if (count === 1) {
                await expire(key, Math.floor(windowMs / 1000));
            }

            // Check if limit exceeded
            if (count > maxRequests) {
                throw new RateLimitError(`Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds`);
            }

            // Add rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests.toString());
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count).toString());

            next();
        } catch (error: any) {
            if (error instanceof RateLimitError) {
                res.status(429).json({ error: error.message });
            } else {
                // If Redis is down, allow the request
                next();
            }
        }
    };
}
