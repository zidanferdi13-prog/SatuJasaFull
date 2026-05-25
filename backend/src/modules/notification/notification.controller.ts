import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { registerDeviceToken } from '../../shared/services/push.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class NotificationController {
  static async registerDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const token = await registerDeviceToken(
        req.user!.tenant_id,
        req.user!.user_id,
        req.body.token,
        req.body.platform,
        req.body.deviceId
      );
      return sendSuccess(res, token, 'Device token registered');
    } catch (err) { next(err); }
  }

  static async listQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.role === 'SUPER_ADMIN' ? undefined as any : req.user!.tenant_id;
      const { items, total, page, limit } = await NotificationService.listQueue(tenantId, req.query);
      return sendPaginated(res, items, total, page, limit);
    } catch (err) { next(err); }
  }

  static async retry(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await NotificationService.retry(req.params.id, req.user!.tenant_id);
      return sendSuccess(res, item, 'Queued for retry');
    } catch (err) { next(err); }
  }
}
