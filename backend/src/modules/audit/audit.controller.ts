import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';
import { sendPaginated } from '../../shared/utils/response';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { logs, total, page, limit } = await AuditService.list(
        req.user!.tenant_id,
        req.user!.role,
        req.query
      );
      return sendPaginated(res, logs, total, page, limit);
    } catch (err) { next(err); }
  }
}
