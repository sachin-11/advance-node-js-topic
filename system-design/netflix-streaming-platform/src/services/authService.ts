import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { cache } from '../config/redis';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  User,
  Profile,
  AuthRequest,
  RegisterRequest,
  AuthResponse
} from '../models/types';

export class AuthService {
  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      date_of_birth,
      country
    } = userData;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const userResult = await query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, phone,
        date_of_birth, country, account_status, max_profiles
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        email.toLowerCase(),
        passwordHash,
        first_name,
        last_name,
        phone,
        date_of_birth,
        country,
        'active',
        5 // Default max profiles
      ]
    );

    const user: User = userResult.rows[0];

    // Create default profile
    const defaultProfileName = first_name ? `${first_name}'s Profile` : 'Main Profile';
    const profileResult = await query(
      `INSERT INTO profiles (user_id, name, language, autoplay)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.id, defaultProfileName, 'en', true]
    );

    const profile: Profile = profileResult.rows[0];

    // Create default "My List"
    await query(
      `INSERT INTO user_lists (profile_id, name, is_default)
       VALUES ($1, $2, $3)`,
      [profile.id, 'My List', true]
    );

    // Generate tokens
    const accessToken = generateAccessToken({
      user: { id: user.id, email: user.email },
      profile: { id: profile.id, name: profile.name }
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      profileId: profile.id
    });

    // Store refresh token in cache
    await cache.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        account_status: user.account_status,
        subscription_plan: user.subscription_plan
      },
      profile,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600 // 1 hour
    };
  }

  // Login user
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user: User = userResult.rows[0];

    // Check if account is active
    if (user.account_status !== 'active') {
      throw new AppError('Account is not active', 403);
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Get user's profiles
    const profilesResult = await query(
      'SELECT * FROM profiles WHERE user_id = $1 ORDER BY created_at ASC',
      [user.id]
    );

    if (profilesResult.rows.length === 0) {
      throw new AppError('No profiles found for this user', 404);
    }

    // Use the first profile or the most recently used one
    // In a real app, you might want to track the last used profile
    const profile: Profile = profilesResult.rows[0];

    // Update last login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken({
      user: { id: user.id, email: user.email },
      profile: { id: profile.id, name: profile.name }
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      profileId: profile.id
    });

    // Store refresh token in cache
    await cache.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        account_status: user.account_status,
        subscription_plan: user.subscription_plan
      },
      profile,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600
    };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const decoded = require('jsonwebtoken').verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');

      const { userId, profileId } = decoded;

      // Check if refresh token is valid
      const storedToken = await cache.get(`refresh_token:${userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Get user and profile data
      const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
      const profileResult = await query('SELECT * FROM profiles WHERE id = $1', [profileId]);

      if (userResult.rows.length === 0 || profileResult.rows.length === 0) {
        throw new AppError('User or profile not found', 404);
      }

      const user: User = userResult.rows[0];
      const profile: Profile = profileResult.rows[0];

      // Generate new access token
      const accessToken = generateAccessToken({
        user: { id: user.id, email: user.email },
        profile: { id: profile.id, name: profile.name }
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          account_status: user.account_status,
          subscription_plan: user.subscription_plan
        },
        profile,
        access_token: accessToken,
        refresh_token: refreshToken, // Return same refresh token
        expires_in: 3600
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  // Logout user
  async logout(userId: string, token: string): Promise<void> {
    // Blacklist the access token
    await cache.set(`blacklist:${token}`, 'true', 3600); // 1 hour

    // Remove refresh token
    await cache.del(`refresh_token:${userId}`);
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get current user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user: User = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Invalidate all refresh tokens for security
    await cache.del(`refresh_token:${userId}`);
  }

  // Verify email (for email verification feature)
  async verifyEmail(userId: string, verificationToken: string): Promise<void> {
    // Check verification token
    const storedToken = await cache.get(`email_verification:${userId}`);
    if (!storedToken || storedToken !== verificationToken) {
      throw new AppError('Invalid verification token', 400);
    }

    // Update user email verification status
    await query(
      'UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    // Remove verification token
    await cache.del(`email_verification:${userId}`);
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return;
    }

    const user = userResult.rows[0];
    const resetToken = uuidv4();

    // Store reset token with expiration
    await cache.set(`password_reset:${user.id}`, resetToken, 30 * 60); // 30 minutes

    // In a real app, send email with reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user by reset token
    const keys = await cache.exists(`password_reset:*`);
    // Note: In a real implementation, you'd need to scan for the token
    // For simplicity, we'll assume the token contains the user ID

    const decoded = Buffer.from(token, 'base64').toString().split(':');
    if (decoded.length !== 2) {
      throw new AppError('Invalid reset token', 400);
    }

    const userId = decoded[0];
    const resetToken = decoded[1];

    const storedToken = await cache.get(`password_reset:${userId}`);
    if (!storedToken || storedToken !== resetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Remove reset token
    await cache.del(`password_reset:${userId}`);
  }
}

export const authService = new AuthService();