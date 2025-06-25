import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import {
  ApiResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQuery,
  UserRole,
} from '../types';
import { catchAsync } from '../middleware/errorHandler';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  // Create new product
  createProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const productData: CreateProductRequest = req.body;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    const product = await this.productService.createProduct(userId, productData);

    const response: ApiResponse = {
      success: true,
      message: 'Product created successfully',
      data: product,
    };

    res.status(201).json(response);
  });

  // Get all products with filtering/search
  getAllProducts = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const query: ProductQuery = {
      search: req.query.search as string,
      category: req.query.category as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      inStock:
        req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
      page: req.query.page ? Math.max(1, Number(req.query.page)) : 1,
      limit: req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : 10,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await this.productService.getAllProducts(query);

    const response: ApiResponse = {
      success: true,
      message: 'Products retrieved successfully',
      data: result,
    };

    res.status(200).json(response);
  });

  // Get user's products
  getUserProducts = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    const products = await this.productService.getUserProducts(userId);

    const response: ApiResponse = {
      success: true,
      message: 'User products retrieved successfully',
      data: products,
    };

    res.status(200).json(response);
  });

  // Get product by ID
  getProductById = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Admin can see all products, users can only see their own
    const ownerUserId = userRole === UserRole.ADMIN ? undefined : userId;

    const product = await this.productService.getProductById(id, ownerUserId);

    if (!product) {
      const response: ApiResponse = {
        success: false,
        message: 'Product not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    };

    res.status(200).json(response);
  });

  // Update product
  updateProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const updateData: UpdateProductRequest = req.body;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    // Admin can update any product, users can only update their own
    const ownerUserId = userRole === UserRole.ADMIN ? '' : userId;

    const product = await this.productService.updateProduct(id, ownerUserId, updateData);

    const response: ApiResponse = {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };

    res.status(200).json(response);
  });

  // Delete product
  deleteProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    // Admin can delete any product, users can only delete their own
    const ownerUserId = userRole === UserRole.ADMIN ? '' : userId;

    const success = await this.productService.deleteProduct(id, ownerUserId);

    const response: ApiResponse = {
      success,
      message: success ? 'Product deleted successfully' : 'Failed to delete product',
    };

    res.status(success ? 200 : 400).json(response);
  });

  // Update stock quantity
  updateStock = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    // Admin can update any product stock, users can only update their own
    const ownerUserId = userRole === UserRole.ADMIN ? undefined : userId;

    const product = await this.productService.updateStock(id, quantity, ownerUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Stock updated successfully',
      data: product,
    };

    res.status(200).json(response);
  });

  // Get products by category
  getProductsByCategory = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { category } = req.params;

    const products = await this.productService.getProductsByCategory(category);

    const response: ApiResponse = {
      success: true,
      message: 'Products retrieved successfully',
      data: products,
    };

    res.status(200).json(response);
  });

  // Get low stock products
  getLowStockProducts = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Admin can see all low stock products, users can only see their own
    const ownerUserId = userRole === UserRole.ADMIN ? undefined : userId;

    const products = await this.productService.getLowStockProducts(ownerUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Low stock products retrieved successfully',
      data: products,
    };

    res.status(200).json(response);
  });

  // Get all categories
  getCategories = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const categories = await this.productService.getCategories();

    const response: ApiResponse = {
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    };

    res.status(200).json(response);
  });

  // Get inventory statistics
  getInventoryStats = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Admin can see all stats, users can only see their own
    const ownerUserId = userRole === UserRole.ADMIN ? undefined : userId;

    const stats = await this.productService.getInventoryStats(ownerUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Inventory statistics retrieved successfully',
      data: stats,
    };

    res.status(200).json(response);
  });

  // Search products
  searchProducts = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const query: ProductQuery = {
      search: req.query.q as string,
      category: req.query.category as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      inStock:
        req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
      page: req.query.page ? Math.max(1, Number(req.query.page)) : 1,
      limit: req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : 10,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await this.productService.searchProducts(query);

    const response: ApiResponse = {
      success: true,
      message: 'Search completed successfully',
      data: result,
    };

    res.status(200).json(response);
  });

  // Adjust stock (add/subtract)
  adjustStock = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { adjustment } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    // Admin can adjust any product stock, users can only adjust their own
    const ownerUserId = userRole === UserRole.ADMIN ? undefined : userId;

    const product = await this.productService.adjustStock(id, adjustment, ownerUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Stock adjusted successfully',
      data: product,
    };

    res.status(200).json(response);
  });
}
