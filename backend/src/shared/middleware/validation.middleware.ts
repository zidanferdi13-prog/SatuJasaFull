import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return sendError(
          res,
          'Validation error',
          422,
          err.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        );
      }
      next(err);
    }
  };
};
