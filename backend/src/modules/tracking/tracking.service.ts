import prisma from '../../config/prisma';

export class TrackingService {
  static async getByTrackingCode(trackingCode: string) {
    const tx = await prisma.transaction.findUnique({
      where: { trackingCode },
      include: {
        tenant: { select: { name: true, logoUrl: true, code: true } },
        branch: { select: { name: true, address: true, phone: true } },
        customer: { select: { name: true } },
        items: {
          include: {
            serviceType: { select: { name: true } },
            vehicle: { select: { plateNumber: true, model: true, brand: true } },
          },
        },
        payments: {
          select: { amount: true, type: true, method: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
        logs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!tx) return null;

    // Public response — never expose internal tenant_id
    return {
      invoiceNumber: tx.invoiceNumber,
      trackingCode: tx.trackingCode,
      status: tx.status,
      estimatedFinishDate: tx.estimatedFinishDate,
      estimatedTotal: tx.estimatedTotal,
      dpAmount: tx.dpAmount,
      remainingAmount: tx.remainingAmount,
      refundAmount: tx.refundAmount,
      finalTotal: tx.finalTotal,
      createdAt: tx.createdAt,
      tenant: tx.tenant,
      branch: tx.branch,
      customer: tx.customer,
      items: tx.items.map((item) => ({
        vehicle: item.vehicle,
        serviceType: item.serviceType,
        price: item.price,
      })),
      payments: tx.payments,
      timeline: tx.logs.map((log) => ({
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        notes: log.notes,
        createdAt: log.createdAt,
      })),
    };
  }
}

