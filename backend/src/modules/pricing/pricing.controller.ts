import { Request, Response, NextFunction } from 'express';
import { PricingService } from './pricing.service';
import { sendSuccess } from '../../shared/utils/response';

export class PricingController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PricingService.list(req.user!.tenant_id);
      return sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await PricingService.create(req.user!.tenant_id, req.body);
      return sendSuccess(res, rule, 'Pricing rule created', 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await PricingService.update(req.params.id, req.user!.tenant_id, req.body);
      return sendSuccess(res, rule);
    } catch (err) { next(err); }
  }
}
