import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export interface JwtPayload {
  user_id: string;
  tenant_id: string;
  branch_id: string;
  role: string;
  tenant_code: string;
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized: No token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access-secret'
    ) as JwtPayload;
    req.user = decoded;
    next();
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
  next();
};
export const roleCheck = (roles: string[]) => roleMiddleware(...roles);
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  sendError(res, 'Internal server error', 500);
};
