import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { PaymentController } from '../payment/payment.controller';
import { authMiddleware, subscriptionMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import {
  createTransactionSchema,
  updateTransactionStatusSchema,
  finalizeTransactionSchema,
} from './transaction.schema';
import { createPaymentSchema } from '../payment/payment.schema';

const router = Router();

router.use(authMiddleware, subscriptionMiddleware);

router.get('/', TransactionController.list);
router.post('/', validate(createTransactionSchema), TransactionController.create);
router.get('/:id', TransactionController.getOne);
router.patch('/:id/status', validate(updateTransactionStatusSchema), TransactionController.updateStatus);
router.post('/:id/finalize', validate(finalizeTransactionSchema), TransactionController.finalize);
router.post('/:id/close', TransactionController.close);
router.get('/:id/invoice', TransactionController.getInvoice);

// Payments nested under transactions
router.get('/:id/payments', PaymentController.list);
router.post('/:id/payments', validate(createPaymentSchema), PaymentController.create);

export default router;
