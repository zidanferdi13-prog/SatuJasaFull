CREATE TABLE "transaction_documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "transactionItemId" TEXT NOT NULL,
    "documentCode" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "transaction_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "transaction_documents_tenantId_idx" ON "transaction_documents"("tenantId");
CREATE INDEX "transaction_documents_transactionItemId_idx" ON "transaction_documents"("transactionItemId");
CREATE INDEX "transaction_documents_documentCode_idx" ON "transaction_documents"("documentCode");

ALTER TABLE "transaction_documents" ADD CONSTRAINT "transaction_documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transaction_documents" ADD CONSTRAINT "transaction_documents_transactionItemId_fkey" FOREIGN KEY ("transactionItemId") REFERENCES "transaction_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
