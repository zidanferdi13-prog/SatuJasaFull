import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { runWithTenant } from '../../config/tenant-context';
import { redis } from '../services/redis.service';
import { sendError } from '../utils/response';

export interface JwtPayload {
  user_id: string;
  tenant_id: string;
  branch_id: string;
  role: string;
  tenant_code: string;
  jti?: string;
  exp?: number;
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.cookies?.token;

  if (!token) {
    return sendError(res, 'Unauthorized: No token provided', 401);
  }
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    ) as JwtPayload;
    if (decoded.jti) {
      const blocked = await redis.exists(`blocklist:${decoded.jti}`);
      if (blocked) return sendError(res, 'Unauthorized: Token has been revoked', 401);
    }

    req.user = decoded;
    return runWithTenant(
      {
        tenantId: decoded.tenant_id,
        userId: decoded.user_id,
        role: decoded.role,
      },
      next
    );
  } catch {
    return sendError(res, 'Unauthorized: Invalid or expired token', 401);
  }
};

export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden: Insufficient permissions', 403);
    }
    next();
  };
};

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return sendError(res, 'Unauthorized', 401);
  if (req.user.role === 'SUPER_ADMIN') return next();

  const prisma = (await import('../../config/prisma')).default;
  const tenant = await prisma.tenant.findUnique({ where: { id: req.user.tenant_id } });

  if (!tenant || !tenant.isActive) {
    return sendError(res, 'Tenant not found or inactive', 403);
  }
  if (tenant.subscriptionStatus !== 'ACTIVE' || tenant.subscriptionEnd < new Date()) {
    if (tenant.subscriptionEnd < new Date()) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { subscriptionStatus: 'EXPIRED' },
      });
    }
    return sendError(res, 'Tenant subscription expired or suspended', 402);
  }
  next();
};

// Legacy exports for backward compatibility
export const UserPayload = undefined;
export const tenantContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next();

  return runWithTenant(
    {
      tenantId: req.user.tenant_id,
      userId: req.user.user_id,
      role: req.user.role,
    },
    next
  );
};
export const roleCheck = (roles: string[]) => roleMiddleware(...roles);
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  sendError(res, 'Internal server error', 500);
};
