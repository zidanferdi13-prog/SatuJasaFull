import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    plateNumber: z.string().min(3),
    model: z.string().optional(),
    brand: z.string().optional(),
    color: z.string().optional(),
    engineNumber: z.string().optional(),
    chassisNumber: z.string().optional(),
    registrationYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    stnkExpiryDate: z.string().datetime().optional(),
  }),
});

export const updateVehicleSchema = z.object({
  body: z.object({
    plateNumber: z.string().min(3).optional(),
    model: z.string().optional(),
    brand: z.string().optional(),
    color: z.string().optional(),
    engineNumber: z.string().optional(),
    chassisNumber: z.string().optional(),
    registrationYear: z.number().int().optional(),
    stnkExpiryDate: z.string().datetime().optional(),
  }),
});
