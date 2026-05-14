import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class CustomerController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { customers, total, page, limit } = await CustomerService.list(req.user!.tenant_id, req.query);
      return sendPaginated(res, customers, total, page, limit);
    } catch (err) { next(err); }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.findById(req.params.id, req.user!.tenant_id);
      return sendSuccess(res, customer);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.create(req.user!.tenant_id, req.body);
      return sendSuccess(res, customer, 'Customer created', 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.update(req.params.id, req.user!.tenant_id, req.body);
      return sendSuccess(res, customer);
    } catch (err) { next(err); }
  }
}
