import { Request, Response, NextFunction } from 'express';
import { TransactionDocumentService } from './document.service';
import { sendSuccess } from '../../shared/utils/response';

export class TransactionDocumentController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const documents = await TransactionDocumentService.list(req.params.id, req.user!.tenant_id);
      return sendSuccess(res, documents);
    } catch (err) { next(err); }
  }

  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await TransactionDocumentService.upload(
        req.params.id,
        req.params.itemId,
        req.user!.tenant_id,
        req.user!.user_id,
        req.body.documentCode,
        req.file
      );
      return sendSuccess(res, document, 'Document uploaded', 201);
    } catch (err) { next(err); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await TransactionDocumentService.remove(
        req.params.id,
        req.params.documentId,
        req.user!.tenant_id
      );
      return sendSuccess(res, document, 'Document deleted');
    } catch (err) { next(err); }
  }
}
