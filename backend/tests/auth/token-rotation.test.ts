import crypto from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  refreshTokenSession: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock('../../src/config/prisma', () => ({ default: prismaMock }));
vi.mock('../../src/modules/branch/branch.service', () => ({
  BranchService: { getOrCreateDefault: vi.fn() },
}));

import { env } from '../../src/config/env';
import { AuthService } from '../../src/modules/auth/auth.service';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

describe('refresh token rotation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rotates refresh token and revokes the previous session', async () => {
    const refreshToken = jwt.sign(
      { user_id: 'user1', tenant_id: 'tenant1', branch_id: 'branch1', role: 'OWNER', tenant_code: 'TENANT', family: 'family1' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    prismaMock.refreshTokenSession.findUnique.mockResolvedValue({
      id: 'session1',
      userId: 'user1',
      tenantId: 'tenant1',
      tokenHash: hashToken(refreshToken),
      family: 'family1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: null,
    });
    prismaMock.refreshTokenSession.create.mockResolvedValue({ id: 'session2' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user1',
      name: 'Owner',
      email: 'owner@example.com',
      role: 'OWNER',
      tenantId: 'tenant1',
      branchId: 'branch1',
      isActive: true,
      tenant: { code: 'TENANT', name: 'Tenant' },
    });

    const result = await AuthService.refresh(refreshToken);

    expect(result.refreshToken).toBeTruthy();
    expect(result.refreshToken).not.toBe(refreshToken);
    expect(prismaMock.refreshTokenSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'session1' }, data: expect.objectContaining({ replacedById: 'session2' }) })
    );
  });

  it('revokes the token family when a revoked refresh token is reused', async () => {
    const refreshToken = jwt.sign(
      { user_id: 'user1', tenant_id: 'tenant1', family: 'family1' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    prismaMock.refreshTokenSession.findUnique.mockResolvedValue({
      id: 'session1',
      family: 'family1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: new Date(),
    });

    await expect(AuthService.refresh(refreshToken)).rejects.toMatchObject({
      message: 'Refresh token reuse detected',
      statusCode: 401,
    });
    expect(prismaMock.refreshTokenSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { family: 'family1', revokedAt: null } })
    );
  });
});
