import { Router } from 'express';
import multer from 'multer';
import { TransactionController } from './transaction.controller';
import { TransactionDocumentController } from './document.controller';
import { PaymentController } from '../payment/payment.controller';
import { authMiddleware, subscriptionMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import {
  createTransactionSchema,
  updateTransactionStatusSchema,
  finalizeTransactionSchema,
  updateDocumentChecklistSchema,
} from './transaction.schema';
import { createPaymentSchema } from '../payment/payment.schema';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authMiddleware, subscriptionMiddleware);

router.get('/', TransactionController.list);
router.get('/requirements', TransactionController.getRequirements);
router.post('/', validate(createTransactionSchema), TransactionController.create);
router.get('/:id', TransactionController.getOne);
router.patch('/:id/status', validate(updateTransactionStatusSchema), TransactionController.updateStatus);
router.post('/:id/finalize', validate(finalizeTransactionSchema), TransactionController.finalize);
router.post('/:id/close', TransactionController.close);
router.patch('/:id/document-checklist/:checklistId', validate(updateDocumentChecklistSchema), TransactionController.updateDocumentChecklist);
router.get('/:id/invoice', TransactionController.getInvoice);
router.get('/:id/documents', TransactionDocumentController.list);
router.post('/:id/items/:itemId/documents', upload.single('file'), TransactionDocumentController.upload);
router.delete('/:id/documents/:documentId', TransactionDocumentController.remove);

// Payments nested under transactions
router.get('/:id/payments', PaymentController.list);
router.post('/:id/payments', validate(createPaymentSchema), PaymentController.create);

export default router;
