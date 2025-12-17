import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';
import { User } from '../models/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface RegisterRequest {
  phone_number: string;
  username?: string;
  email?: string;
  password: string;
  full_name?: string;
}

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    phone_number: string;
    username?: string;
    email?: string;
    full_name?: string;
    profile_picture_url?: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await UserModel.findByPhoneNumber(request.phone_number);
    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    if (request.username) {
      const existingUsername = await UserModel.findByUsername(request.username);
      if (existingUsername) {
        throw new Error('Username already taken');
      }
    }

    if (request.email) {
      const existingEmail = await UserModel.findByEmail(request.email);
      if (existingEmail) {
        throw new Error('User with this email already exists');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(request.password, 10);

    // Create user
    const user = await UserModel.create({
      phone_number: request.phone_number,
      username: request.username,
      email: request.email,
      password_hash: passwordHash,
      full_name: request.full_name,
    });

    // Generate JWT token
    const token = this.generateToken(user.id!);

    return {
      user: {
        id: user.id!,
        phone_number: user.phone_number,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        profile_picture_url: user.profile_picture_url,
      },
      token,
    };
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    // Find user by phone number
    const user = await UserModel.findByPhoneNumber(request.phone_number);
    if (!user) {
      throw new Error('Invalid phone number or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(request.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid phone number or password');
    }

    // Update online status
    await UserModel.updateOnlineStatus(user.id!, true);

    // Generate JWT token
    const token = this.generateToken(user.id!);

    return {
      user: {
        id: user.id!,
        phone_number: user.phone_number,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        profile_picture_url: user.profile_picture_url,
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
