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
 * Rate limiter for messages (100 messages per minute)
 */
export function messageRateLimiter() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).userId;
    if (!userId) {
      next();
      return;
    }

    const key = `message_limit:${userId}`;
    const maxMessages = 100;
    const windowSeconds = 60; // 1 minute

    try {
      const currentMessages = await get(key);
      const messages = currentMessages ? parseInt(currentMessages, 10) : 0;

      if (messages >= maxMessages) {
        res.status(429).json({
          error: 'Message limit exceeded',
          message: 'Maximum 100 messages per minute allowed',
        });
        return;
      }

      await set(key, (messages + 1).toString(), windowSeconds);

      next();
    } catch (error) {
      console.error('Message rate limiter error', error);
      next();
    }
  };
}
