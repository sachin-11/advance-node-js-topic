import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticationError } from '../models/types';

const authService = new AuthService();

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                username: string;
            };
        }
    }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = authService.verifyToken(token);

        req.user = decoded;
        next();
    } catch (error: any) {
        res.status(401).json({ error: error.message || 'Authentication failed' });
    }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = authService.verifyToken(token);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Ignore authentication errors for optional auth
        next();
    }
}
