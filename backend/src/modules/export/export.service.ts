import prisma from '../../config/prisma';

export class ExportService {
  static async getTransactionData(tenantId: string, role: string, query: any) {
    const where: any = {};
    if (role !== 'SUPER_ADMIN') where.tenantId = tenantId;
    else if (query.tenant_id) where.tenantId = query.tenant_id;

    if (query.branch_id) where.branchId = query.branch_id;
    if (query.status) where.status = query.status;
    if (query.start_date || query.end_date) {
      where.createdAt = {};
      if (query.start_date) where.createdAt.gte = new Date(query.start_date);
      if (query.end_date) where.createdAt.lte = new Date(query.end_date);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        tenant: { select: { name: true, code: true } },
        branch: { select: { name: true } },
        customer: { select: { name: true } },
        items: { include: { vehicle: true, serviceType: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((tx) => ({
      date: tx.createdAt.toISOString().split('T')[0],
      invoice_number: tx.invoiceNumber,
      tenant: tx.tenant?.name || '',
      branch: tx.branch?.name || '',
      customer: tx.customer?.name || '',
      plate_numbers: tx.items.map((i) => i.vehicle?.plateNumber).join(', '),
      service_types: tx.items.map((i) => i.serviceType?.name).join(', '),
      estimated_total: Number(tx.estimatedTotal),
      final_total: Number(tx.finalTotal),
      dp: Number(tx.dpAmount),
      remaining: Number(tx.remainingAmount),
      refund: Number(tx.refundAmount),
      profit: Number(tx.finalTotal) - Number(tx.estimatedTotal) + Number(tx.refundAmount),
      status: tx.status,
    }));
  }

  static async getRevenueData(tenantId: string, role: string, query: any) {
    const where: any = { status: 'CLOSED' };
    if (role !== 'SUPER_ADMIN') where.tenantId = tenantId;
    if (query.start_date || query.end_date) {
      where.updatedAt = {};
      if (query.start_date) where.updatedAt.gte = new Date(query.start_date);
      if (query.end_date) where.updatedAt.lte = new Date(query.end_date);
    }

    const result = await prisma.transaction.aggregate({
      where,
      _sum: { finalTotal: true, dpAmount: true, refundAmount: true },
      _count: true,
    });

    return {
      totalRevenue: Number(result._sum.finalTotal || 0),
      totalDp: Number(result._sum.dpAmount || 0),
      totalRefund: Number(result._sum.refundAmount || 0),
      transactionCount: result._count,
    };
  }
}
