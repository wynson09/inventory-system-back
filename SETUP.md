# Quick Setup Guide for Inventory System Backend

## ✅ What's Been Done

1. **Package Dependencies**: Updated multer to v2.0.1 (latest secure version)
2. **TypeScript Configuration**: Fixed all compilation errors
3. **Environment Setup**: Created `.env` file with all necessary variables
4. **Code Architecture**: Complete clean architecture implementation with:
   - Models (User, Product)
   - Repositories (UserRepository, ProductRepository)  
   - Services (AuthService, ProductService)
   - Controllers (AuthController, ProductController)
   - Middleware (Authentication, Error Handling)
   - Routes (Auth, Products)

## 🚀 Quick Start

### 1. Install MongoDB

**Windows (using Chocolatey):**
```bash
choco install mongodb
```

**Windows (Manual):**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service

**Alternative - MongoDB Atlas (Cloud):**
1. Create free account at https://www.mongodb.com/atlas
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `.env` file

### 2. Start MongoDB Locally

```bash
# Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

### 3. Run the Backend

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### 4. Test the API

The server will start on `http://localhost:5000`

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires token)

### Products (All require authentication)
- `GET /api/products` - Get all products with filtering
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/stock` - Update stock quantity

### Additional Endpoints
- `GET /api/products/categories` - Get all categories
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/stats` - Get inventory statistics

## 🔧 Environment Variables

Update `.env` file with your specific values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/inventory-system

# JWT (Change in production!)
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
```

## 🐛 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running: `net start MongoDB`
- Check MongoDB connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Change `PORT=5000` to another port in `.env`
- Or kill existing process: `taskkill /f /im node.exe`

### Permission Errors
- Run PowerShell as Administrator
- Check file permissions in project directory

## ✅ Success Indicators

When everything is working, you should see:
```
🚀 Server is running on port 5000
📄 API Documentation: http://localhost:5000/health
🌍 Environment: development
✅ Connected to MongoDB successfully
```

## 🎯 Next Steps

1. **Test API endpoints** using Postman or curl
2. **Create sample data** by registering users and adding products
3. **Build the frontend** to consume these APIs
4. **Deploy to production** when ready

Your backend is now ready for frontend integration! 🎉 