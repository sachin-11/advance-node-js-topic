import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/userModel';
import { AuthRequest } from '../middleware/auth';

/**
 * @swagger
 * /api/users/:id:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { username, email, full_name, profile_picture_url, status_message } = req.body;

    const user = await UserModel.update(userId, {
      username,
      email,
      full_name,
      profile_picture_url,
      status_message,
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by phone number
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
export const searchUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone_numbers } = req.query;

    if (!phone_numbers || typeof phone_numbers !== 'string') {
      res.status(400).json({ error: 'phone_numbers query parameter is required' });
      return;
    }

    const phoneNumbers = phone_numbers.split(',').map(p => p.trim());
    const users = await UserModel.findByPhoneNumbers(phoneNumbers);
    res.json(users);
  } catch (error) {
    next(error);
  }
};
