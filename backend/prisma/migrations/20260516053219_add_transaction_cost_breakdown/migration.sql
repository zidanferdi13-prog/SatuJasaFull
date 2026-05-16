-- AlterTable
ALTER TABLE "transaction_items" ADD COLUMN     "baseCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "serviceFee" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "baseCostTotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "serviceFeeTotal" DECIMAL(15,2) NOT NULL DEFAULT 0;
