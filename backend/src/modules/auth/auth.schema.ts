import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const registerTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/i),
    phone: z.string().optional(),
    address: z.string().optional(),
    ownerName: z.string().min(2),
    ownerEmail: z.string().email(),
    ownerPassword: z.string().min(8, 'Password minimal 8 karakter'),
    subscriptionMonths: z.coerce.number().int().min(1).max(24).default(12),
    planName: z.string().default('Standard'),
    planPrice: z.coerce.number().nonnegative().default(0),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});
