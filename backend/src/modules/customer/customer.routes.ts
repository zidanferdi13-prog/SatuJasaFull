import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authMiddleware, subscriptionMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware);

router.get('/', CustomerController.list);
router.post('/', validate(createCustomerSchema), CustomerController.create);
router.get('/:id', CustomerController.getOne);
router.put('/:id', validate(updateCustomerSchema), CustomerController.update);

export default router;
