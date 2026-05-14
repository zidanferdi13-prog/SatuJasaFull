import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import logger from '../logger';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ message: err.message, stack: err.stack, path: req.path });

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error', 422, err.errors);
  }

  if (err.code === 'P2002') {
    return sendError(res, 'Duplicate entry: a record with this value already exists', 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  const status = err.statusCode || err.status || 500;
  const message = status < 500 ? err.message : 'Internal server error';
  return sendError(res, message, status);
};
