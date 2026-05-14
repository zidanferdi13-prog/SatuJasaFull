export const TRANSACTION_STATUS = {
  DRAFT: 'DRAFT',
  ON_PROCESS: 'ON_PROCESS',
  READY_TO_PICKUP: 'READY_TO_PICKUP',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const;

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['ON_PROCESS'],
  ON_PROCESS: ['READY_TO_PICKUP'],
  READY_TO_PICKUP: ['COMPLETED'],
  COMPLETED: ['CLOSED'],
  CLOSED: [],
};

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
} as const;

export const PAYMENT_TYPES = {
  DP: 'DP',
  FINAL_PAYMENT: 'FINAL_PAYMENT',
  REFUND: 'REFUND',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'CASH',
} as const;

export const WHATSAPP_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const DEFAULT_SERVICE_TYPES = [
  { name: 'Perpanjangan STNK Tahunan', description: 'Perpanjangan STNK 1 tahun' },
  { name: 'Perpanjangan STNK 5 Tahunan', description: 'Perpanjangan STNK 5 tahun dengan ganti plat' },
  { name: 'Balik Nama Sedaerah', description: 'Balik nama kendaraan dalam daerah yang sama' },
  { name: 'Balik Nama Pindah Daerah / Mutasi', description: 'Balik nama kendaraan pindah daerah' },
  { name: 'Cabut Berkas', description: 'Proses cabut berkas kendaraan' },
  { name: 'Blokir Kendaraan Tidak Terpakai', description: 'Blokir kendaraan yang tidak terpakai' },
];
