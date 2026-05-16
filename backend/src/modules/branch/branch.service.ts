import prisma from '../../config/prisma';
import { getPagination } from '../../shared/utils/pagination';

export class BranchService {
  static async list(tenantId: string, query: any) {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const where: any = { tenantId };
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [total, branches] = await Promise.all([
      prisma.branch.count({ where }),
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { users: true, transactions: true } } },
      }),
    ]);

    return { branches, total, page, limit };
  }

  static async findById(id: string, tenantId: string) {
    const branch = await prisma.branch.findFirst({ where: { id, tenantId } });
    if (!branch) throw Object.assign(new Error('Branch not found'), { statusCode: 404 });
    return branch;
  }

  static async create(tenantId: string, data: { name: string; address?: string; phone?: string }) {
    return prisma.branch.create({ data: { ...data, tenantId } });
  }

  static async getOrCreateDefault(tenantId: string) {
    const existing = await prisma.branch.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (existing) return existing;

    const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    return prisma.branch.create({
      data: {
        tenantId,
        name: tenant.name || 'Utama',
        address: tenant.address,
        phone: tenant.phone,
        isActive: true,
      },
    });
  }

  static async update(id: string, tenantId: string, data: any) {
    await this.findById(id, tenantId);
    return prisma.branch.update({ where: { id }, data });
  }

  static async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    const txCount = await prisma.transaction.count({ where: { branchId: id } });
    if (txCount > 0) {
      // Soft delete only
      return prisma.branch.update({ where: { id }, data: { isActive: false } });
    }
    return prisma.branch.delete({ where: { id } });
  }
}
