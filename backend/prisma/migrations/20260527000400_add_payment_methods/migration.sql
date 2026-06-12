ALTER TYPE "PaymentMethod" ADD VALUE 'TRANSFER';
ALTER TYPE "PaymentMethod" ADD VALUE 'QRIS';
ALTER TYPE "PaymentMethod" ADD VALUE 'VA';
ALTER TYPE "PaymentMethod" ADD VALUE 'EDC';

ALTER TABLE "payments" ADD COLUMN "referenceNumber" TEXT;
