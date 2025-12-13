import { Request, Response, NextFunction } from 'express';
import { get, set } from '../cache/redis';

/**
 * Token bucket rate limiter using Redis
 * Implements a simple token bucket algorithm
 */
export function rateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${clientIp}`;
    const windowSeconds = Math.floor(windowMs / 1000);

    try {
      // Get current token count
      const currentTokens = await get(key);
      const tokens = currentTokens ? parseInt(currentTokens, 10) : maxRequests;

      if (tokens <= 0) {
        res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds} seconds.`,
        });
        return;
      }

      // Decrement token count
      const newTokens = tokens - 1;
      await set(key, newTokens.toString(), windowSeconds);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, newTokens).toString());
      res.setHeader('X-RateLimit-Reset', (Date.now() + windowMs).toString());

      next();
    } catch (error) {
      console.error('Rate limiter error', error);
      // On Redis error, allow the request (fail open)
      next();
    }
  };
}

