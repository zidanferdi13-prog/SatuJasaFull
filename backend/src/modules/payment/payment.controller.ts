import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { sendSuccess } from '../../shared/utils/response';

export class PaymentController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentService.list(req.params.id, req.user!.tenant_id);
      return sendSuccess(res, payments);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.create(req.params.id, req.user!.tenant_id, req.body);
      return sendSuccess(res, payment, 'Payment recorded', 201);
    } catch (err) { next(err); }
  }
}
