ALTER TABLE "branches" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "customers" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "vehicles" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "service_types" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "m_fee_rules" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "pricing_rules" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "transactions" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "branches_deletedAt_idx" ON "branches"("deletedAt");
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");
CREATE INDEX "vehicles_deletedAt_idx" ON "vehicles"("deletedAt");
CREATE INDEX "service_types_deletedAt_idx" ON "service_types"("deletedAt");
CREATE INDEX "m_fee_rules_deletedAt_idx" ON "m_fee_rules"("deletedAt");
CREATE INDEX "pricing_rules_deletedAt_idx" ON "pricing_rules"("deletedAt");
CREATE INDEX "transactions_deletedAt_idx" ON "transactions"("deletedAt");
