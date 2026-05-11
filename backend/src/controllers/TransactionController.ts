import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TransactionService } from '../services/TransactionService';

export class TransactionController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const { customer_id, customer_data, service_id, payment_method } = req.body;
      const bureauId = req.user?.bureau_id;

      if (!service_id || (!customer_id && !customer_data)) {
        return res.status(400).json({ error: 'Service ID and customer information required' });
      }

      const result = await TransactionService.createTransaction(
        bureauId,
        customer_id || null,
        customer_data || null,
        service_id,
        payment_method || 'CASH',
      );

      res.status(201).json({
        data: result.transaction,
        tracking_token: result.trackingToken,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const bureauId = req.user?.bureau_id;
      const { limit = 20, offset = 0, status, start_date, end_date } = req.query;

      const result = await TransactionService.listTransactions(
        bureauId,
        parseInt(limit as string),
        parseInt(offset as string),
        status as string,
        start_date ? new Date(start_date as string) : undefined,
        end_date ? new Date(end_date as string) : undefined,
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const bureauId = req.user?.bureau_id;

      const transaction = await TransactionService.getTransaction(id, bureauId);
      res.json({ data: transaction });
    } catch (error: any) {
      res.status(error.message === 'Transaction not found' ? 404 : 400).json({ error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const bureauId = req.user?.bureau_id;

      if (!status) {
        return res.status(400).json({ error: 'Status required' });
      }

      const transaction = await TransactionService.updateStatus(id, bureauId, status);
      res.json({ data: transaction });
    } catch (error: any) {
      res.status(error.message === 'Transaction not found' ? 404 : 400).json({ error: error.message });
    }
  }
}
