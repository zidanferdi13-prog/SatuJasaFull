import { z } from 'zod';

export const checkPkbSchema = z.object({
  body: z.object({
    no_polisi: z.string().trim().min(3, 'Nomor polisi wajib diisi'),
    kd_plat: z.string().trim().min(1, 'Kode plat wajib diisi'),
  }),
});

export type CheckPkbInput = z.infer<typeof checkPkbSchema>['body'];
