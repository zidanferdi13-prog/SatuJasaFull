import { Router } from 'express';
import { PricingController } from './pricing.controller';
import { authMiddleware, subscriptionMiddleware, roleMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { createPricingRuleSchema, updatePricingRuleSchema } from './pricing.schema';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware, roleMiddleware('OWNER', 'ADMIN', 'SUPER_ADMIN'));

router.get('/', PricingController.list);
router.post('/', validate(createPricingRuleSchema), PricingController.create);
router.put('/:id', validate(updatePricingRuleSchema), PricingController.update);

export default router;
