import { Document, Types } from 'mongoose';
import { Request } from 'express';

// Base interface for all entities
export interface BaseEntity {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// User related types
export interface IUser extends BaseEntity {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  profileImage?: string;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

// Product/Inventory related types
export interface IProduct extends BaseEntity {
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  minStockLevel: number;
  images: string[];
  isActive: boolean;
  userId: Types.ObjectId;
}

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

// Product related types
export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  minStockLevel: number;
  images?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// JWT Payload
export interface IJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Request with user
export interface AuthenticatedRequest extends Request {
  user?: IJWTPayload;
}
