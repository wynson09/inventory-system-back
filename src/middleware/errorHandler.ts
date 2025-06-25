import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ErrorHandler {
  // Global error handling middleware
  static handle = (error: AppError, req: Request, res: Response, next: NextFunction): void => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let isOperational = error.isOperational || false;

    // Handle specific error types
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = ErrorHandler.handleValidationError(error);
      isOperational = true;
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
      isOperational = true;
    } else if (error.name === 'MongoServerError' && error.message.includes('duplicate key')) {
      statusCode = 409;
      message = ErrorHandler.handleDuplicateKeyError(error);
      isOperational = true;
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
      isOperational = true;
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
      isOperational = true;
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };

    // Log error for debugging
    if (!isOperational || statusCode >= 500) {
      console.error('Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(statusCode).json(response);
  };

  // Handle Mongoose validation errors
  private static handleValidationError(error: any): string {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return `Validation Error: ${errors.join('. ')}`;
  }

  // Handle duplicate key errors
  private static handleDuplicateKeyError(error: any): string {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return `${field} '${value}' already exists`;
  }

  // Create operational error
  static createError(message: string, statusCode: number = 500): AppError {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  }

  // Async error handler wrapper
  static catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Gracefully shutdown
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Forcefully shutdown
  process.exit(1);
});

export const errorHandler = ErrorHandler.handle;
export const catchAsync = ErrorHandler.catchAsync;
