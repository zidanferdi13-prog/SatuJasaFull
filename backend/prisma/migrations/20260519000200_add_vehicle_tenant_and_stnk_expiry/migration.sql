ALTER TABLE "vehicles" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "vehicles" ADD COLUMN "stnkExpiryDate" TIMESTAMP(3);

UPDATE "vehicles" v
SET "tenantId" = c."tenantId"
FROM "customers" c
WHERE v."customerId" = c."id";

ALTER TABLE "vehicles" ALTER COLUMN "tenantId" SET NOT NULL;

CREATE INDEX "vehicles_tenantId_idx" ON "vehicles"("tenantId");
CREATE INDEX "vehicles_tenantId_plateNumber_idx" ON "vehicles"("tenantId", "plateNumber");
CREATE INDEX "vehicles_stnkExpiryDate_idx" ON "vehicles"("stnkExpiryDate");

ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
