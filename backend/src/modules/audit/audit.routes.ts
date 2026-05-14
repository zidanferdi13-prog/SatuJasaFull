import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authMiddleware, roleMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware, roleMiddleware('SUPER_ADMIN', 'OWNER'));
router.get('/', AuditController.list);

export default router;
