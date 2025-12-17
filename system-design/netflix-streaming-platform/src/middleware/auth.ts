import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { cache } from '../config/redis';
import { AppError } from './errorHandler';
import { User, Profile } from '../models/types';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: User;
      profile?: Profile;
      token?: string;
    }
  }
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Generate access token
export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generate refresh token
export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AppError('Invalid token', 401);
  }
};

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (if using cookie-based auth)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if token is blacklisted (logout)
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new AppError('Token has been revoked', 401));
    }

    // Attach user and profile to request
    req.user = decoded.user;
    req.profile = decoded.profile;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const isBlacklisted = await cache.get(`blacklist:${token}`);

        if (!isBlacklisted) {
          req.user = decoded.user;
          req.profile = decoded.profile;
          req.token = token;
        }
      } catch (error) {
        // Silently ignore invalid tokens for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if user has required role/permission
    // This can be extended based on your role system
    const hasPermission = roles.some(role => {
      // Implement role checking logic here
      return true; // Placeholder - implement based on your needs
    });

    if (!hasPermission) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Profile-specific middleware (ensures profile belongs to authenticated user)
export const validateProfileOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.params.profileId) {
      return next(new AppError('User authentication and profile ID required', 400));
    }

    // In a real implementation, you would check if the profile belongs to the user
    // For now, we'll assume the profile ID in the token is valid

    next();
  } catch (error) {
    next(error);
  }
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next();

    const key = `sensitive_ops:${req.user.id}`;
    const attempts = await cache.incr(key);

    // Reset counter after 15 minutes
    if (attempts === 1) {
      await cache.expire(key, 15 * 60);
    }

    // Allow max 10 sensitive operations per 15 minutes
    if (attempts > 10) {
      return next(new AppError('Too many sensitive operations. Please try again later.', 429));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Device tracking middleware
export const trackDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next();

    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';

    // Store device information for security monitoring
    const deviceKey = `device:${req.user.id}:${ip}`;
    await cache.set(deviceKey, {
      userAgent,
      ip,
      lastSeen: new Date().toISOString(),
      endpoint: req.originalUrl
    }, 24 * 60 * 60); // 24 hours

    next();
  } catch (error) {
    // Don't fail the request if device tracking fails
    next();
  }
};