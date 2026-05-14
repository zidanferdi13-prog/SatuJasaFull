import { Response } from 'express';

export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  [key: string]: any;
}

export const sendSuccess = (
  res: Response,
  data: any = null,
  message = 'Success',
  statusCode = 200,
  meta?: Meta
) => {
  const body: any = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors: any[] = []
) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

export const sendPaginated = (
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
) => {
  return sendSuccess(res, data, message, 200, {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  });
};
