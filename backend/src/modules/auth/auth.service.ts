import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { UserPayload } from '../../shared/middleware/auth.middleware';

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';
  private static JWT_EXPIRES_IN = '24h';

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or inactive user');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    if (user.role !== 'SUPER_ADMIN') {
      const now = new Date();
      if (user.tenant.status !== 'ACTIVE' || user.tenant.subscriptionEnd < now) {
        throw new Error('Tenant subscription expired or suspended');
      }
    }

    const payload: UserPayload = {
      id: user.id,
      tid: user.tenantId,
      bid: user.branchId || '',
      role: user.role,
      code: user.tenant.code
    };

    const token = jwt.sign(payload as object, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN as any });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantCode: user.tenant.code,
        tenantName: user.tenant.name
      }
    };
  }

  static async registerTenant(data: {
    name: string;
    code: string;
    ownerEmail: string;
    ownerPass: string;
    subMonths: number;
  }) {
    const hash = await bcrypt.hash(data.ownerPass, 12);
    const subEnd = new Date();
    subEnd.setMonth(subEnd.getMonth() + data.subMonths);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          code: data.code.toUpperCase(),
          subscriptionStart: new Date(),
          subscriptionEnd: subEnd,
          status: 'ACTIVE'
        }
      });

      const user = await tx.user.create({
        data: {
          name: 'Owner',
          email: data.ownerEmail,
          passwordHash: hash,
          role: 'OWNER',
          tenantId: tenant.id
        }
      });

      return { tenant, user };
    });
  }
}
