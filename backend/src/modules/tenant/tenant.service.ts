import prisma from '../../config/prisma';
import { env } from '../../config/env';
import { getPagination } from '../../shared/utils/pagination';
import path from 'path';
import fs from 'fs';

export class TenantService {
  static async listAll(query: any) {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const search = query.search as string | undefined;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, tenants] = await Promise.all([
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({
        where,
        select: {
          id: true, code: true, name: true, logoUrl: true, phone: true, address: true,
          subscriptionStart: true, subscriptionEnd: true, subscriptionStatus: true, isActive: true,
          createdAt: true,
          _count: { select: { branches: true, users: true, transactions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { tenants, total, page, limit };
  }

  static async findById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        branches: { select: { id: true, name: true, isActive: true } },
        _count: { select: { users: true, transactions: true } },
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { statusCode: 404 });
    return tenant;
  }

  static async findOwnTenant(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        logoUrl: true,
        phone: true,
        address: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        subscriptionStatus: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { statusCode: 404 });
    return tenant;
  }

  static async update(id: string, data: { name?: string; phone?: string; address?: string }) {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { statusCode: 404 });
    return prisma.tenant.update({ where: { id }, data });
  }

  static async updateStatus(
    id: string,
    data: { subscriptionStatus?: string; subscriptionEnd?: string; isActive?: boolean }
  ) {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { statusCode: 404 });

    const updateData: any = {};
    if (data.subscriptionStatus) updateData.subscriptionStatus = data.subscriptionStatus;
    if (data.subscriptionEnd) updateData.subscriptionEnd = new Date(data.subscriptionEnd);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.tenant.update({ where: { id }, data: updateData });
  }

  static async impersonate(tenantId: string, adminUserId: string) {
    const jwt = await import('jsonwebtoken');
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { statusCode: 404 });

    const owner = await prisma.user.findFirst({
      where: { tenantId, role: 'OWNER' },
    });
    if (!owner) throw Object.assign(new Error('Tenant owner not found'), { statusCode: 404 });

    const payload = {
      user_id: owner.id,
      tenant_id: tenantId,
      branch_id: '',
      role: 'OWNER',
      tenant_code: tenant.code,
      impersonated_by: adminUserId,
    };

    const token = jwt.default.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '1h' } as any);

    return { accessToken: token, tenant: { id: tenant.id, name: tenant.name, code: tenant.code } };
  }

  static async resetOwnerPassword(tenantId: string, newPassword: string) {
    const bcrypt = await import('bcryptjs');
    const owner = await prisma.user.findFirst({ where: { tenantId, role: 'OWNER' } });
    if (!owner) throw Object.assign(new Error('Tenant owner not found'), { statusCode: 404 });
    const hash = await bcrypt.default.hash(newPassword, 12);
    await prisma.user.update({ where: { id: owner.id }, data: { passwordHash: hash } });
    return { success: true };
  }

  static async uploadLogo(tenantId: string, filePath: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { statusCode: 404 });

    // Remove old logo if exists
    if (tenant.logoUrl) {
      const oldPath = path.join(process.cwd(), tenant.logoUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl: filePath },
    });
  }
}

