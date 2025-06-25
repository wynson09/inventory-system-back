# Backend Development Challenges (STUCK Scenarios)

This document outlines realistic development challenges encountered during the backend implementation of the Inventory Management System.

## Scenario 1: MongoDB Atlas Connection Timeout Issues

### Problem Description
During development, intermittent connection timeouts occurred when connecting to MongoDB Atlas, especially during high-traffic testing or when the application was idle for extended periods.

### Technical Details
```typescript
// In config/database.ts
const options = {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000, // Too short for Atlas
  socketTimeoutMS: 45000,
  bufferCommands: false,
};
```

### Issues Encountered
- **Connection Drops**: Atlas connections would drop after periods of inactivity
- **Timeout Errors**: `MongoServerSelectionError: connection timed out` during peak usage
- **Reconnection Failures**: Application wouldn't gracefully handle connection restoration
- **Development vs Production**: Different timeout requirements between local and cloud environments

### Root Cause
- MongoDB Atlas has different network latency compared to local MongoDB
- Default timeout values were too aggressive for cloud connections
- Connection pooling wasn't optimized for Atlas usage patterns

### Solution Implemented
```typescript
const options = {
  autoIndex: true,
  serverSelectionTimeoutMS: 10000, // Increased for Atlas
  socketTimeoutMS: 60000,
  bufferCommands: false,
  maxPoolSize: 10, // Added connection pool management
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
};
```

### Lessons Learned
- Cloud database connections require different timeout configurations
- Connection pooling is crucial for production applications
- Proper error handling and reconnection logic is essential

---

## Scenario 2: TypeScript Strict Mode Configuration Challenges

### Problem Description
Enabling TypeScript strict mode revealed numerous type safety issues throughout the codebase, particularly with mongoose ObjectId handling and Express request/response typing.

### Technical Details
```typescript
// tsconfig.json strict configuration causing issues
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Issues Encountered
- **ObjectId Type Conflicts**: `Types.ObjectId` vs `string` mismatches in service methods
- **Request User Property**: `req.user` property not properly typed in middleware
- **Undefined Checks**: Strict null checks requiring extensive undefined handling
- **Mongoose Document Types**: Complex inheritance between `IProduct` and `IProductDocument`

### Root Cause
```typescript
// Before: Loose typing
export interface IProduct {
  _id?: Types.ObjectId; // Optional but causes issues
  userId: Types.ObjectId; // Required but string in JWT
}

// Controllers expecting string but getting ObjectId
const userId = req.user?.userId; // string from JWT
const product = await service.getProductById(id, userId); // expects ObjectId
```

### Solution Implemented
```typescript
// Enhanced type definitions
export interface IJWTPayload {
  userId: string; // Keep as string for JWT consistency
  email: string;
  role: UserRole;
}

// Service methods handle string to ObjectId conversion
async getProductById(id: string, ownerUserId?: string): Promise<IProduct | null> {
  const query: any = { _id: new Types.ObjectId(id) };
  if (ownerUserId) {
    query.userId = new Types.ObjectId(ownerUserId);
  }
  return await this.productRepository.findOne(query);
}
```

### Lessons Learned
- Type consistency across layers is crucial for maintainability
- ObjectId handling requires careful string/ObjectId conversion patterns
- Express middleware typing needs proper declaration merging

---

## Scenario 3: Jest Testing Setup with TypeScript and Mongoose

### Problem Description
Setting up comprehensive testing with Jest, TypeScript, and Mongoose required complex configuration to handle async operations, database connections, and module mocking.

### Technical Details
```javascript
// jest.config.js - Initial problematic setup
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Missing proper setup and teardown
};
```

### Issues Encountered
- **Database Connection Leaks**: Tests not properly closing MongoDB connections
- **Async Test Timeouts**: Long-running database operations causing test failures
- **Module Mocking Conflicts**: Difficulty mocking mongoose models and services
- **TypeScript Path Resolution**: Import paths not resolving correctly in test environment

### Root Cause
```typescript
// Tests running without proper database lifecycle management
describe('ProductService', () => {
  test('should create product', async () => {
    // No database setup/teardown
    const service = new ProductService();
    const result = await service.createProduct(userId, productData);
    expect(result).toBeDefined();
  });
});
```

### Solution Implemented
```javascript
// jest.config.js - Enhanced configuration
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// Test setup with proper lifecycle
beforeAll(async () => {
  await database.connect();
});

afterAll(async () => {
  await database.disconnect();
});

beforeEach(async () => {
  await database.dropDatabase(); // Clean state for each test
});
```

### Lessons Learned
- Database lifecycle management is critical for reliable tests
- Proper test isolation prevents flaky test results
- TypeScript testing requires careful module resolution configuration

---

## General Development Insights

### Common Patterns That Worked
1. **Singleton Database Connection**: Using singleton pattern for database management
2. **Middleware Composition**: Layered middleware for authentication and authorization
3. **Service Layer Abstraction**: Clear separation between controllers and business logic
4. **Error Handling Wrapper**: `catchAsync` utility for consistent error handling

### Tools and Libraries That Helped
- **Nodemon**: Hot reloading during development
- **Prettier**: Consistent code formatting
- **Jest**: Comprehensive testing framework
- **TypeScript**: Type safety and better IDE support

### Areas for Future Improvement
- Implement proper logging with Winston or similar
- Add API documentation with Swagger/OpenAPI
- Implement caching layer with Redis
- Add comprehensive monitoring and health checks 