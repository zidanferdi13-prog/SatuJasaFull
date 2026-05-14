import prisma from '../../config/prisma';

export class ServiceTypeService {
  static async list(tenantId: string) {
    // Return global service types (tenantId = null) + tenant-specific ones
    return prisma.serviceType.findMany({
      where: {
        OR: [{ tenantId: null }, { tenantId }],
        isActive: true,
      },
      orderBy: { name: 'asc' },
      include: {
        pricingRules: {
          where: { tenantId },
          select: { id: true, price: true, marginAmount: true, isActive: true },
        },
      },
    });
  }

  static async create(data: { name: string; description?: string }) {
    // Only SUPER_ADMIN creates global service types (tenantId = null)
    return prisma.serviceType.create({ data: { ...data, tenantId: null } });
  }

  static async update(id: string, data: { name?: string; description?: string }) {
    const st = await prisma.serviceType.findUnique({ where: { id } });
    if (!st) throw Object.assign(new Error('Service type not found'), { statusCode: 404 });
    return prisma.serviceType.update({ where: { id }, data });
  }

  static async updateStatus(id: string, isActive: boolean) {
    const st = await prisma.serviceType.findUnique({ where: { id } });
    if (!st) throw Object.assign(new Error('Service type not found'), { statusCode: 404 });
    return prisma.serviceType.update({ where: { id }, data: { isActive } });
  }
}
