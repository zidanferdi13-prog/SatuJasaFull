import { Request, Response } from 'express';
import { TransactionService } from './transaction.service';

export class TransactionController {
  static async create(req: Request, res: Response) {
    try {
      const result = await TransactionService.create(req.tenantId!, req.branchId!, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const result = await TransactionService.updateStatus(id, req.tenantId!, status, notes);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
