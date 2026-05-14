import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/prisma';

export const auditMiddleware = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode < 400 && req.user) {
        const entityId = req.params.id || body?.data?.id;
        prisma.auditLog
          .create({
            data: {
              tenantId: req.user.tenant_id || null,
              action,
              entity,
              entityId: entityId || null,
              after: body?.data || null,
              createdBy: req.user.user_id,
              ipAddress: req.ip,
            },
          })
          .catch(() => {}); // fire-and-forget
      }
      return originalJson(body);
    };
    next();
  };
};
