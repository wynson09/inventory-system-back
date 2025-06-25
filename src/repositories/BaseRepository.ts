import { Document, Model, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { PaginationOptions, PaginatedResponse } from '../types';

export interface IBaseRepository<T extends Document> {
  create(data: any): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
  findWithPagination(
    filter: FilterQuery<T>,
    paginationOptions: PaginationOptions
  ): Promise<PaginatedResponse<T>>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  deleteMany(filter: FilterQuery<T>): Promise<number>;
  count(filter: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
}

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: any): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async find(filter: FilterQuery<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    return await this.model.find(filter, null, options);
  }

  async findWithPagination(
    filter: FilterQuery<T> = {},
    paginationOptions: PaginationOptions
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = paginationOptions;

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sortOptions).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter);
    return result.deletedCount || 0;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1);
    return count > 0;
  }
}
