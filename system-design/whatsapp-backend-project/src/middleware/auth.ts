import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export interface AuthRequest extends Request {
  userId?: number;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches userId to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = authService.verifyToken(token);

    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid or expired token' });
  }
};
