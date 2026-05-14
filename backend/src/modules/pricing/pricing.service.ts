import prisma from '../../config/prisma';

export class PricingService {
  static async list(tenantId: string) {
    return prisma.pricingRule.findMany({
      where: { tenantId },
      include: { serviceType: { select: { id: true, name: true, isActive: true } } },
      orderBy: { serviceType: { name: 'asc' } },
    });
  }

  static async create(tenantId: string, data: { serviceTypeId: string; price: number; marginAmount?: number }) {
    return prisma.pricingRule.create({
      data: { tenantId, ...data },
      include: { serviceType: true },
    });
  }

  static async update(id: string, tenantId: string, data: any) {
    const rule = await prisma.pricingRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw Object.assign(new Error('Pricing rule not found'), { statusCode: 404 });
    return prisma.pricingRule.update({ where: { id }, data });
  }
}
