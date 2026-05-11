import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.post('/login', AuthController.login);
router.post('/logout', authMiddleware, AuthController.logout);
router.post('/refresh', AuthController.refresh);

export default router;
