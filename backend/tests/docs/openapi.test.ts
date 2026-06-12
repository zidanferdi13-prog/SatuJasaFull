import { describe, expect, it } from 'vitest';
import { openApiDocument } from '../../src/docs/openapi';

describe('OpenAPI document', () => {
  it('generates OpenAPI docs for core routes', () => {
    expect(openApiDocument.openapi).toBe('3.0.0');
    expect(openApiDocument.info.title).toBe('SatuJasa API');
    expect(openApiDocument.paths['/auth/login']).toBeDefined();
    expect(openApiDocument.paths['/transactions']).toBeDefined();
    expect(openApiDocument.paths['/transactions/{id}/payments']).toBeDefined();
    expect(openApiDocument.components?.securitySchemes?.bearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
  });
});
