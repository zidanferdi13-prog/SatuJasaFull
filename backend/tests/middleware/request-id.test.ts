import { describe, expect, it, vi } from 'vitest';
import { requestIdMiddleware } from '../../src/shared/middleware/request-id.middleware';
import { getRequestId } from '../../src/config/request-context';

describe('requestIdMiddleware', () => {
  it('uses incoming x-request-id and exposes it in context', () => {
    const req = { headers: { 'x-request-id': 'req-123' } } as any;
    const res = { setHeader: vi.fn() } as any;

    requestIdMiddleware(req, res, () => {
      expect(getRequestId()).toBe('req-123');
    });

    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', 'req-123');
  });

  it('generates request id when header is absent', () => {
    const req = { headers: {} } as any;
    const res = { setHeader: vi.fn() } as any;

    requestIdMiddleware(req, res, () => {
      expect(getRequestId()).toEqual(expect.any(String));
    });

    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', expect.any(String));
  });
});
