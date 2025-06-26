import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import { ApiResponse } from './types';

export class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.errorHandling();
  }

  private middleware(): void {
    // Security middleware
    this.express.use(helmet());

    // CORS configuration
    const corsOptions = {
      origin: function (origin: string | undefined, callback: Function) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://inventory-system-front-wyn.vercel.app',
          'https://inventory-system-front-wine.vercel.app'
        ];
        
        // Check if origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log('CORS blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };
    this.express.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
      } as ApiResponse,
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.express.use(limiter);

    // Body parsing middleware
    this.express.use(express.json({ limit: '10mb' }));
    this.express.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy for correct IP addresses
    this.express.set('trust proxy', 1);
  }

  private routes(): void {
    // CORS preflight handler
    this.express.options('*', cors());
    
    // Health check endpoint
    this.express.get('/health', (req, res) => {
      const response: ApiResponse = {
        success: true,
        message: 'Server is running successfully',
        data: {
          status: 'OK',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          database: 'connected',
        },
      };
      res.status(200).json(response);
    });
    
    // Test CORS endpoint
    this.express.get('/test-cors', (req, res) => {
      res.json({
        success: true,
        message: 'CORS is working!',
        origin: req.headers.origin,
        headers: req.headers,
      });
    });

    // API routes
    this.express.use('/api/auth', authRoutes);
    this.express.use('/api/products', productRoutes);

    // 404 handler for undefined routes
    this.express.use('*', (req, res) => {
      const response: ApiResponse = {
        success: false,
        message: `Route ${req.originalUrl} not found`,
      };
      res.status(404).json(response);
    });
  }

  private errorHandling(): void {
    // Global error handler (should be last middleware)
    this.express.use(errorHandler);
  }

  public getApp(): express.Application {
    return this.express;
  }
}

export default new App().express;
