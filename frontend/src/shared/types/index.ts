export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'ADMIN';
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  branchId?: string | null;
}

export interface Tenant {
  id: string;
  code: string;
  name: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  subscriptionStart: string;
  subscriptionEnd: string;
  subscriptionStatus: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  createdAt: string;
  updatedAt?: string;
  _count?: { transactions: number; users: number; branches: number };
}

export interface CreateTenantDTO {
  code: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  phone?: string;
  address?: string;
  subscriptionMonths: number;
  planName?: string;
  planPrice?: number;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  tenantId: string;
  branchId: string;
  customerId: string;
  invoiceNumber: string;
  trackingCode: string;
  status: TransactionStatus;
  estimatedTotal: number;
  finalTotal: number;
  dpAmount: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  tenant?: Tenant;
}

export type TransactionStatus =
  | 'DRAFT'
  | 'ON_PROCESS'
  | 'READY_TO_PICKUP'
  | 'COMPLETED'
  | 'CLOSED';

export interface DashboardKpis {
  revenueToday: number;
  monthlyRevenue: number;
  totalRefund: number;
  activeTransactions: number;
  readyPickupCount: number;
  closedToday: number;
  overdueTransactions: number;
}

export interface AdminKpis {
  totalTenants: number;
  activeTenants: number;
  expiredSubscriptions: number;
  totalTransactions: number;
  platformMonthlyRevenue: number;
  whatsappQueuePending: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
}

export type PaymentType = 'DP' | 'FINAL_PAYMENT' | 'REFUND';
export type PaymentMethod = 'CASH';
export type WhatsAppQueueStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface Payment {
  id: string;
  transactionId: string;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface WhatsAppQueueItem {
  id: string;
  tenantId: string;
  phone: string;
  message: string;
  status: WhatsAppQueueStatus;
  attempts: number;
  error?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiMeta;
}
