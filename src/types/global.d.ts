// Global type declarations for Node.js environment
declare var process: NodeJS.Process;
declare var console: Console;
declare var global: NodeJS.Global;
declare var Buffer: BufferConstructor;
declare var __dirname: string;
declare var __filename: string;
declare var module: NodeModule;
declare var require: NodeRequire;
declare var exports: any;

// Extend global namespace
declare global {
  namespace NodeJS {
    interface Process {
      env: ProcessEnv;
    }
    
    interface ProcessEnv {
      [key: string]: string | undefined;
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: string;
      MONGODB_URI?: string;
      JWT_SECRET?: string;
      ALLOWED_ORIGINS?: string;
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
    }
  }
} 