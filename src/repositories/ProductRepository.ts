import { FilterQuery } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { Product } from '../models/Product';
import { IProductDocument, ProductQuery, PaginatedResponse } from '../types';

export interface IProductRepository extends BaseRepository<IProductDocument> {
  findBySku(sku: string): Promise<IProductDocument | null>;
  findByUserId(userId: string): Promise<IProductDocument[]>;
  findByCategory(category: string): Promise<IProductDocument[]>;
  findLowStock(userId?: string): Promise<IProductDocument[]>;
  searchProducts(query: ProductQuery): Promise<PaginatedResponse<IProductDocument>>;
  updateStock(productId: string, quantity: number): Promise<IProductDocument | null>;
  getCategories(): Promise<string[]>;
  getTotalValue(userId?: string): Promise<number>;
}

export class ProductRepository
  extends BaseRepository<IProductDocument>
  implements IProductRepository
{
  constructor() {
    super(Product);
  }

  async findBySku(sku: string): Promise<IProductDocument | null> {
    return await this.model.findOne({ sku: sku.toUpperCase() });
  }

  async findByUserId(userId: string): Promise<IProductDocument[]> {
    return await this.model.find({ userId, isActive: true });
  }

  async findByCategory(category: string): Promise<IProductDocument[]> {
    return await this.model.find({ category, isActive: true });
  }

  async findLowStock(userId?: string): Promise<IProductDocument[]> {
    const matchConditions: any = { isActive: true };
    if (userId) {
      matchConditions.userId = userId;
    }

    return await this.model.aggregate([
      { $match: matchConditions },
      { $addFields: { isLowStock: { $lte: ['$quantity', '$minStockLevel'] } } },
      { $match: { isLowStock: true } },
    ]);
  }

  async searchProducts(query: ProductQuery): Promise<PaginatedResponse<IProductDocument>> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter query
    const filter: FilterQuery<IProductDocument> = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (inStock !== undefined) {
      if (inStock) {
        filter.quantity = { $gt: 0 };
      } else {
        filter.quantity = { $eq: 0 };
      }
    }

    return await this.findWithPagination(filter, {
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  async updateStock(productId: string, quantity: number): Promise<IProductDocument | null> {
    return await this.model.findByIdAndUpdate(
      productId,
      { quantity },
      { new: true, runValidators: true }
    );
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.model.distinct('category', { isActive: true });
    return categories.sort();
  }

  async getTotalValue(userId?: string): Promise<number> {
    const matchConditions: any = { isActive: true };
    if (userId) {
      matchConditions.userId = userId;
    }

    const result = await this.model.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$price', '$quantity'] },
          },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalValue : 0;
  }
}
