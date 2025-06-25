import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponse, IJWTPayload, UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Middleware to verify JWT token
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        const response: ApiResponse = {
          success: false,
          message: 'Access token is required',
        };
        res.status(401).json(response);
        return;
      }

      const decoded = this.authService.verifyToken(token);

      // Check if user still exists and is active
      const user = await this.authService.getCurrentUser(decoded.userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found or inactive',
        };
        res.status(401).json(response);
        return;
      }

      req.user = decoded;
      next();
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid or expired token',
        error: error.message,
      };
      res.status(401).json(response);
    }
  };

  // Middleware to check if user has required role
  authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
        };
        res.status(401).json(response);
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        const response: ApiResponse = {
          success: false,
          message: 'Insufficient permissions',
        };
        res.status(403).json(response);
        return;
      }

      next();
    };
  };

  // Middleware for admin only access
  adminOnly = (req: Request, res: Response, next: NextFunction): void => {
    this.authorize([UserRole.ADMIN])(req, res, next);
  };

  // Middleware for manager and admin access
  managerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
    this.authorize([UserRole.MANAGER, UserRole.ADMIN])(req, res, next);
  };

  // Optional authentication - doesn't fail if no token
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);

      if (token) {
        const decoded = this.authService.verifyToken(token);
        const user = await this.authService.getCurrentUser(decoded.userId);

        if (user) {
          req.user = decoded;
        }
      }

      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();
