import prisma from '../../config/prisma';
import { getPagination } from '../../shared/utils/pagination';
import { generateInvoiceNumber, generateTrackingCode } from '../../shared/utils/invoice';
import { STATUS_TRANSITIONS } from '../../shared/constants';
import { enqueueWhatsApp } from '../../shared/services/whatsapp.service';
import { sendPushToUsers } from '../../shared/services/push.service';
import { BranchService } from '../branch/branch.service';

const TX_INCLUDE = {
  customer: { select: { id: true, name: true, phone: true } },
  branch: { select: { id: true, name: true } },
  items: {
    include: {
      vehicle: { select: { id: true, plateNumber: true, brand: true, model: true } },
      serviceType: { select: { id: true, name: true } },
      feeDetails: { orderBy: { createdAt: 'asc' as const } },
      documentChecklist: { orderBy: { createdAt: 'asc' as const } },
    },
  },
  payments: { orderBy: { createdAt: 'asc' as const } },
  logs: { orderBy: { createdAt: 'asc' as const } },
};

const SERVICE_COMPONENTS = new Set(['JASA_BIRO']);

const numberValue = (value: unknown) => Number(value || 0);

export class TransactionService {
  private static async resolveBranch(tenantId: string, branchId?: string) {
    if (branchId) {
      const branch = await prisma.branch.findFirst({ where: { id: branchId, tenantId, isActive: true } });
      if (branch) return branch;
    }

    return BranchService.getOrCreateDefault(tenantId);
  }

  private static async getVehicleType(vehicleTypeCode?: string) {
    if (vehicleTypeCode) {
      const vehicleType = await prisma.masterVehicleType.findFirst({ where: { code: vehicleTypeCode, isActive: true } });
      if (vehicleType) return vehicleType;
    }

    return prisma.masterVehicleType.findFirst({ where: { code: 'MOTOR', isActive: true } });
  }

  private static async getFeeRules(tenantId: string, serviceTypeId: string, vehicleTypeCode?: string, provinceCode = 'JABAR') {
    const vehicleType = await TransactionService.getVehicleType(vehicleTypeCode);
    if (!vehicleType) throw Object.assign(new Error('Vehicle type master data is not configured'), { statusCode: 422 });

    const where = {
      provinceCode,
      serviceTypeId,
      vehicleTypeCode: vehicleType.code,
      isActive: true,
    };

    const tenantRules = await prisma.masterFeeRule.findMany({
      where: { ...where, tenantId },
      orderBy: { sortOrder: 'asc' },
    });

    const rules = tenantRules.length > 0
      ? tenantRules
      : await prisma.masterFeeRule.findMany({
        where: { ...where, tenantId: null },
        orderBy: { sortOrder: 'asc' },
      });

    return { vehicleType, rules };
  }

  private static async getDocumentRequirements(tenantId: string, serviceTypeId: string) {
    const where = { serviceTypeId, isActive: true };
    const tenantRequirements = await prisma.masterServiceDocumentRequirement.findMany({
      where: { ...where, tenantId },
      orderBy: { sortOrder: 'asc' },
    });

    return tenantRequirements.length > 0
      ? tenantRequirements
      : prisma.masterServiceDocumentRequirement.findMany({
        where: { ...where, tenantId: null },
        orderBy: { sortOrder: 'asc' },
      });
  }

  private static async getServiceFeeAmount(tenantId: string, serviceTypeId: string) {
    const pricingRule = await prisma.pricingRule.findFirst({
      where: { tenantId, serviceTypeId, isActive: true },
    });

    return numberValue(pricingRule?.marginAmount ?? pricingRule?.price ?? 0);
  }

  private static applyServiceFee(rules: any[], serviceFeeAmount: number) {
    return rules.map((rule) => (
      rule.componentCode === 'JASA_BIRO'
        ? { ...rule, defaultAmount: serviceFeeAmount }
        : rule
    ));
  }

  static async getRequirements(tenantId: string, query: any) {
    const provinceCode = query.provinceCode || 'JABAR';
    if (!query.serviceTypeId) throw Object.assign(new Error('serviceTypeId is required'), { statusCode: 400 });

    const { vehicleType, rules } = await TransactionService.getFeeRules(
      tenantId,
      query.serviceTypeId,
      query.vehicleTypeCode,
      provinceCode
    );
    const serviceFeeAmount = await TransactionService.getServiceFeeAmount(tenantId, query.serviceTypeId);
    const feeRules = TransactionService.applyServiceFee(rules, serviceFeeAmount);
    const documentRequirements = await TransactionService.getDocumentRequirements(tenantId, query.serviceTypeId);

    return {
      provinceCode,
      vehicleType,
      feeRules,
      documentRequirements,
      totalDefaultAmount: feeRules.reduce((sum, rule) => sum + numberValue(rule.defaultAmount), 0),
    };
  }

  private static async buildTransactionItems(tenantId: string, items: any[]) {
    return Promise.all(items.map(async (item) => {
      const provinceCode = item.provinceCode || 'JABAR';
      const { vehicleType, rules } = await TransactionService.getFeeRules(
        tenantId,
        item.serviceTypeId,
        item.vehicleTypeCode,
        provinceCode
      );

      if (rules.length === 0) {
        throw Object.assign(new Error('Fee rules not configured for selected service type and vehicle type'), { statusCode: 422 });
      }

      const documentRequirements = await TransactionService.getDocumentRequirements(tenantId, item.serviceTypeId);
      const serviceFeeAmount = await TransactionService.getServiceFeeAmount(tenantId, item.serviceTypeId);
      const feeRules = TransactionService.applyServiceFee(rules, serviceFeeAmount);
      const amountOverrides = new Map<string, number>(
        (item.feeDetails || []).map((fee: any) => [fee.componentCode, Number(fee.amount ?? fee.defaultAmount ?? 0)])
      );
      const feeDetails = feeRules.map((rule) => {
        const amount = amountOverrides.has(rule.componentCode)
          ? amountOverrides.get(rule.componentCode) || 0
          : numberValue(rule.defaultAmount);

        return {
          componentCode: rule.componentCode,
          componentName: rule.componentName,
          defaultAmount: rule.defaultAmount,
          amount,
          isEditable: rule.isEditable,
          source: 'master',
        };
      });
      const baseCost = feeDetails
        .filter((fee) => !SERVICE_COMPONENTS.has(fee.componentCode))
        .reduce((sum, fee) => sum + numberValue(fee.amount), 0);
      const serviceFee = feeDetails
        .filter((fee) => SERVICE_COMPONENTS.has(fee.componentCode))
        .reduce((sum, fee) => sum + numberValue(fee.amount), 0);
      const price = baseCost + serviceFee;

      return {
        vehicleId: item.vehicleId,
        serviceTypeId: item.serviceTypeId,
        price,
        baseCost,
        serviceFee,
        feeDetails,
        documentChecklist: documentRequirements.map((doc) => ({
          documentCode: doc.documentCode,
          documentName: doc.documentName,
          isRequired: doc.isRequired,
        })),
        vehicleTypeCode: vehicleType.code,
        provinceCode,
      };
    }));
  }

  static async list(tenantId: string, query: any) {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const where: any = { tenantId };

    if (query.branchId) where.branchId = query.branchId;
    if (query.status) where.status = query.status;
    if (query.start_date || query.end_date) {
      where.createdAt = {};
      if (query.start_date) where.createdAt.gte = new Date(query.start_date);
      if (query.end_date) where.createdAt.lte = new Date(query.end_date);
    }

    // Search by invoice number, plate number, customer name
    if (query.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { items: { some: { vehicle: { plateNumber: { contains: query.search, mode: 'insensitive' } } } } },
      ];
    }

    // Sorting
    const [sortField, sortDir] = (query.sort || 'created_at:desc').split(':');
    const orderBy: any = { [sortField === 'created_at' ? 'createdAt' : sortField]: sortDir || 'desc' };

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where, skip, take: limit, orderBy,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          branch: { select: { id: true, name: true } },
          items: {
            include: {
              vehicle: true,
              serviceType: true,
              feeDetails: { orderBy: { createdAt: 'asc' as const } },
              documentChecklist: { orderBy: { createdAt: 'asc' as const } },
            },
          },
        },
      }),
    ]);

    return { transactions, total, page, limit };
  }

  static async findById(id: string, tenantId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, tenantId }, include: TX_INCLUDE });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
    return tx;
  }

  static async create(tenantId: string, branchId: string, userId: string, data: any) {
    const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });

    const invoiceNumber = await generateInvoiceNumber(tenantId, tenant.code);
    const trackingCode = generateTrackingCode(tenant.code);

    const branch = await TransactionService.resolveBranch(tenantId, data.branchId || branchId);
    const items = await TransactionService.buildTransactionItems(tenantId, data.items);
    const baseCostTotal = items.reduce((sum, item) => sum + item.baseCost, 0);
    const serviceFeeTotal = items.reduce((sum, item) => sum + item.serviceFee, 0);
    const total = items.reduce((sum, item) => sum + item.price, 0);

    const tx = await prisma.$transaction(async (prismaT) => {
      const transaction = await prismaT.transaction.create({
        data: {
          tenantId,
          branchId: branch.id,
          customerId: data.customerId,
          invoiceNumber,
          trackingCode,
          status: 'DRAFT',
          dpAmount: data.dpAmount || 0,
          estimatedFinishDate: data.estimatedFinishDate ? new Date(data.estimatedFinishDate) : null,
          notes: data.notes,
          items: {
            create: items.map(({ feeDetails, documentChecklist, vehicleTypeCode, provinceCode, ...item }) => ({
              ...item,
              tenantId,
              feeDetails: { create: feeDetails },
              documentChecklist: { create: documentChecklist },
            })),
          },
        },
        include: TX_INCLUDE,
      });

      const updated = await prismaT.transaction.update({
        where: { id: transaction.id },
        data: {
          estimatedTotal: total,
          finalTotal: total,
          baseCostTotal,
          serviceFeeTotal,
          remainingAmount: total - Number(data.dpAmount || 0),
        },
        include: TX_INCLUDE,
      });

      await prismaT.transactionLog.create({
        data: { tenantId, transactionId: transaction.id, toStatus: 'DRAFT', createdBy: userId },
      });

      // Record DP payment if provided
      if (data.dpAmount > 0) {
        await prismaT.payment.create({
          data: {
            tenantId,
            transactionId: transaction.id,
            amount: data.dpAmount,
            type: 'DP',
            method: 'CASH',
            notes: 'DP on transaction creation',
          },
        });
      }

      return updated;
    });

    // Queue WhatsApp notification
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (customer?.phone) {
      const trackingUrl = `${process.env.TRACKING_URL || 'http://localhost:3001/tracking'}/${trackingCode}`;
      await enqueueWhatsApp(
        tenantId,
        customer.phone,
        `Halo ${customer.name}, transaksi Anda dengan nomor ${invoiceNumber} telah dibuat. Pantau status: ${trackingUrl}`
      ).catch(() => {});
    }

    const staffUsers = await prisma.user.findMany({
      where: { tenantId, isActive: true, role: { in: ['OWNER', 'ADMIN'] } },
      select: { id: true },
    });
    await sendPushToUsers(
      tenantId,
      staffUsers.map((user) => user.id),
      {
        title: 'Transaksi baru',
        body: `Transaksi ${invoiceNumber} telah dibuat`,
        data: { transactionId: tx.id, invoiceNumber },
      }
    ).catch(() => {});

    return tx;
  }

  static async updateStatus(id: string, tenantId: string, userId: string, toStatus: string, notes?: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, tenantId } });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });

    const allowed = STATUS_TRANSITIONS[tx.status];
    if (!allowed?.includes(toStatus)) {
      throw Object.assign(
        new Error(`Invalid status transition: ${tx.status} → ${toStatus}`),
        { statusCode: 422 }
      );
    }

    const updated = await prisma.$transaction(async (prismaT) => {
      const result = await prismaT.transaction.update({
        where: { id },
        data: { status: toStatus as any },
        include: TX_INCLUDE,
      });

      await prismaT.transactionLog.create({
        data: { tenantId, transactionId: id, fromStatus: tx.status, toStatus, notes, createdBy: userId },
      });

      return result;
    });

    // Queue WhatsApp for ready_to_pickup
    if (toStatus === 'READY_TO_PICKUP') {
      const customer = await prisma.customer.findUnique({ where: { id: tx.customerId } });
      if (customer?.phone) {
        await enqueueWhatsApp(
          tenantId,
          customer.phone,
          `Halo ${customer.name}, dokumen Anda untuk ${tx.invoiceNumber} sudah siap diambil!`
        ).catch(() => {});
      }
    }

    return updated;
  }

  static async finalize(id: string, tenantId: string, userId: string, finalTotal: number, notes?: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, tenantId } });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });

    const dpPaid = Number(tx.dpAmount);
    let refundAmount = 0;
    let remainingAmount = finalTotal - dpPaid;

    if (finalTotal < dpPaid) {
      refundAmount = dpPaid - finalTotal;
      remainingAmount = 0;
    }

    return prisma.$transaction(async (prismaT) => {
      const result = await prismaT.transaction.update({
        where: { id },
        data: { finalTotal, remainingAmount, refundAmount, notes },
        include: TX_INCLUDE,
      });

      await prismaT.auditLog.create({
        data: {
          tenantId,
          action: 'FINALIZE',
          entity: 'transaction',
          entityId: id,
          before: { finalTotal: tx.finalTotal, remainingAmount: tx.remainingAmount },
          after: { finalTotal, remainingAmount, refundAmount },
          createdBy: userId,
        },
      });

      return result;
    });
  }

  static async close(id: string, tenantId: string, userId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, tenantId } });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });

    if (tx.status !== 'COMPLETED') {
      throw Object.assign(new Error('Transaction must be COMPLETED before closing'), { statusCode: 422 });
    }

    if (Number(tx.remainingAmount) > 0) {
      throw Object.assign(new Error('Customer must fully pay remaining balance before closing'), { statusCode: 422 });
    }

    return prisma.$transaction(async (prismaT) => {
      const result = await prismaT.transaction.update({
        where: { id },
        data: { status: 'CLOSED' },
        include: TX_INCLUDE,
      });

      await prismaT.transactionLog.create({
        data: { tenantId, transactionId: id, fromStatus: 'COMPLETED', toStatus: 'CLOSED', createdBy: userId },
      });

      return result;
    });
  }

  static async updateDocumentChecklist(
    id: string,
    checklistId: string,
    tenantId: string,
    userId: string,
    isChecked: boolean,
    notes?: string
  ) {
    const checklist = await prisma.transactionItemDocumentChecklist.findFirst({
      where: {
        id: checklistId,
        transactionItem: { transaction: { id, tenantId } },
      },
    });
    if (!checklist) throw Object.assign(new Error('Document checklist not found'), { statusCode: 404 });

    await prisma.transactionItemDocumentChecklist.update({
      where: { id: checklistId },
      data: {
        isChecked,
        checkedAt: isChecked ? new Date() : null,
        checkedBy: isChecked ? userId : null,
        notes,
      },
    });

    return TransactionService.findById(id, tenantId);
  }

  static async getInvoicePath(id: string, tenantId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, tenantId } });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
    if (tx.status === 'DRAFT') throw Object.assign(new Error('Invoice not available for DRAFT transactions'), { statusCode: 403 });
    return tx.invoicePath;
  }
}

