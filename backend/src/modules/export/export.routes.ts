import { Router } from 'express';
import { ExportController } from './export.controller';
import { authMiddleware, subscriptionMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware);

router.get('/transactions', ExportController.exportTransactions);
router.get('/revenue', ExportController.exportRevenue);

export default router;
