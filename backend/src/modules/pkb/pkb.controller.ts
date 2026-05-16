import { Request, Response, NextFunction } from 'express';
import { PkbService } from './pkb.service';
import { sendSuccess } from '../../shared/utils/response';

export class PkbController {
  static async check(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PkbService.check(req.body);
      return sendSuccess(res, data, 'PKB data retrieved');
    } catch (err) { next(err); }
  }
}
