import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import tenantRoutes from './modules/tenant/tenant.routes';
import branchRoutes from './modules/branch/branch.routes';
import customerRoutes from './modules/customer/customer.routes';
import vehicleRoutes from './modules/vehicle/vehicle.routes';
import serviceTypeRoutes from './modules/service-type/service-type.routes';
import pricingRoutes from './modules/pricing/pricing.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import trackingRoutes from './modules/tracking/tracking.routes';
import notificationRoutes from './modules/notification/notification.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import exportRoutes from './modules/export/export.routes';
import auditRoutes from './modules/audit/audit.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/branches', branchRoutes);
router.use('/customers', customerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/service-types', serviceTypeRoutes);
router.use('/pricing-rules', pricingRoutes);
router.use('/transactions', transactionRoutes);
router.use('/tracking', trackingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/exports', exportRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
