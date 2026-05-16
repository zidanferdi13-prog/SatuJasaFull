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
    const price = data.marginAmount ?? data.price;

    return prisma.pricingRule.create({
      data: { tenantId, ...data, price, marginAmount: price },
      include: { serviceType: true },
    });
  }

  static async update(id: string, tenantId: string, data: { price?: number; marginAmount?: number; isActive?: boolean }) {
    const rule = await prisma.pricingRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw Object.assign(new Error('Pricing rule not found'), { statusCode: 404 });

    const price = data.marginAmount ?? data.price;
    const payload = price === undefined ? data : { ...data, price, marginAmount: price };

    return prisma.pricingRule.update({ where: { id }, data: payload });
  }
}
