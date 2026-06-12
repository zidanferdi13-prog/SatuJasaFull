CREATE TABLE "pricing_rule_histories" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "pricingRuleId" TEXT NOT NULL,
  "serviceTypeId" TEXT NOT NULL,
  "oldPrice" DECIMAL(15,2) NOT NULL,
  "newPrice" DECIMAL(15,2) NOT NULL,
  "oldMargin" DECIMAL(15,2) NOT NULL,
  "newMargin" DECIMAL(15,2) NOT NULL,
  "oldIsActive" BOOLEAN NOT NULL,
  "newIsActive" BOOLEAN NOT NULL,
  "changedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "pricing_rule_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pricing_rule_histories_tenantId_idx" ON "pricing_rule_histories"("tenantId");
CREATE INDEX "pricing_rule_histories_pricingRuleId_idx" ON "pricing_rule_histories"("pricingRuleId");
CREATE INDEX "pricing_rule_histories_serviceTypeId_idx" ON "pricing_rule_histories"("serviceTypeId");
CREATE INDEX "pricing_rule_histories_changedBy_idx" ON "pricing_rule_histories"("changedBy");

ALTER TABLE "pricing_rule_histories" ADD CONSTRAINT "pricing_rule_histories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pricing_rule_histories" ADD CONSTRAINT "pricing_rule_histories_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "pricing_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pricing_rule_histories" ADD CONSTRAINT "pricing_rule_histories_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pricing_rule_histories" ADD CONSTRAINT "pricing_rule_histories_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
