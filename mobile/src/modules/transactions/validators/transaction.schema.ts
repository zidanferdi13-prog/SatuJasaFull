import { z } from 'zod';

export const createTransactionSchema = z.object({
  customerId: z.string().min(1, 'Pilih customer'),
  items: z.array(z.object({
    vehicleId: z.string().min(1, 'Pilih kendaraan'),
    serviceId: z.string().min(1, 'Pilih layanan'),
    price: z.number().min(1, 'Harga harus diisi'),
  })).min(1, 'Minimal 1 layanan'),
  dpAmount: z.number().min(0, 'DP tidak boleh negatif'),
  estimatedFinishDate: z.string().optional(),
});

export type CreateTransactionForm = z.infer<typeof createTransactionSchema>;