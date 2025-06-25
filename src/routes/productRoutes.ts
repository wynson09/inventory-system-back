import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const productController = new ProductController();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// Product CRUD operations
router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/my-products', productController.getUserProducts);
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/stats', productController.getInventoryStats);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Stock management
router.put('/:id/stock', productController.updateStock);
router.post('/:id/adjust-stock', productController.adjustStock);

export default router;
