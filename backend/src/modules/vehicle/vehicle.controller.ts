import { Request, Response, NextFunction } from 'express';
import { VehicleService } from './vehicle.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class VehicleController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicles, total, page, limit } = await VehicleService.list(req.user!.tenant_id, req.query);
      return sendPaginated(res, vehicles, total, page, limit);
    } catch (err) { next(err); }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.findById(req.params.id, req.user!.tenant_id);
      return sendSuccess(res, vehicle);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.create(req.user!.tenant_id, req.body);
      return sendSuccess(res, vehicle, 'Vehicle created', 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.update(req.params.id, req.user!.tenant_id, req.body);
      return sendSuccess(res, vehicle);
    } catch (err) { next(err); }
  }
}
