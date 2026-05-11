import prisma from '../../config/prisma';

export class DashboardService {
  static async getTenantKpis(tenantId: string, branchId?: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenueToday, activeTrx, readyPickup, totalMonth] = await Promise.all([
      // Revenue Today (Closed transactions today)
      prisma.transaction.aggregate({
        where: {
          tenantId,
          branchId: branchId || undefined,
          status: 'CLOSED',
          updatedAt: { gte: startOfDay }
        },
        _sum: { finalTotal: true }
      }),
      // Active Transactions
      prisma.transaction.count({
        where: {
          tenantId,
          branchId: branchId || undefined,
          status: { in: ['ON_PROCESS', 'READY_TO_PICKUP'] }
        }
      }),
      // Ready for Pickup
      prisma.transaction.count({
        where: {
          tenantId,
          branchId: branchId || undefined,
          status: 'READY_TO_PICKUP'
        }
      }),
      // Monthly Revenue
      prisma.transaction.aggregate({
        where: {
          tenantId,
          branchId: branchId || undefined,
          status: 'CLOSED',
          updatedAt: { gte: startOfMonth }
        },
        _sum: { finalTotal: true }
      })
    ]);

    return {
      revenueToday: Number(revenueToday._sum.finalTotal || 0),
      activeTransactions: activeTrx,
      readyPickupCount: readyPickup,
      monthlyRevenue: Number(totalMonth._sum.finalTotal || 0)
    };
  }
}
