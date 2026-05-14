import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authMiddleware, subscriptionMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware);

router.get('/queue', NotificationController.listQueue);
router.post('/:id/retry', NotificationController.retry);

export default router;
