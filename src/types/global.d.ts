// Global type declarations for Node.js environment
declare var process: any;
declare var console: any;
declare var global: any;
declare var Buffer: any;
declare var __dirname: string;
declare var __filename: string;
declare var module: any;
declare var require: any;
declare var exports: any;
declare var setTimeout: any;
declare var setInterval: any;
declare var clearTimeout: any;
declare var clearInterval: any;

// Mongoose types
declare module 'mongoose' {
  interface ConnectOptions {
    [key: string]: any;
  }
  
  interface Connection {
    on(event: string, callback: Function): void;
    dropDatabase(): Promise<void>;
  }
}

// Extend global namespace
declare global {
  namespace NodeJS {
    interface Process {
      env: any;
      exit(code?: number): void;
      on(event: string, callback: Function): void;
    }
    
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
} 