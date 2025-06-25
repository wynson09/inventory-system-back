import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  IJWTPayload,
  IUserDocument,
  UserRole,
} from '../types';

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const newUser = await this.userRepository.create({
      ...userData,
      role: userData.role || UserRole.USER,
    });

    // Generate token
    const token = this.generateToken(newUser);

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact support');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await this.userRepository.updateLastLogin((user._id as any).toString());

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getCurrentUser(userId: string): Promise<IUserDocument | null> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  async refreshToken(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    return this.generateToken(user);
  }

  verifyToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as IJWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  private generateToken(user: IUserDocument): string {
    const payload: IJWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  private sanitizeUser(user: IUserDocument): any {
    const userObj = user.toObject();
    delete (userObj as any).password;
    return userObj;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findByEmailWithPassword('');
    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    await this.userRepository.update(userId, { password: newPassword });
  }

  async updateProfile(
    userId: string,
    profileData: Partial<IUserDocument>
  ): Promise<IUserDocument | null> {
    // Remove sensitive fields
    const allowedFields = ['firstName', 'lastName', 'profileImage'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (profileData[field as keyof IUserDocument] !== undefined) {
        filteredData[field] = profileData[field as keyof IUserDocument];
      }
    }

    return await this.userRepository.update(userId, filteredData);
  }
}
