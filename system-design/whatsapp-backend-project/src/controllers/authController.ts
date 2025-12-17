import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone_number, username, email, password, full_name } = req.body;

    if (!phone_number || !password) {
      res.status(400).json({ error: 'Phone number and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const result = await authService.register({
      phone_number,
      username,
      email,
      password,
      full_name,
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message.includes('already exists') || error.message.includes('already taken')) {
      res.status(409).json({ error: error.message });
      return;
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      res.status(400).json({ error: 'Phone number and password are required' });
      return;
    }

    const result = await authService.login({ phone_number, password });

    res.json(result);
  } catch (error: any) {
    if (error.message.includes('Invalid')) {
      res.status(401).json({ error: error.message });
      return;
    }
    next(error);
  }
};
