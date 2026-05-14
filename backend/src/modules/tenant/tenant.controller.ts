import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class TenantController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenants, total, page, limit } = await TenantService.listAll(req.query);
      return sendPaginated(res, tenants, total, page, limit);
    } catch (err) { next(err); }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.findById(req.params.id);
      return sendSuccess(res, tenant);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Delegates to auth service's registerTenant
      const { AuthService } = await import('../auth/auth.service');
      const result = await AuthService.registerTenant(req.body);
      return sendSuccess(res, result, 'Tenant created', 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.update(req.params.id, req.body);
      return sendSuccess(res, tenant);
    } catch (err) { next(err); }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await TenantService.updateStatus(req.params.id, req.body);
      return sendSuccess(res, tenant);
    } catch (err) { next(err); }
  }

  static async impersonate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.impersonate(req.params.id, req.user!.user_id);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async resetOwnerPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.resetOwnerPassword(req.params.id, req.body.newPassword);
      return sendSuccess(res, result, 'Owner password reset successfully');
    } catch (err) { next(err); }
  }

  static async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      const tenant = await TenantService.uploadLogo(req.params.id, req.file.path);
      return sendSuccess(res, { logoUrl: tenant.logoUrl });
    } catch (err) { next(err); }
  }
}
