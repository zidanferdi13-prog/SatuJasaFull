import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma';
import { env } from '../../config/env';
import logger from '../../shared/logger';
import { BranchService } from '../branch/branch.service';
import { LoginResult } from './auth.types';

const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = env.JWT_ACCESS_EXPIRES_IN;
const REFRESH_EXPIRES = env.JWT_REFRESH_EXPIRES_IN;

const buildPayload = (user: any, tenant: any) => ({
  user_id: user.id,
  tenant_id: user.tenantId,
  branch_id: user.branchId || '',
  role: user.role,
  tenant_code: tenant.code,
});

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const getJwtExpiry = (token: string) => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) throw new Error('Token expiry is missing');
  return new Date(decoded.exp * 1000);
};

const signTokens = (payload: object, family = uuidv4()) => ({
  accessToken: jwt.sign({ ...payload, jti: uuidv4() }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES as any }),
  refreshToken: jwt.sign({ ...payload, jti: uuidv4(), family }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES as any }),
  expiresIn: ACCESS_EXPIRES,
  family,
});

const persistRefreshSession = async (
  userId: string,
  tenantId: string,
  refreshToken: string,
  family: string,
  meta?: { ipAddress?: string; userAgent?: string }
) => prisma.refreshTokenSession.create({
  data: {
    userId,
    tenantId,
    tokenHash: hashToken(refreshToken),
    family,
    expiresAt: getJwtExpiry(refreshToken),
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  },
});

export class AuthService {
  static async login(
    email: string,
    password: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<LoginResult> {
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

    let branchId = user.branchId;
    if (user.role !== 'SUPER_ADMIN' && !branchId) {
      const branch = await BranchService.getOrCreateDefault(user.tenantId);
      branchId = branch.id;
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), branchId } });

    const userWithBranch = { ...user, branchId };
    const payload = buildPayload(userWithBranch, user.tenant);
    const { accessToken, refreshToken, expiresIn, family } = signTokens(payload);
    await persistRefreshSession(user.id, user.tenantId, refreshToken, family, meta);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantCode: user.tenant.code,
        tenantName: user.tenant.name,
        branchId,
      },
    };
  }

  static async refresh(
    refreshToken: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<LoginResult> {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    const tokenHash = hashToken(refreshToken);
    const session = await prisma.refreshTokenSession.findUnique({ where: { tokenHash } });

    if (!session) {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    if (session.revokedAt) {
      await prisma.refreshTokenSession.updateMany({
        where: { family: session.family, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw Object.assign(new Error('Refresh token reuse detected'), { statusCode: 401 });
    }

    if (session.expiresAt < new Date()) {
      await prisma.refreshTokenSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw Object.assign(new Error('Refresh token expired'), { statusCode: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });
    }

    let branchId = user.branchId;
    if (user.role !== 'SUPER_ADMIN' && !branchId) {
      const branch = await BranchService.getOrCreateDefault(user.tenantId);
      branchId = branch.id;
      await prisma.user.update({ where: { id: user.id }, data: { branchId } });
    }

    const userWithBranch = { ...user, branchId };
    const payload = buildPayload(userWithBranch, user.tenant);
    const { accessToken, refreshToken: nextRefreshToken, expiresIn, family } = signTokens(payload, session.family);
    const nextSession = await persistRefreshSession(user.id, user.tenantId, nextRefreshToken, family, meta);
    await prisma.refreshTokenSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), replacedById: nextSession.id },
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      expiresIn,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantCode: user.tenant.code,
        tenantName: user.tenant.name,
        branchId,
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
        tenant: {
          select: {
            id: true,
            code: true,
            name: true,
            logoUrl: true,
            subscriptionStart: true,
            subscriptionEnd: true,
            subscriptionStatus: true,
            isActive: true,
            subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  }

  static async subscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tenant: {
          select: {
            id: true,
            code: true,
            name: true,
            logoUrl: true,
            subscriptionStart: true,
            subscriptionEnd: true,
            subscriptionStatus: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!user?.tenant) throw Object.assign(new Error('Tenant subscription not found'), { statusCode: 404 });
    return user.tenant;
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
    logger.info('Registering tenant', {
      code: data.code,
      name: data.name,
      ownerEmail: data.ownerEmail,
      planName: data.planName,
      subscriptionMonths: data.subscriptionMonths,
    });
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

      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: tenant.name,
          address: tenant.address,
          phone: tenant.phone,
          isActive: true,
        },
      });

      const owner = await tx.user.create({
        data: {
          name: data.ownerName,
          email: data.ownerEmail,
          passwordHash: hash,
          role: 'OWNER',
          tenantId: tenant.id,
          branchId: branch.id,
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

