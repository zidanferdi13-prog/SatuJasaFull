import { Request, Response } from 'express';
import { TenantService } from './tenant.service';

export class TenantController {
  static async list(req: Request, res: Response) {
    try {
      const tenants = await TenantService.listAll();
      return res.json(tenants);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { subscriptionEnd, status } = req.body;
      const tenant = await TenantService.updateSubscription(id, subscriptionEnd, status);
      return res.json(tenant);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
