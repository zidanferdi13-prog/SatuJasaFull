import { Router } from 'express';
import { BranchController } from './branch.controller';
import { authMiddleware, subscriptionMiddleware, roleMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { createBranchSchema, updateBranchSchema } from './branch.schema';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware);

router.get('/', BranchController.list);
router.get('/:id', BranchController.getOne);
router.post('/', roleMiddleware('OWNER', 'SUPER_ADMIN'), validate(createBranchSchema), BranchController.create);
router.put('/:id', roleMiddleware('OWNER', 'SUPER_ADMIN'), validate(updateBranchSchema), BranchController.update);
router.delete('/:id', roleMiddleware('OWNER', 'SUPER_ADMIN'), BranchController.remove);

export default router;
