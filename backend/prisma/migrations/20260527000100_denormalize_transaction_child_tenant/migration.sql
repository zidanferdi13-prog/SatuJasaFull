ALTER TABLE "transaction_items" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "payments" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "transaction_logs" ADD COLUMN "tenantId" TEXT;

UPDATE "transaction_items" ti
SET "tenantId" = t."tenantId"
FROM "transactions" t
WHERE ti."transactionId" = t."id";

UPDATE "payments" p
SET "tenantId" = t."tenantId"
FROM "transactions" t
WHERE p."transactionId" = t."id";

UPDATE "transaction_logs" tl
SET "tenantId" = t."tenantId"
FROM "transactions" t
WHERE tl."transactionId" = t."id";

ALTER TABLE "transaction_items" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "payments" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "transaction_logs" ALTER COLUMN "tenantId" SET NOT NULL;

CREATE INDEX "transaction_items_tenantId_idx" ON "transaction_items"("tenantId");
CREATE INDEX "transaction_items_tenantId_transactionId_idx" ON "transaction_items"("tenantId", "transactionId");
CREATE INDEX "payments_tenantId_idx" ON "payments"("tenantId");
CREATE INDEX "payments_tenantId_transactionId_idx" ON "payments"("tenantId", "transactionId");
CREATE INDEX "transaction_logs_tenantId_idx" ON "transaction_logs"("tenantId");
CREATE INDEX "transaction_logs_tenantId_transactionId_idx" ON "transaction_logs"("tenantId", "transactionId");
