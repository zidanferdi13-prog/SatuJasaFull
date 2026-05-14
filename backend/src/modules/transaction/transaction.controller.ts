import { Request, Response, NextFunction } from 'express';
import { TransactionService } from './transaction.service';
import { InvoiceService } from '../invoice/invoice.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import path from 'path';

export class TransactionController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactions, total, page, limit } = await TransactionService.list(req.user!.tenant_id, req.query);
      return sendPaginated(res, transactions, total, page, limit);
    } catch (err) { next(err); }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const tx = await TransactionService.findById(req.params.id, req.user!.tenant_id);
      return sendSuccess(res, tx);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tx = await TransactionService.create(
        req.user!.tenant_id,
        req.user!.branch_id,
        req.user!.user_id,
        req.body
      );
      return sendSuccess(res, tx, 'Transaction created', 201);
    } catch (err) { next(err); }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tx = await TransactionService.updateStatus(
        req.params.id,
        req.user!.tenant_id,
        req.user!.user_id,
        req.body.status,
        req.body.notes
      );
      return sendSuccess(res, tx);
    } catch (err) { next(err); }
  }

  static async finalize(req: Request, res: Response, next: NextFunction) {
    try {
      const tx = await TransactionService.finalize(
        req.params.id,
        req.user!.tenant_id,
        req.user!.user_id,
        req.body.finalTotal,
        req.body.notes
      );
      return sendSuccess(res, tx);
    } catch (err) { next(err); }
  }

  static async close(req: Request, res: Response, next: NextFunction) {
    try {
      const tx = await TransactionService.close(req.params.id, req.user!.tenant_id, req.user!.user_id);
      return sendSuccess(res, tx, 'Transaction closed');
    } catch (err) { next(err); }
  }

  static async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoicePath = await TransactionService.getInvoicePath(req.params.id, req.user!.tenant_id);

      if (!invoicePath) {
        // Generate invoice on-demand
        const tx = await TransactionService.findById(req.params.id, req.user!.tenant_id);
        const generatedPath = await InvoiceService.generate(tx as any);
        return res.sendFile(path.resolve(generatedPath));
      }

      return res.sendFile(path.resolve(invoicePath));
    } catch (err) { next(err); }
  }
}

