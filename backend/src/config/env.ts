import 'dotenv/config';
import { z } from 'zod';

// Centralized, validated environment configuration.
// Fails fast on startup if required secrets are missing — no insecure fallbacks.

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  ALLOWED_ORIGINS: z.string().default('http://localhost:3001'),
  APP_URL: z.string().optional(),
  TRACKING_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),

  INVOICE_STORAGE_PATH: z.string().optional(),
  TENANT_LOGO_STORAGE_PATH: z.string().optional(),
  DOCUMENT_STORAGE_PATH: z.string().default('storage/documents'),

  WHATSAPP_PROVIDER: z.enum(['none', 'fonnte', 'wablas']).default('none'),
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),

  SAMBARA_PKB_API_URL: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[ENV] Invalid or missing environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  // Use throw (not process.exit) so tests can assert.
  throw new Error('Environment validation failed. See errors above.');
}

export const env = parsed.data;
export type Env = typeof env;
