import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authMiddleware, subscriptionMiddleware, roleMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/tenant', subscriptionMiddleware, DashboardController.getTenantDashboard);
router.get('/admin', roleMiddleware('SUPER_ADMIN'), DashboardController.getAdminDashboard);
router.get('/branch/:branchId', subscriptionMiddleware, DashboardController.getBranchDashboard);

export default router;
