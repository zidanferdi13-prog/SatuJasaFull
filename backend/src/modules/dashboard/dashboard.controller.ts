import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../shared/utils/response';

export class DashboardController {
  static async getTenantDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getTenantKpis(req.user!.tenant_id, req.user!.branch_id);
      return sendSuccess(res, stats);
    } catch (err) { next(err); }
  }

  static async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getAdminKpis();
      return sendSuccess(res, stats);
    } catch (err) { next(err); }
  }

  static async getBranchDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getBranchKpis(req.user!.tenant_id, req.params.branchId);
      return sendSuccess(res, stats);
    } catch (err) { next(err); }
  }

  // Legacy
  static async getKpis(req: Request, res: Response, next: NextFunction) {
    return DashboardController.getTenantDashboard(req, res, next);
  }

  static async getAdminKpis(req: Request, res: Response, next: NextFunction) {
    return DashboardController.getAdminDashboard(req, res, next);
  }
}

