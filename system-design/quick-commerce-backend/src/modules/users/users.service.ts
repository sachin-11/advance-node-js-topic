import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '../../common/logger/logger.service';

// Mock OTP storage (in production, use Redis)
const otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`User created: ${savedUser.phone}`, 'UsersService');
    return savedUser;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`User updated: ${updatedUser.phone}`, 'UsersService');
    return updatedUser;
  }

  async generateOtp(phone: string): Promise<{ message: string; otp?: string }> {
    // Check if user exists
    const user = await this.findByPhone(phone);

    if (!user) {
      throw new NotFoundException('User not found. Please register first.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP (in production, use Redis)
    otpStore.set(phone, { otp, expiresAt });

    this.logger.log(`OTP generated for: ${phone}`, 'UsersService');

    // In development, return OTP for testing
    // In production, send via SMS service
    if (process.env.NODE_ENV === 'development') {
      return {
        message: 'OTP sent successfully',
        otp, // Only in development
      };
    }

    return {
      message: 'OTP sent successfully to your phone',
    };
  }

  async verifyOtp(phone: string, otp: string): Promise<{ access_token: string; user: User }> {
    const storedOtp = otpStore.get(phone);

    if (!storedOtp) {
      throw new UnauthorizedException('OTP not found or expired');
    }

    if (storedOtp.expiresAt < Date.now()) {
      otpStore.delete(phone);
      throw new UnauthorizedException('OTP expired');
    }

    if (storedOtp.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // OTP verified, remove it
    otpStore.delete(phone);

    // Get user
    const user = await this.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate JWT token
    const payload = { sub: user.id, phone: user.phone };
    const access_token = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${user.phone}`, 'UsersService');

    return {
      access_token,
      user,
    };
  }

  async getProfile(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

