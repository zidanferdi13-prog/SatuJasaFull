import prisma from '../../config/prisma';

export class DashboardService {
  static async getTenantKpis(tenantId: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const filter: any = { tenantId };
    if (branchId) filter.branchId = branchId;

    const [revenueToday, monthlyRevenue, totalRefund, activeTrx, readyPickup, closedToday, overdue] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: { ...filter, status: 'CLOSED', updatedAt: { gte: today } },
          _sum: { serviceFeeTotal: true },
        }),
        prisma.transaction.aggregate({
          where: { ...filter, status: 'CLOSED', updatedAt: { gte: monthStart } },
          _sum: { serviceFeeTotal: true },
        }),
        prisma.transaction.aggregate({
          where: { ...filter, refundAmount: { gt: 0 } },
          _sum: { refundAmount: true },
        }),
        prisma.transaction.count({
          where: { ...filter, status: { in: ['ON_PROCESS', 'READY_TO_PICKUP', 'COMPLETED'] } },
        }),
        prisma.transaction.count({ where: { ...filter, status: 'READY_TO_PICKUP' } }),
        prisma.transaction.count({ where: { ...filter, status: 'CLOSED', updatedAt: { gte: today } } }),
        prisma.transaction.count({
          where: {
            ...filter,
            status: { in: ['ON_PROCESS', 'READY_TO_PICKUP'] },
            estimatedFinishDate: { lt: new Date() },
          },
        }),
      ]);

    return {
      revenueToday: Number(revenueToday._sum.serviceFeeTotal || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.serviceFeeTotal || 0),
      totalRefund: Number(totalRefund._sum.refundAmount || 0),
      activeTransactions: activeTrx,
      readyPickupCount: readyPickup,
      closedToday,
      overdueTransactions: overdue,
    };
  }

  static async getBranchKpis(tenantId: string, branchId: string) {
    return this.getTenantKpis(tenantId, branchId);
  }

  static async getAdminKpis() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalTenants, activeTenants, expiredSubscriptions, totalTransactions, monthRevenue, queuePending] =
      await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { subscriptionStatus: 'ACTIVE' } }),
        prisma.tenant.count({
          where: { OR: [{ subscriptionStatus: 'EXPIRED' }, { subscriptionEnd: { lt: now } }] },
        }),
        prisma.transaction.count(),
        prisma.transaction.aggregate({
          where: { status: 'CLOSED', updatedAt: { gte: monthStart } },
          _sum: { serviceFeeTotal: true },
        }),
        prisma.whatsappQueue.count({ where: { status: 'PENDING' } }),
      ]);

    return {
      totalTenants,
      activeTenants,
      expiredSubscriptions,
      totalTransactions,
      platformMonthlyRevenue: Number(monthRevenue._sum.serviceFeeTotal || 0),
      whatsappQueuePending: queuePending,
    };
  }
}

