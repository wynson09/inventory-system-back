import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponse, LoginRequest, RegisterRequest } from '../types';
import { catchAsync } from '../middleware/errorHandler';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Register new user
  register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userData: RegisterRequest = req.body;

    const result = await this.authService.register(userData);

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: result,
    };

    res.status(201).json(response);
  });

  // Login user
  login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const credentials: LoginRequest = req.body;

    const result = await this.authService.login(credentials);

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: result,
    };

    res.status(200).json(response);
  });

  // Get current user profile
  getCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    const user = await this.authService.getCurrentUser(userId);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    };

    res.status(200).json(response);
  });

  // Refresh JWT token
  refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    const token = await this.authService.refreshToken(userId);

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: { token },
    };

    res.status(200).json(response);
  });

  // Change password
  changePassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    await this.authService.changePassword(userId, currentPassword, newPassword);

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    res.status(200).json(response);
  });

  // Update user profile
  updateProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const profileData = req.body;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    const updatedUser = await this.authService.updateProfile(userId, profileData);

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    };

    res.status(200).json(response);
  });

  // Logout (client-side token removal)
  logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  });
}
