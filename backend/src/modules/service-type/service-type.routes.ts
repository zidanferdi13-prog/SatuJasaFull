import { Router } from 'express';
import { ServiceTypeController } from './service-type.controller';
import { authMiddleware, subscriptionMiddleware, roleMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import {
  createServiceTypeSchema,
  updateServiceTypeSchema,
  updateServiceTypeStatusSchema,
} from './service-type.schema';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware);

router.get('/', ServiceTypeController.list);
router.post('/', roleMiddleware('SUPER_ADMIN'), validate(createServiceTypeSchema), ServiceTypeController.create);
router.put('/:id', roleMiddleware('SUPER_ADMIN'), validate(updateServiceTypeSchema), ServiceTypeController.update);
router.patch('/:id/status', roleMiddleware('SUPER_ADMIN'), validate(updateServiceTypeStatusSchema), ServiceTypeController.updateStatus);

export default router;
