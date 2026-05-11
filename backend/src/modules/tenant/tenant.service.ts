import prisma from '../../config/prisma';

export class TenantService {
  static async listAll() {
    return await prisma.tenant.findMany({
      include: {
        _count: {
          select: { transactions: true, users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateSubscription(id: string, subEnd: string, status?: string) {
    return await prisma.tenant.update({
      where: { id },
      data: {
        subscriptionEnd: new Date(subEnd),
        status: status || undefined
      }
    });
  }
}
