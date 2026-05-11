import prisma from '../../config/prisma';

export class TransactionService {
  static async create(tenantId: string, branchId: string, data: any) {
    const { customerId, items, dpAmount, estimatedFinishDate } = data;

    // Generate Invoice Number: INV/CODE/YYYY/MM/XXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // In a real system, we would use a sequence table.
    // For this implementation, we count transactions in current month for this tenant.
    const monthStart = new Date(year, now.getMonth(), 1);
    const count = await prisma.transaction.count({
      where: {
        tenantId,
        createdAt: { gte: monthStart }
      }
    });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const sequence = String(count + 1).padStart(4, '0');
    const invoiceNumber = `INV/${tenant?.code}/${year}/${month}/${sequence}`;
    const trackingCode = `TRX-${tenant?.code}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          branchId,
          customerId,
          invoiceNumber,
          trackingCode,
          status: 'ON_PROCESS', // Start directly as process for speed
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
        include: { items: true }
      });

      // Update totals
      const total = transaction.items.reduce((sum, item) => sum + Number(item.price), 0);
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          estimatedTotal: total,
          finalTotal: total,
          remainingAmount: total - Number(dpAmount)
        }
      });

      return transaction;
    });
  }

  static async updateStatus(id: string, tenantId: string, toStatus: string, notes?: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, tenantId }
    });

    if (!transaction) throw new Error('Transaction not found');

    // Simple state machine check
    const validTransitions: any = {
      'DRAFT': ['ON_PROCESS'],
      'ON_PROCESS': ['READY_TO_PICKUP'],
      'READY_TO_PICKUP': ['COMPLETED'],
      'COMPLETED': ['CLOSED']
    };

    if (transaction.status !== 'DRAFT' && !validTransitions[transaction.status]?.includes(toStatus)) {
      throw new Error(`Invalid transition from ${transaction.status} to ${toStatus}`);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: { status: toStatus }
      });

      await tx.transactionLog.create({
        data: {
          transactionId: id,
          fromStatus: transaction.status,
          toStatus,
          notes
        }
      });

      // Logic for CLOSED (final payment)
      if (toStatus === 'CLOSED') {
        await tx.transaction.update({
          where: { id },
          data: { remainingAmount: 0 }
        });
      }

      return updated;
    });
  }
}
