import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
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

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    // Handle specific error types
    if (err.message === 'Password required' || err.message === 'Invalid password') {
        res.status(401).json({
            status: 'error',
            message: err.message,
        });
        return;
    }

    if (err.message.includes('malicious') || err.message.includes('exceeds')) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        });
        return;
    }

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
};

export const validatePasteBody = (req: Request, res: Response, next: NextFunction) => {
    const { content, language, privacy, expires_in, max_views } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({ error: 'Content is required and cannot be empty' });
        return;
    }

    // Validate content size (10MB max)
    const contentSize = Buffer.byteLength(content, 'utf8');
    if (contentSize > 10485760) {
        res.status(400).json({ error: 'Content exceeds maximum size of 10MB' });
        return;
    }

    // Validate language (optional)
    if (language && typeof language !== 'string') {
        res.status(400).json({ error: 'Language must be a string' });
        return;
    }

    // Validate privacy
    if (privacy && !['public', 'private', 'unlisted'].includes(privacy)) {
        res.status(400).json({ error: 'Privacy must be one of: public, private, unlisted' });
        return;
    }

    // Validate expires_in
    if (expires_in !== undefined) {
        if (typeof expires_in !== 'number' || expires_in < 0) {
            res.status(400).json({ error: 'expires_in must be a positive number (seconds)' });
            return;
        }
    }

    // Validate max_views
    if (max_views !== undefined) {
        if (typeof max_views !== 'number' || max_views < 1) {
            res.status(400).json({ error: 'max_views must be a positive integer' });
            return;
        }
    }

    next();
};

export { rateLimiter };
