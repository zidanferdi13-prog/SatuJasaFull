import prisma from '../../config/prisma';
import { getPagination } from '../../shared/utils/pagination';

export class CustomerService {
  static async list(tenantId: string, query: any) {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const search = query.search as string | undefined;

    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where, skip, take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { vehicles: true, transactions: true } } },
      }),
    ]);

    return { customers, total, page, limit };
  }

  static async findById(id: string, tenantId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        vehicles: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, invoiceNumber: true, status: true, estimatedTotal: true, createdAt: true },
        },
      },
    });
    if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    return customer;
  }

  static async create(tenantId: string, data: any) {
    return prisma.customer.create({ data: { ...data, tenantId } });
  }

  static async update(id: string, tenantId: string, data: any) {
    const customer = await prisma.customer.findFirst({ where: { id, tenantId } });
    if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    return prisma.customer.update({ where: { id }, data });
  }
}
