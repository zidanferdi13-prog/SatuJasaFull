import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';

import { env } from '../../src/config/env';

describe('JWT secrets', () => {
  it('uses required env secrets without insecure fallback values', () => {
    expect(env.JWT_ACCESS_SECRET).toBeTruthy();
    expect(env.JWT_REFRESH_SECRET).toBeTruthy();
    expect(env.JWT_ACCESS_SECRET).not.toBe('access-secret');
    expect(env.JWT_REFRESH_SECRET).not.toBe('refresh-secret');
  });

  it('rejects access tokens signed with the previous fallback secret', () => {
    const token = jwt.sign({ user_id: 'u1', tenant_id: 't1' }, 'access-secret');
    expect(() => jwt.verify(token, env.JWT_ACCESS_SECRET)).toThrow();
  });
});
