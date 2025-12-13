import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import {
    User,
    UserProfile,
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    ValidationError,
    AuthenticationError,
    ConflictError,
} from '../models/types';
import validator from 'validator';

export class AuthService {
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
    private readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    private readonly SALT_ROUNDS = 10;

    /**
     * Register a new user
     */
    async register(request: RegisterRequest): Promise<AuthResponse> {
        // Validate input
        this.validateRegistration(request);

        // Check if username already exists
        const existingUsername = await query<User>(
            'SELECT id FROM users WHERE username = $1',
            [request.username]
        );
        if (existingUsername.length > 0) {
            throw new ConflictError('Username already exists');
        }

        // Check if email already exists
        const existingEmail = await query<User>(
            'SELECT id FROM users WHERE email = $1',
            [request.email]
        );
        if (existingEmail.length > 0) {
            throw new ConflictError('Email already exists');
        }

        // Hash password
        const password_hash = await bcrypt.hash(request.password, this.SALT_ROUNDS);

        // Create user
        const users = await query<User>(
            `INSERT INTO users (username, email, password_hash, display_name, bio)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, display_name, bio, avatar_url, cover_url, 
                 verified, follower_count, following_count, tweet_count, 
                 location, website, created_at`,
            [
                request.username,
                request.email,
                password_hash,
                request.display_name || request.username,
                request.bio || null,
            ]
        );

        const user = users[0];

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens(user.id, user.username);

        return {
            user: this.toUserProfile(user),
            accessToken,
            refreshToken,
        };
    }

    /**
     * Login user
     */
    async login(request: LoginRequest): Promise<AuthResponse> {
        // Validate input
        if (!request.email || !request.password) {
            throw new ValidationError('Email and password are required');
        }

        if (!validator.isEmail(request.email)) {
            throw new ValidationError('Invalid email format');
        }

        // Find user by email
        const users = await query<User>(
            `SELECT * FROM users WHERE email = $1 AND is_active = TRUE`,
            [request.email]
        );

        if (users.length === 0) {
            throw new AuthenticationError('Invalid email or password');
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(request.password, user.password_hash);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid email or password');
        }

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens(user.id, user.username);

        return {
            user: this.toUserProfile(user),
            accessToken,
            refreshToken,
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as {
                userId: number;
                username: string;
            };

            // Generate new access token
            const accessToken = jwt.sign(
                { userId: decoded.userId, username: decoded.username },
                this.JWT_SECRET,
                { expiresIn: this.JWT_EXPIRES_IN }
            );

            return { accessToken };
        } catch (error) {
            throw new AuthenticationError('Invalid refresh token');
        }
    }

    /**
     * Verify access token
     */
    verifyToken(token: string): { userId: number; username: string } {
        try {
            return jwt.verify(token, this.JWT_SECRET) as {
                userId: number;
                username: string;
            };
        } catch (error) {
            throw new AuthenticationError('Invalid or expired token');
        }
    }

    /**
     * Generate access and refresh tokens
     */
    private generateTokens(userId: number, username: string) {
        const accessToken = jwt.sign(
            { userId, username },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { userId, username },
            this.JWT_REFRESH_SECRET,
            { expiresIn: this.JWT_REFRESH_EXPIRES_IN }
        );

        return { accessToken, refreshToken };
    }

    /**
     * Validate registration input
     */
    private validateRegistration(request: RegisterRequest): void {
        // Validate username
        if (!request.username || request.username.length < 3 || request.username.length > 50) {
            throw new ValidationError('Username must be between 3 and 50 characters');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(request.username)) {
            throw new ValidationError('Username can only contain letters, numbers, and underscores');
        }

        // Validate email
        if (!request.email || !validator.isEmail(request.email)) {
            throw new ValidationError('Invalid email format');
        }

        // Validate password
        if (!request.password || request.password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters');
        }

        // Validate display name if provided
        if (request.display_name && request.display_name.length > 100) {
            throw new ValidationError('Display name must be less than 100 characters');
        }
    }

    /**
     * Convert User to UserProfile (remove sensitive data)
     */
    private toUserProfile(user: User): UserProfile {
        return {
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            bio: user.bio,
            avatar_url: user.avatar_url,
            cover_url: user.cover_url,
            verified: user.verified,
            follower_count: user.follower_count,
            following_count: user.following_count,
            tweet_count: user.tweet_count,
            location: user.location,
            website: user.website,
            created_at: user.created_at,
        };
    }
}
