import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(authMiddleware.authenticate); // Apply auth middleware to all routes below

router.get('/me', authController.getCurrentUser);
router.post('/refresh', authController.refreshToken);
router.put('/change-password', authController.changePassword);
router.put('/profile', authController.updateProfile);
router.post('/logout', authController.logout);

export default router;
