import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';
import { authService } from '../services/authService';
import { AuthRequest, RegisterRequest } from '../models/types';

const router = express.Router();

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('country')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters')
], catchAsync(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      statusCode: 400
    });
  }

  const userData: RegisterRequest = req.body;
  const result = await authService.register(userData);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
    statusCode: 201
  });
}));

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
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], catchAsync(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      statusCode: 400
    });
  }

  const credentials: AuthRequest = req.body;
  const result = await authService.login(credentials);

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
    statusCode: 200
  });
}));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           properties:
 *             refresh_token:
 *               type: string
 *               description: Refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
], catchAsync(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      statusCode: 400
    });
  }

  const { refresh_token } = req.body;
  const result = await authService.refreshToken(refresh_token);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: result,
    statusCode: 200
  });
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticate, catchAsync(async (req, res) => {
  if (!req.user || !req.token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      statusCode: 401
    });
  }

  await authService.logout(req.user.id, req.token);

  res.json({
    success: true,
    message: 'Logout successful',
    statusCode: 200
  });
}));

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           properties:
 *             current_password:
 *               type: string
 *               description: Current password
 *             new_password:
 *               type: string
 *               minLength: 6
 *               description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/change-password', authenticate, [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], catchAsync(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      statusCode: 400
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      statusCode: 401
    });
  }

  const { current_password, new_password } = req.body;
  await authService.changePassword(req.user.id, current_password, new_password);

  res.json({
    success: true,
    message: 'Password changed successfully',
    statusCode: 200
  });
}));

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           properties:
 *             token:
 *               type: string
 *               description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
], catchAsync(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      statusCode: 400
    });
  }

  // In a real implementation, you'd extract user ID from the token
  // For now, we'll assume it's passed in the request
  const { token, user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
      statusCode: 400
    });
  }

  await authService.verifyEmail(user_id, token);

  res.json({
    success: true,
    message: 'Email verified successfully',
    statusCode: 200
  });
}));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: User email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], catchAsync(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      statusCode: 400
    });
  }

  const { email } = req.body;
  await authService.requestPasswordReset(email);

  res.json({
    success: true,
    message: 'If an account with this email exists, a password reset link has been sent',
    statusCode: 200
  });
}));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           properties:
 *             token:
 *               type: string
 *               description: Password reset token
 *             new_password:
 *               type: string
 *               minLength: 6
 *               description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], catchAsync(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      statusCode: 400
    });
  }

  const { token, new_password } = req.body;
  await authService.resetPassword(token, new_password);

  res.json({
    success: true,
    message: 'Password reset successfully',
    statusCode: 200
  });
}));

export default router;