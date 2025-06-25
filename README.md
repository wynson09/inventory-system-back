# Inventory Management System - Backend

A comprehensive REST API for inventory management built with Node.js, Express, TypeScript, and MongoDB Atlas following clean architecture principles with production-ready security and testing.

## 🏗️ Architecture

The backend follows a clean architecture pattern with clear separation of concerns:

```
src/
├── controllers/     # HTTP request/response handling
├── services/        # Business logic layer
├── repositories/    # Data access layer
├── models/          # Database schemas and models
├── middleware/      # Express middleware (auth, error handling)
├── routes/          # API route definitions
├── types/           # TypeScript interfaces and types
├── config/          # Configuration files (database)
├── __tests__/       # Comprehensive unit tests
├── app.ts           # Express application setup
└── server.ts        # Server entry point with graceful shutdown
```

## 🚀 Features

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Security**: bcryptjs hashing with salt rounds
- **User Management**: Registration, login, profile updates, password changes
- **Session Management**: Logout functionality and token refresh

### Inventory Management
- **Product CRUD**: Create, Read, Update, Delete products with ownership control
- **Advanced Search**: Full-text search across name, description, and SKU
- **Smart Filtering**: Filter by category, price range, stock status
- **Stock Management**: Update quantities, adjust stock levels, track low stock alerts
- **Category Management**: Dynamic category listing and filtering
- **SKU System**: Unique product identification with validation

### Security & Performance
- **Helmet.js**: Security headers and XSS protection
- **Rate Limiting**: IP-based request limiting (100 req/15min, 5 req/15min for auth)
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation with express-validator
- **Error Handling**: Global error handling with detailed development/production modes
- **Graceful Shutdown**: Clean server shutdown with connection cleanup

### Data Management
- **MongoDB Atlas**: Cloud database with connection pooling and reconnection logic
- **Pagination**: Efficient data loading with page/limit controls
- **Sorting**: Flexible sorting by any field (asc/desc)
- **Data Validation**: Schema validation with Mongoose
- **Relationship Management**: User-product ownership with proper access control

## 🛠️ Technologies

### Core Technologies
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript development
- **MongoDB Atlas** - Cloud database service
- **Mongoose** - MongoDB object modeling

### Security & Middleware
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token management
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - API rate limiting
- **express-validator** - Request validation

### Development & Testing
- **Jest** - Testing framework
- **ts-jest** - TypeScript testing preset
- **Nodemon** - Development hot reloading
- **Prettier** - Code formatting
- **ESLint** - Code linting

### Cloud Services (Ready)
- **❌Cloudinary** - Image storage and management
- **❌Multer** - File upload handling

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB v5+)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MongoDB Atlas cluster
   - Update the `MONGODB_URI` with your connection string
   - The application will automatically create indexes and collections

4. **Run the application**
   ```bash
   # Development mode with hot reloading
   npm run dev

   # Production build and start
   npm run build
   npm start

   # Run tests
   npm test
   ```

## 🧪 Testing

The backend includes comprehensive unit tests covering business logic, data validation, and edge cases.

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Basic Tests**: 25 tests covering data validation, constraints, and edge cases
- **ProductService Tests**: 10 tests covering business logic and service layer functionality
- **Total Coverage**: 35 tests with 100% pass rate

### Test Categories
- **Positive Tests**: Valid data handling and successful operations
- **Negative Tests**: Invalid data rejection and error handling
- **Edge Cases**: Boundary values, extreme inputs, and special characters
- **Data Validation**: Type checking, constraint validation, and structure verification

### Test Files
- `src/__tests__/basic.test.ts` - Fundamental validation and edge case testing
- `src/__tests__/services/ProductService.test.ts` - Service layer business logic testing

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user" // optional: "user", "manager", "admin"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh-token>
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt-token>
```

### Product Endpoints

#### Get All Products (with filtering & search)
```http
GET /api/products?page=1&limit=10&search=laptop&category=electronics&minPrice=100&maxPrice=1000&inStock=true&sortBy=price&sortOrder=asc
Authorization: Bearer <jwt-token>
```

#### Get User's Products
```http
GET /api/products/my-products
Authorization: Bearer <jwt-token>
```

#### Search Products
```http
GET /api/products/search?q=laptop&category=electronics
Authorization: Bearer <jwt-token>
```

#### Get Categories
```http
GET /api/products/categories
Authorization: Bearer <jwt-token>
```

#### Get Low Stock Products
```http
GET /api/products/low-stock
Authorization: Bearer <jwt-token>
```

#### Get Inventory Statistics
```http
GET /api/products/stats
Authorization: Bearer <jwt-token>
```

#### Get Products by Category
```http
GET /api/products/category/electronics
Authorization: Bearer <jwt-token>
```

#### Get Product by ID
```http
GET /api/products/:id
Authorization: Bearer <jwt-token>
```

#### Create Product
```http
POST /api/products
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "sku": "LAP001",
  "category": "Electronics",
  "price": 999.99,
  "quantity": 50,
  "minStockLevel": 10,
  "images": ["https://example.com/image.jpg"]
}
```

#### Update Product
```http
PUT /api/products/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Laptop",
  "price": 899.99,
  "quantity": 45
}
```

#### Delete Product
```http
DELETE /api/products/:id
Authorization: Bearer <jwt-token>
```

#### Update Stock Quantity
```http
PUT /api/products/:id/stock
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "quantity": 100
}
```

#### Adjust Stock (Add/Remove)
```http
POST /api/products/:id/adjust-stock
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "adjustment": 10,    // positive to add, negative to remove
  "reason": "Restock"  // optional reason for adjustment
}
```

### Health Check
```http
GET /health

Response:
{
  "success": true,
  "message": "Server is running successfully",
  "data": {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

## 🚀 Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run format:src   # Format only source files

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🔧 Development

### Project Structure
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data processing
- **Repositories**: Handle database operations and queries
- **Models**: Define database schemas and relationships
- **Middleware**: Handle authentication, validation, and error processing
- **Routes**: Define API endpoints and route handling
- **Types**: TypeScript interfaces and type definitions

### Database Models
- **User**: Authentication and user management
- **Product**: Inventory items with full CRUD operations

### Error Handling
The application uses a global error handler that:
- Catches all unhandled errors
- Provides consistent error response format
- Includes detailed errors in development mode
- Logs errors for debugging

### Security Features
- JWT token authentication with configurable expiration
- Password hashing with bcryptjs
- Request rate limiting
- CORS configuration
- Security headers with Helmet.js
- Input validation and sanitization

## 🧪 Testing
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t inventory-backend .

# Run with Docker Compose
docker-compose up -d
```

## 📦 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Request rate limiting
- **CORS**: Configurable cross-origin requests
- **JWT**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation
- **Password Hashing**: Bcrypt password hashing

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-mongodb-uri
JWT_SECRET=your-super-secure-production-jwt-secret
```

### Production Checklist

- [ ] Set strong JWT secret
- [ ] Configure production MongoDB URI
- [ ] Set up proper logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL/TLS certificates
- [ ] Configure monitoring
- [ ] Set up backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process on port

### Support

For support, please create an issue in the repository or contact the development team. 