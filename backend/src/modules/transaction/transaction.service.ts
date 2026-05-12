import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';

export class TransactionService {
  static async create(tenantId: string, branchId: string, data: any) {
    const { customerId, items, dpAmount, estimatedFinishDate } = data;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const monthStart = new Date(year, now.getMonth(), 1);
    const count = await prisma.transaction.count({
      where: { tenantId, createdAt: { gte: monthStart } }
    });

    const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    const seq = String(count + 1).padStart(4, '0');
    const invoiceNumber = `INV/${tenant.code}/${year}/${month}/${seq}`;
    const trackingCode = `TRX-${tenant.code}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const trx = await tx.transaction.create({
        data: {
          tenantId,
          branchId,
          customerId,
          invoiceNumber,
          trackingCode,
          status: 'ON_PROCESS',
          dpAmount,
          estimatedFinishDate: estimatedFinishDate ? new Date(estimatedFinishDate) : null,
          items: {
            create: items.map((item: any) => ({
              vehicleId: item.vehicleId,
              serviceId: item.serviceId,
              price: item.price
            }))
          }
        },
        include: { items: { include: { service: true, vehicle: true } } }
      });

      const total = trx.items.reduce((s: number, i: any) => s + Number(i.price), 0);
      await tx.transaction.update({
        where: { id: trx.id },
        data: {
          estimatedTotal: total,
          finalTotal: total,
          remainingAmount: total - Number(dpAmount)
        }
      });

      return tx.transaction.findUnique({
        where: { id: trx.id },
        include: { items: { include: { service: true, vehicle: true } }, customer: true }
      });
    });
  }

  static async updateStatus(id: string, tenantId: string, toStatus: string, notes?: string) {
    const trx = await prisma.transaction.findFirst({ where: { id, tenantId } });
    if (!trx) throw new Error('Transaction not found');

    const transitions: Record<string, string[]> = {
      DRAFT: ['ON_PROCESS'],
      ON_PROCESS: ['READY_TO_PICKUP'],
      READY_TO_PICKUP: ['COMPLETED'],
      COMPLETED: ['CLOSED']
    };

    if (!transitions[trx.status]?.includes(toStatus)) {
      throw new Error(`Invalid transition: ${trx.status} -> ${toStatus}`);
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.transaction.update({ where: { id }, data: { status: toStatus } });
      await tx.transactionLog.create({
        data: { transactionId: id, fromStatus: trx.status, toStatus, notes }
      });

      if (toStatus === 'CLOSED') {
        await tx.transaction.update({ where: { id }, data: { remainingAmount: 0 } });
      }

      return updated;
    });
  }

  static async list(tenantId: string, branchId?: string) {
    return prisma.transaction.findMany({
      where: { tenantId, branchId: branchId || undefined },
      include: { customer: true, items: { include: { service: true, vehicle: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
