import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { requestContextStorage } from '../../config/request-context';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = String(req.headers['x-request-id'] || randomUUID());
  res.setHeader('X-Request-Id', requestId);
  requestContextStorage.run({ requestId }, next);
};
