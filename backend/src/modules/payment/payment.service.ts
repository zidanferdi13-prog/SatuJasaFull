import prisma from '../../config/prisma';

export class PaymentService {
  static async list(transactionId: string, tenantId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id: transactionId, tenantId } });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });

    return prisma.payment.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async create(transactionId: string, tenantId: string, data: any) {
    const tx = await prisma.transaction.findFirst({
      where: { id: transactionId, tenantId },
      include: { payments: true },
    });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });

    if (tx.status === 'CLOSED') {
      throw Object.assign(new Error('Cannot add payment to a closed transaction'), { statusCode: 422 });
    }

    // Validate payment type & amount
    if (data.type === 'FINAL_PAYMENT') {
      if (Number(tx.remainingAmount) <= 0) {
        throw Object.assign(new Error('Transaction is already fully paid'), { statusCode: 422 });
      }
      if (data.amount > Number(tx.remainingAmount)) {
        throw Object.assign(new Error('Payment amount exceeds remaining balance'), { statusCode: 422 });
      }
    }

    if (data.type === 'REFUND') {
      if (Number(tx.refundAmount) <= 0) {
        throw Object.assign(new Error('No refund available for this transaction'), { statusCode: 422 });
      }
    }

    return prisma.$transaction(async (prismaT) => {
      const payment = await prismaT.payment.create({
        data: { transactionId, ...data },
      });

      // Update remaining amount
      if (data.type === 'FINAL_PAYMENT') {
        const newRemaining = Math.max(0, Number(tx.remainingAmount) - data.amount);
        await prismaT.transaction.update({
          where: { id: transactionId },
          data: { remainingAmount: newRemaining },
        });
      }

      return payment;
    });
  }
}
