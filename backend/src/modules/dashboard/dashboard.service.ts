import prisma from '../../config/prisma';

export class DashboardService {
  static async getTenantKpis(tenantId: string, branchId?: string) {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const filter = {
      tenantId,
      branchId: branchId || undefined
    };

    const [revenueToday, activeTrx, readyPickup, totalMonth] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...filter, status: 'CLOSED', updatedAt: { gte: startOfDay } },
        _sum: { finalTotal: true }
      }),
      prisma.transaction.count({
        where: { ...filter, status: { in: ['ON_PROCESS', 'READY_TO_PICKUP'] } }
      }),
      prisma.transaction.count({
        where: { ...filter, status: 'READY_TO_PICKUP' }
      }),
      prisma.transaction.aggregate({
        where: { ...filter, status: 'CLOSED', updatedAt: { gte: startOfMonth } },
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

  static async getAdminKpis() {
    const [totalTenants, activeTenants, totalTransactions, expired] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count(),
      prisma.tenant.count({ where: { subscriptionEnd: { lt: new Date() } } })
    ]);

    return { totalTenants, activeTenants, totalTransactions, expiredSubscriptions: expired };
  }
}
