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

// Make everything any
declare const Schema: any;
declare const Model: any;
declare const Document: any;
declare const ObjectId: any;

// Mongoose types - Complete override
declare module 'mongoose' {
  type ConnectOptions = any;
  type Connection = any;
  type Document = any;
  type Schema = any;
  type Model<T = any> = any;
  type ObjectId = any;
  type SchemaDefinition = any;
  type SchemaOptions = any;
  type SchemaDefinitionProperty<T = any> = any;
  type PopulatedDoc<T = any> = any;
  
  namespace Schema {
    namespace Types {
      const ObjectId: any;
      const Mixed: any;
      const String: any;
      const Number: any;
      const Boolean: any;
      const Date: any;
      const Array: any;
    }
  }
  
  const Schema: any;
  const model: any;
  const connect: any;
  const disconnect: any;
  
  // Export everything as any
  const mongoose: any;
  export = mongoose;
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