import prisma from '../../config/prisma';
import { getPagination } from '../../shared/utils/pagination';
import { generateInvoiceNumber, generateTrackingCode } from '../../shared/utils/invoice';
import { STATUS_TRANSITIONS } from '../../shared/constants';
import { enqueueWhatsApp } from '../../shared/services/whatsapp.service';

const TX_INCLUDE = {
  customer: { select: { id: true, name: true, phone: true } },
  branch: { select: { id: true, name: true } },
  items: {
    include: {
      vehicle: { select: { id: true, plateNumber: true, brand: true, model: true } },
      serviceType: { select: { id: true, name: true } },
    },
  },
  payments: { orderBy: { createdAt: 'asc' as const } },
  logs: { orderBy: { createdAt: 'asc' as const } },
};

export class TransactionService {
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
          items: { include: { vehicle: true, serviceType: true } },
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

    const effectiveBranchId = data.branchId || branchId;
    if (!effectiveBranchId) {
      throw Object.assign(new Error('Branch ID required'), { statusCode: 400 });
    }

    const tx = await prisma.$transaction(async (prismaT) => {
      const transaction = await prismaT.transaction.create({
        data: {
          tenantId,
          branchId: effectiveBranchId,
          customerId: data.customerId,
          invoiceNumber,
          trackingCode,
          status: 'DRAFT',
          dpAmount: data.dpAmount || 0,
          estimatedFinishDate: data.estimatedFinishDate ? new Date(data.estimatedFinishDate) : null,
          notes: data.notes,
          items: {
            create: data.items.map((item: any) => ({
              vehicleId: item.vehicleId,
              serviceTypeId: item.serviceTypeId,
              price: item.price,
            })),
          },
        },
        include: TX_INCLUDE,
      });

      const total = transaction.items.reduce((sum: number, i: any) => sum + Number(i.price), 0);
      const updated = await prismaT.transaction.update({
        where: { id: transaction.id },
        data: {
          estimatedTotal: total,
          finalTotal: total,
          remainingAmount: total - Number(data.dpAmount || 0),
        },
        include: TX_INCLUDE,
      });

      await prismaT.transactionLog.create({
        data: { transactionId: transaction.id, toStatus: 'DRAFT', createdBy: userId },
      });

      // Record DP payment if provided
      if (data.dpAmount > 0) {
        await prismaT.payment.create({
          data: {
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
        data: { transactionId: id, fromStatus: tx.status, toStatus, notes, createdBy: userId },
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
        data: { transactionId: id, fromStatus: 'COMPLETED', toStatus: 'CLOSED', createdBy: userId },
      });

      return result;
    });
  }

  static async getInvoicePath(id: string, tenantId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, tenantId } });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
    if (tx.status === 'DRAFT') throw Object.assign(new Error('Invoice not available for DRAFT transactions'), { statusCode: 403 });
    return tx.invoicePath;
  }
}

