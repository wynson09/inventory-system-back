import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';
import { IUserDocument } from '../types';

export interface IUserRepository extends BaseRepository<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByEmailWithPassword(email: string): Promise<IUserDocument | null>;
  findActiveUsers(): Promise<IUserDocument[]>;
  updateLastLogin(userId: string): Promise<IUserDocument | null>;
  deactivateUser(userId: string): Promise<IUserDocument | null>;
  activateUser(userId: string): Promise<IUserDocument | null>;
}

export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await this.model.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return await this.model.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findActiveUsers(): Promise<IUserDocument[]> {
    return await this.model.find({ isActive: true });
  }

  async updateLastLogin(userId: string): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(userId, { lastLoginAt: new Date() }, { new: true });
  }

  async deactivateUser(userId: string): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(userId, { isActive: false }, { new: true });
  }

  async activateUser(userId: string): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(userId, { isActive: true }, { new: true });
  }
}
