import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';
import { User } from '../models/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    bio?: string;
    avatar_url?: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await UserModel.findByUsername(request.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(request.password, 10);

    // Create user
    const user = await UserModel.create({
      username: request.username,
      email: request.email,
      password_hash: passwordHash,
      bio: request.bio,
    });

    // Generate JWT token
    const token = this.generateToken(user.id!);

    return {
      user: {
        id: user.id!,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await UserModel.findByEmail(request.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(request.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user.id!);

    return {
      user: {
        id: user.id!,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: number } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

