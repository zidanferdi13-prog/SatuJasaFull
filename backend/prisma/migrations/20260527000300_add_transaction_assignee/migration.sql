ALTER TABLE "transactions" ADD COLUMN "assignedToUserId" TEXT;

CREATE INDEX "transactions_assignedToUserId_idx" ON "transactions"("assignedToUserId");

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
