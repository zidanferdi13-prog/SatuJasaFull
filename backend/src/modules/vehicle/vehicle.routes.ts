import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import { authMiddleware, subscriptionMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { createVehicleSchema, updateVehicleSchema } from './vehicle.schema';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware);

router.get('/', VehicleController.list);
router.post('/', validate(createVehicleSchema), VehicleController.create);
router.get('/:id', VehicleController.getOne);
router.put('/:id', validate(updateVehicleSchema), VehicleController.update);

export default router;
