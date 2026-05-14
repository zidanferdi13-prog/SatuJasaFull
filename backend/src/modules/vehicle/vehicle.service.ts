import prisma from '../../config/prisma';
import { getPagination } from '../../shared/utils/pagination';

export class VehicleService {
  static async list(tenantId: string, query: any) {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const search = query.search as string | undefined;

    const where: any = { customer: { tenantId } };
    if (search) {
      where.OR = [{ plateNumber: { contains: search, mode: 'insensitive' } }];
    }
    if (query.customerId) where.customerId = query.customerId;

    const [total, vehicles] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where, skip, take: limit,
        orderBy: { plateNumber: 'asc' },
        include: { customer: { select: { id: true, name: true, phone: true } } },
      }),
    ]);

    return { vehicles, total, page, limit };
  }

  static async findById(id: string, tenantId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, customer: { tenantId } },
      include: { customer: true },
    });
    if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { statusCode: 404 });
    return vehicle;
  }

  static async create(tenantId: string, data: any) {
    // Verify customer belongs to tenant
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, tenantId },
    });
    if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    return prisma.vehicle.create({ data });
  }

  static async update(id: string, tenantId: string, data: any) {
    await this.findById(id, tenantId);
    return prisma.vehicle.update({ where: { id }, data });
  }
}
