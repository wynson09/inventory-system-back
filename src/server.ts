// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import database from './config/database';

class Server {
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '5000', 10);
    this.initializeDatabase();
    this.startServer();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await database.connect();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    }
  }

  private startServer(): void {
    const server = app.listen(this.port, () => {
      console.log(`🚀 Server is running on port ${this.port}`);
      console.log(`📄 API Documentation: http://localhost:${this.port}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        console.log('🔌 HTTP server closed');

        try {
          await database.disconnect();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close server after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      console.error('Uncaught Exception thrown:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
  }
}

// Start the server
new Server();
