import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authMiddleware, subscriptionMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { registerDeviceSchema } from './notification.schema';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware);

router.post('/devices', validate(registerDeviceSchema), NotificationController.registerDevice);
router.get('/queue', NotificationController.listQueue);
router.post('/:id/retry', NotificationController.retry);

export default router;
