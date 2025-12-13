import { Request, Response, NextFunction } from 'express';
import { get, set } from '../config/redis';

/**
 * Token bucket rate limiter using Redis
 */
export function rateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${clientIp}`;
    const windowSeconds = Math.floor(windowMs / 1000);

    try {
      const currentTokens = await get(key);
      const tokens = currentTokens ? parseInt(currentTokens, 10) : maxRequests;

      if (tokens <= 0) {
        res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds} seconds.`,
        });
        return;
      }

      const newTokens = tokens - 1;
      await set(key, newTokens.toString(), windowSeconds);

      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, newTokens).toString());
      res.setHeader('X-RateLimit-Reset', (Date.now() + windowMs).toString());

      next();
    } catch (error) {
      console.error('Rate limiter error', error);
      next();
    }
  };
}

/**
 * Rate limiter for post uploads (10 posts per hour)
 */
export function uploadRateLimiter() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).userId;
    if (!userId) {
      next();
      return;
    }

    const key = `upload_limit:${userId}`;
    const maxUploads = 10;
    const windowSeconds = 3600; // 1 hour

    try {
      const currentUploads = await get(key);
      const uploads = currentUploads ? parseInt(currentUploads, 10) : 0;

      if (uploads >= maxUploads) {
        res.status(429).json({
          error: 'Upload limit exceeded',
          message: 'Maximum 10 posts per hour allowed',
        });
        return;
      }

      await set(key, (uploads + 1).toString(), windowSeconds);

      next();
    } catch (error) {
      console.error('Upload rate limiter error', error);
      next();
    }
  };
}

/**
 * Rate limiter for follow actions (100 follows per day)
 */
export function followRateLimiter() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).userId;
    if (!userId) {
      next();
      return;
    }

    const key = `follow_limit:${userId}`;
    const maxFollows = 100;
    const windowSeconds = 86400; // 24 hours

    try {
      const currentFollows = await get(key);
      const follows = currentFollows ? parseInt(currentFollows, 10) : 0;

      if (follows >= maxFollows) {
        res.status(429).json({
          error: 'Follow limit exceeded',
          message: 'Maximum 100 follows per day allowed',
        });
        return;
      }

      await set(key, (follows + 1).toString(), windowSeconds);

      next();
    } catch (error) {
      console.error('Follow rate limiter error', error);
      next();
    }
  };
}

