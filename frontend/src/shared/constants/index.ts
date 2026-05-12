export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9E9E9E',
  ON_PROCESS: '#FF9800',
  READY_TO_PICKUP: '#2196F3',
  COMPLETED: '#4CAF50',
  CLOSED: '#333333',
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  ON_PROCESS: 'Sedang Diproses',
  READY_TO_PICKUP: 'Siap Diambil',
  COMPLETED: 'Selesai',
  CLOSED: 'Ditutup',
};

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
} as const;

export const TENANT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#2e7d32',
  SUSPENDED: '#c62828',
  EXPIRED: '#e65100',
};

export const TENANT_STATUS_BG: Record<string, string> = {
  ACTIVE: '#e8f5e9',
  SUSPENDED: '#ffebee',
  EXPIRED: '#fff3e0',
};
