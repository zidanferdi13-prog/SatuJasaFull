import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { LoginResult } from './auth.types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const buildPayload = (user: any, tenant: any) => ({
  user_id: user.id,
  tenant_id: user.tenantId,
  branch_id: user.branchId || '',
  role: user.role,
  tenant_code: tenant.code,
});

const signTokens = (payload: object) => ({
  accessToken: jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES as any }),
  refreshToken: jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES as any }),
  expiresIn: ACCESS_EXPIRES,
});

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResult> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    if (user.role !== 'SUPER_ADMIN') {
      const now = new Date();
      if (
        user.tenant.subscriptionStatus !== 'ACTIVE' ||
        user.tenant.subscriptionEnd < now
      ) {
        throw Object.assign(
          new Error('Tenant subscription expired or suspended'),
          { statusCode: 402 }
        );
      }
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const payload = buildPayload(user, user.tenant);
    const tokens = signTokens(payload);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantCode: user.tenant.code,
        tenantName: user.tenant.name,
        branchId: user.branchId,
      },
    };
  }

  static async refresh(refreshToken: string): Promise<LoginResult> {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });
    }

    const payload = buildPayload(user, user.tenant);
    const tokens = signTokens(payload);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantCode: user.tenant.code,
        tenantName: user.tenant.name,
        branchId: user.branchId,
      },
    };
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        branchId: true,
        isActive: true,
        lastLoginAt: true,
        tenant: { select: { id: true, code: true, name: true, logoUrl: true, subscriptionStatus: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  }

  static async registerTenant(data: {
    name: string;
    code: string;
    phone?: string;
    address?: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
    subscriptionMonths: number;
    planName: string;
    planPrice: number;
  }) {
    console.log('Registering tenant with data:', data);
    const hash = await bcrypt.hash(data.ownerPassword, 12);
    const subStart = new Date();
    const subEnd = new Date();
    subEnd.setMonth(subEnd.getMonth() + data.subscriptionMonths);

    return prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          code: data.code.toUpperCase(),
          phone: data.phone,
          address: data.address,
          subscriptionStart: subStart,
          subscriptionEnd: subEnd,
          subscriptionStatus: 'ACTIVE',
        },
      });

      const owner = await tx.user.create({
        data: {
          name: data.ownerName,
          email: data.ownerEmail,
          passwordHash: hash,
          role: 'OWNER',
          tenantId: tenant.id,
        },
      });

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planName: data.planName,
          startDate: subStart,
          endDate: subEnd,
          price: data.planPrice,
          status: 'ACTIVE',
        },
      });

      return { tenant, owner: { id: owner.id, name: owner.name, email: owner.email } };
    });
  }
}

