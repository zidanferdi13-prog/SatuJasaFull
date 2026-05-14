import { Request, Response, NextFunction } from 'express';
import { TrackingService } from './tracking.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class TrackingController {
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TrackingService.getByTrackingCode(req.params.trackingCode);
      if (!data) return sendError(res, 'Tracking code not found', 404);
      return sendSuccess(res, data);
    } catch (err) { next(err); }
  }
}

