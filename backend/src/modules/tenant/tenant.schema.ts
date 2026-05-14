import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/i),
    phone: z.string().optional(),
    address: z.string().optional(),
    ownerName: z.string().min(2),
    ownerEmail: z.string().email(),
    ownerPassword: z.string().min(8),
    subscriptionMonths: z.number().int().min(1).max(24).default(12),
    planName: z.string().default('Standard'),
    planPrice: z.number().nonnegative().default(0),
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const updateTenantStatusSchema = z.object({
  body: z.object({
    subscriptionStatus: z.enum(['ACTIVE', 'EXPIRED', 'SUSPENDED']).optional(),
    subscriptionEnd: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const resetOwnerPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, 'Password minimal 8 karakter'),
  }),
});
