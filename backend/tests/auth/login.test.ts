import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  refreshTokenSession: {
    create: vi.fn(),
  },
}));

vi.mock('../../src/config/prisma', () => ({ default: prismaMock }));
vi.mock('../../src/modules/branch/branch.service', () => ({
  BranchService: { getOrCreateDefault: vi.fn() },
}));

import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthService.login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns tokens and user data for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user1',
      name: 'Owner',
      email: 'owner@example.com',
      passwordHash,
      role: 'OWNER',
      tenantId: 'tenant1',
      branchId: 'branch1',
      isActive: true,
      tenant: {
        code: 'TENANT',
        name: 'Tenant',
        subscriptionStatus: 'ACTIVE',
        subscriptionEnd: new Date(Date.now() + 86_400_000),
      },
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.refreshTokenSession.create.mockResolvedValue({ id: 'session1' });

    const result = await AuthService.login('owner@example.com', 'password123');

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user).toMatchObject({ id: 'user1', tenantId: 'tenant1', branchId: 'branch1' });
  });

  it('rejects invalid password', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user1',
      email: 'owner@example.com',
      passwordHash,
      isActive: true,
      tenant: { subscriptionStatus: 'ACTIVE', subscriptionEnd: new Date(Date.now() + 86_400_000) },
    });

    await expect(AuthService.login('owner@example.com', 'wrong')).rejects.toMatchObject({
      message: 'Invalid credentials',
      statusCode: 401,
    });
  });

  it('rejects missing or inactive user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(AuthService.login('missing@example.com', 'password123')).rejects.toMatchObject({
      message: 'Invalid credentials',
      statusCode: 401,
    });
  });
});
