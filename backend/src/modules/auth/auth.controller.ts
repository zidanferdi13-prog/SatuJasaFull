import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { env } from '../../config/env';
import { redis } from '../../shared/services/redis.service';
import { sendSuccess } from '../../shared/utils/response';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    path: '/api/v1/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('token', cookieOptions);
  res.clearCookie('refreshToken', { ...cookieOptions, path: '/api/v1/auth/refresh' });
};

const requestMeta = (req: Request) => ({
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});

const getTokenTtlSeconds = (token: string) => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) return 15 * 60;
  return Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1);
};

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body.email, req.body.password, requestMeta(req));
      setAuthCookies(res, result.accessToken, result.refreshToken);
      return sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken ?? req.cookies?.refreshToken;
      if (!refreshToken) throw Object.assign(new Error('Refresh token is required'), { statusCode: 401 });
      const result = await AuthService.refresh(refreshToken, requestMeta(req));
      setAuthCookies(res, result.accessToken, result.refreshToken);
      return sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies?.token;

    if (req.user?.jti && token) {
      await redis.set(`blocklist:${req.user.jti}`, '1', 'EX', getTokenTtlSeconds(token));
    }

    clearAuthCookies(res);
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
