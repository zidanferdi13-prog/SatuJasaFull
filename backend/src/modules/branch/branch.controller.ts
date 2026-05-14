import { Request, Response, NextFunction } from 'express';
import { BranchService } from './branch.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class BranchController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.role === 'SUPER_ADMIN'
        ? (req.query.tenant_id as string) || req.user!.tenant_id
        : req.user!.tenant_id;
      const { branches, total, page, limit } = await BranchService.list(tenantId, req.query);
      return sendPaginated(res, branches, total, page, limit);
    } catch (err) { next(err); }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = await BranchService.findById(req.params.id, req.user!.tenant_id);
      return sendSuccess(res, branch);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = await BranchService.create(req.user!.tenant_id, req.body);
      return sendSuccess(res, branch, 'Branch created', 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = await BranchService.update(req.params.id, req.user!.tenant_id, req.body);
      return sendSuccess(res, branch);
    } catch (err) { next(err); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BranchService.delete(req.params.id, req.user!.tenant_id);
      return sendSuccess(res, null, 'Branch deleted');
    } catch (err) { next(err); }
  }
}
