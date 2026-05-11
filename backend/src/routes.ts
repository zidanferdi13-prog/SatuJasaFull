import { Router } from 'express';
import { AuthController } from './modules/auth/auth.controller';
import { TransactionController } from './modules/transaction/transaction.controller';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { TenantController } from './modules/tenant/tenant.controller';
import { TrackingController } from './modules/tracking/tracking.controller';
import { authMiddleware, tenantContext, roleCheck } from './shared/middleware/auth.middleware';

const router = Router();

// Auth
router.post('/auth/login', AuthController.login);
router.post('/admin/tenants', authMiddleware, roleCheck(['SUPER_ADMIN']), AuthController.registerTenant);

// Admin
router.get('/admin/tenants', authMiddleware, roleCheck(['SUPER_ADMIN']), TenantController.list);
router.patch('/admin/tenants/:id', authMiddleware, roleCheck(['SUPER_ADMIN']), TenantController.update);

// Dashboard
router.get('/dashboard/kpis', authMiddleware, tenantContext, DashboardController.getKpis);

// Transactions
router.post('/transactions', authMiddleware, tenantContext, TransactionController.create);
router.patch('/transactions/:id/status', authMiddleware, tenantContext, TransactionController.updateStatus);

// Public Tracking
router.get('/tracking/:token', TrackingController.getStatus);

export default router;
