import { Request, Response, NextFunction } from 'express';
import { ServiceTypeService } from './service-type.service';
import { sendSuccess } from '../../shared/utils/response';

export class ServiceTypeController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ServiceTypeService.list(req.user!.tenant_id);
      return sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.role === 'SUPER_ADMIN' ? null : req.user!.tenant_id;
      const st = await ServiceTypeService.create(tenantId, req.body);
      return sendSuccess(res, st, 'Service type created', 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const st = await ServiceTypeService.update(req.params.id, req.body);
      return sendSuccess(res, st);
    } catch (err) { next(err); }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const st = await ServiceTypeService.updateStatus(req.params.id, req.body.isActive);
      return sendSuccess(res, st);
    } catch (err) { next(err); }
  }
}
