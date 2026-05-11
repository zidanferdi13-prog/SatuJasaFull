import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async getKpis(req: Request, res: Response) {
    try {
      const stats = await DashboardService.getTenantKpis(req.tenantId!, req.branchId!);
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
