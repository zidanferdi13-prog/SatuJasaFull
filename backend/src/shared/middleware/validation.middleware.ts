import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Propagate Zod-transformed values (defaults, coercions) back to the request
      if (parsed && typeof parsed === 'object') {
        if ('body' in parsed) req.body = (parsed as any).body;
        if ('query' in parsed) req.query = (parsed as any).query;
      }
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
