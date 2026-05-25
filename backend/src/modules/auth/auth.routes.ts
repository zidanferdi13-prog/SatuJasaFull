import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { loginSchema, refreshTokenSchema, registerTenantSchema } from './auth.schema';
import { roleMiddleware } from '../../shared/middleware/auth.middleware';
import { loginLimiter, refreshLimiter, registerTenantLimiter } from '../../shared/middleware/rate-limit.middleware';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', refreshLimiter, validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);
router.get('/subscription', authMiddleware, AuthController.subscription);

// Super Admin only: register a new tenant
router.post(
  '/register-tenant',
  registerTenantLimiter,
  authMiddleware,
  roleMiddleware('SUPER_ADMIN'),
  validate(registerTenantSchema),
  AuthController.registerTenant
);

export default router;
