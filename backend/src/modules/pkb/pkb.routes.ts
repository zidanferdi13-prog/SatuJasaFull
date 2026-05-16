import { Router } from 'express';
import { PkbController } from './pkb.controller';
import { authMiddleware, subscriptionMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { checkPkbSchema } from './pkb.schema';

const router = Router();

if (process.env.NODE_ENV !== 'development') {
  router.use(authMiddleware, subscriptionMiddleware);
}

router.post('/check', validate(checkPkbSchema), PkbController.check);

export default router;
