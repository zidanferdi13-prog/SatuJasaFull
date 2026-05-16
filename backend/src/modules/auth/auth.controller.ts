import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body.email, req.body.password);
      return sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken);
      return sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response) {
    // Token invalidation would require Redis blocklist - for MVP, client discards token
    return sendSuccess(res, null, 'Logged out successfully');
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.me(req.user!.user_id);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }

  static async subscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await AuthService.subscription(req.user!.user_id);
      return sendSuccess(res, subscription);
    } catch (err) {
      next(err);
    }
  }

  static async registerTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerTenant(req.body);
      return sendSuccess(res, result, 'Tenant registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}
