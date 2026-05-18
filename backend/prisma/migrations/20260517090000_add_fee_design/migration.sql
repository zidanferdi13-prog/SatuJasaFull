-- CreateTable
CREATE TABLE "m_vehicle_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceGroup" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "m_vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_fee_components" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "m_fee_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_fee_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "provinceCode" TEXT NOT NULL DEFAULT 'JABAR',
    "cityCode" TEXT,
    "serviceTypeId" TEXT NOT NULL,
    "vehicleTypeCode" TEXT NOT NULL,
    "priceGroup" TEXT NOT NULL,
    "componentCode" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "defaultAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "m_fee_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_service_document_requirements" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "serviceTypeId" TEXT NOT NULL,
    "documentCode" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "m_service_document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_item_fee_details" (
    "id" TEXT NOT NULL,
    "transactionItemId" TEXT NOT NULL,
    "componentCode" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "defaultAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'master',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_item_fee_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_item_document_checklists" (
    "id" TEXT NOT NULL,
    "transactionItemId" TEXT NOT NULL,
    "documentCode" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),
    "checkedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_item_document_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "m_vehicle_types_code_key" ON "m_vehicle_types"("code");

-- CreateIndex
CREATE INDEX "m_vehicle_types_priceGroup_idx" ON "m_vehicle_types"("priceGroup");

-- CreateIndex
CREATE UNIQUE INDEX "m_fee_components_code_key" ON "m_fee_components"("code");

-- CreateIndex
CREATE INDEX "m_fee_rules_tenantId_provinceCode_serviceTypeId_vehicleTypeCode_idx" ON "m_fee_rules"("tenantId", "provinceCode", "serviceTypeId", "vehicleTypeCode");

-- CreateIndex
CREATE INDEX "m_fee_rules_tenantId_provinceCode_serviceTypeId_priceGroup_idx" ON "m_fee_rules"("tenantId", "provinceCode", "serviceTypeId", "priceGroup");

-- CreateIndex
CREATE INDEX "m_fee_rules_componentCode_idx" ON "m_fee_rules"("componentCode");

-- CreateIndex
CREATE INDEX "m_service_document_requirements_tenantId_serviceTypeId_idx" ON "m_service_document_requirements"("tenantId", "serviceTypeId");

-- CreateIndex
CREATE INDEX "m_service_document_requirements_documentCode_idx" ON "m_service_document_requirements"("documentCode");

-- CreateIndex
CREATE INDEX "transaction_item_fee_details_transactionItemId_idx" ON "transaction_item_fee_details"("transactionItemId");

-- CreateIndex
CREATE INDEX "transaction_item_fee_details_componentCode_idx" ON "transaction_item_fee_details"("componentCode");

-- CreateIndex
CREATE INDEX "transaction_item_document_checklists_transactionItemId_idx" ON "transaction_item_document_checklists"("transactionItemId");

-- CreateIndex
CREATE INDEX "transaction_item_document_checklists_documentCode_idx" ON "transaction_item_document_checklists"("documentCode");

-- AddForeignKey
ALTER TABLE "m_fee_rules" ADD CONSTRAINT "m_fee_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_fee_rules" ADD CONSTRAINT "m_fee_rules_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_service_document_requirements" ADD CONSTRAINT "m_service_document_requirements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_service_document_requirements" ADD CONSTRAINT "m_service_document_requirements_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_item_fee_details" ADD CONSTRAINT "transaction_item_fee_details_transactionItemId_fkey" FOREIGN KEY ("transactionItemId") REFERENCES "transaction_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_item_document_checklists" ADD CONSTRAINT "transaction_item_document_checklists_transactionItemId_fkey" FOREIGN KEY ("transactionItemId") REFERENCES "transaction_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
