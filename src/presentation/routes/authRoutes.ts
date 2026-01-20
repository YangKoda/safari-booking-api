import { Router } from 'express';
import { AuthController } from '@presentation/controllers/AuthController';
import { authenticate } from '@presentation/middleware/authenticate';

const router = Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (authentication required)
router.get('/me', authenticate, authController.getMe);

export { router as authRoutes };
