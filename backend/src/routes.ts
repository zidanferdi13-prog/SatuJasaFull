import { Router } from 'express';
import { AuthController } from './modules/auth/auth.controller';
import { TransactionController } from './modules/transaction/transaction.controller';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { TenantController } from './modules/tenant/tenant.controller';
import { TrackingController } from './modules/tracking/tracking.controller';
import { authMiddleware, tenantContext, roleCheck } from './shared/middleware/auth.middleware';

const router = Router();

// ─── Public ──────────────────────────────────────────
router.post('/auth/login', AuthController.login);
router.get('/tracking/:token', TrackingController.getStatus);

// ─── Super Admin Only ────────────────────────────────
router.post('/admin/tenants', authMiddleware, roleCheck(['SUPER_ADMIN']), AuthController.registerTenant);
router.get('/admin/tenants', authMiddleware, roleCheck(['SUPER_ADMIN']), TenantController.list);
router.patch('/admin/tenants/:id', authMiddleware, roleCheck(['SUPER_ADMIN']), TenantController.update);
router.get('/admin/dashboard', authMiddleware, roleCheck(['SUPER_ADMIN']), DashboardController.getAdminKpis);

// ─── Tenant/Bureau (Requires Auth + Tenant Context) ──
router.get('/dashboard/kpis', authMiddleware, tenantContext, DashboardController.getKpis);
router.post('/transactions', authMiddleware, tenantContext, TransactionController.create);
router.patch('/transactions/:id/status', authMiddleware, tenantContext, TransactionController.updateStatus);
router.get('/transactions', authMiddleware, tenantContext, TransactionController.list);

export default router;
