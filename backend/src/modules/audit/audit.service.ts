import prisma from '../../config/prisma';
import { getPagination } from '../../shared/utils/pagination';

export class AuditService {
  static async list(tenantId: string, role: string, query: any) {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const where: any = {};

    if (role !== 'SUPER_ADMIN') where.tenantId = tenantId;
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return { logs, total, page, limit };
  }
}
