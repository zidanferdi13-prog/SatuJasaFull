import { Router } from 'express';
import { authMiddleware, tenantMiddleware } from '../middleware/auth';
import { TransactionController } from '../controllers/TransactionController';

const router = Router();

router.post('/', authMiddleware, tenantMiddleware, TransactionController.create);
router.get('/', authMiddleware, tenantMiddleware, TransactionController.list);
router.get('/:id', authMiddleware, tenantMiddleware, TransactionController.getById);
router.put('/:id', authMiddleware, tenantMiddleware, TransactionController.update);

export default router;
