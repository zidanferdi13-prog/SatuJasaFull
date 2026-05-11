import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { UserPayload } from '../../shared/middleware/auth.middleware';

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'secret';
  private static JWT_EXPIRES_IN = '1d';

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or inactive user');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check subscription if not Super Admin
    if (user.role !== 'SUPER_ADMIN') {
      const now = new Date();
      if (user.tenant.status !== 'ACTIVE' || user.tenant.subscriptionEnd < now) {
        throw new Error('Tenant subscription expired or inactive');
      }
    }

    const payload: UserPayload = {
      id: user.id,
      tid: user.tenantId,
      bid: user.branchId || '',
      role: user.role,
      code: user.tenant.code
    };

    const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });

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

  // Helper for Super Admin to create a new tenant + owner
  static async registerTenant(data: {
    name: string;
    code: string;
    ownerName: string;
    ownerEmail: string;
    ownerPass: string;
    subMonths: number;
  }) {
    const hashedPassword = await bcrypt.hash(data.ownerPass, 12);
    const subEnd = new Date();
    subEnd.setMonth(subEnd.getMonth() + data.subMonths);

    return await prisma.$transaction(async (tx) => {
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
          name: data.ownerName,
          email: data.ownerEmail,
          passwordHash: hashedPassword,
          role: 'OWNER',
          tenantId: tenant.id
        }
      });

      return { tenant, user };
    });
  }
}
