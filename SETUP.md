# Inventory System Backend - Setup Guide

## Quick Start

### Option 1: MongoDB Atlas (Recommended for Production)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user and get connection string
4. Replace `<password>` and `<dbname>` in connection string

### Option 2: Local MongoDB
```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Linux: sudo apt install mongodb
```

## Environment Setup

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-system
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Render Deployment

### Step 1: Prepare Repository

1. **Update render.yaml** (already configured)
2. **Set up environment variables** in Render dashboard
3. **Push to GitHub**

### Step 2: Create Environment Variable Group

In Render dashboard:
1. Go to Environment Groups
2. Create new group named `backend-env`
3. Add these variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure 32+ character string
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Step 3: Deploy Service

1. **Connect Repository**:
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: inventory-system-backend
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

3. **Set Environment**:
   - **Environment**: Node
   - **Node Version**: 18 or higher (auto-detected)
   - **Environment Group**: Select `backend-env`

### Step 4: Manual Environment Variables (Alternative)

If not using environment groups, add these directly:
- `NODE_ENV`: production
- `PORT`: 10000
- `MONGODB_URI`: (your connection string)
- `JWT_SECRET`: (your secret key)

### Troubleshooting Deployment

**Common Issues:**

1. **Build Fails**: 
   - Check Node.js version (needs 18+)
   - Verify all dependencies are in package.json

2. **Start Command Fails**:
   - Ensure `npm start` script exists
   - Check that `dist/server.js` is built

3. **Environment Variables Missing**:
   - Verify all required env vars are set
   - Check environment group is linked

4. **Database Connection Fails**:
   - Verify MongoDB URI is correct
   - Check MongoDB Atlas network access (allow 0.0.0.0/0)
   - Ensure database user has proper permissions

**Debug Steps:**
1. Check Render logs for specific error messages
2. Verify build completes successfully
3. Test environment variables in Render shell
4. Confirm database connectivity

### Health Check

Your service will be available at:
- `https://your-service-name.onrender.com/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "database": "connected"
}
```

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

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