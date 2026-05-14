export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const TRACKING_URL = process.env.EXPO_PUBLIC_TRACKING_BASE_URL || 'http://localhost:3001/tracking';

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

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  DP: 'Uang Muka (DP)',
  FINAL_PAYMENT: 'Pelunasan',
  REFUND: 'Pengembalian Dana',
};

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
} as const;

export const STATUS_TRANSITION: Record<string, string> = {
  DRAFT: 'ON_PROCESS',
  ON_PROCESS: 'READY_TO_PICKUP',
  READY_TO_PICKUP: 'COMPLETED',
  COMPLETED: 'CLOSED',
};
