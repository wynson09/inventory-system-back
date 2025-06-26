// @ts-nocheck
import mongoose from 'mongoose';

export class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-system';
      
      console.log('🔍 MongoDB URI being used:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
      
      const options = {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      await mongoose.connect(mongoUri, options);

      console.log('✅ Connected to MongoDB successfully');

      // Handle connection events
      mongoose.connection.on('error', error => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public async dropDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase();
      console.log('🗑️ Test database dropped');
    }
  }
}

export default Database.getInstance();
