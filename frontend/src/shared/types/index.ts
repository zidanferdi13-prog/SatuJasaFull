export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'ADMIN';
  tenantCode: string;
  tenantName: string;
  branchId?: string;
}

export interface Tenant {
  id: string;
  code: string;
  name: string;
  logoUrl?: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  _count?: { transactions: number; users: number };
}

export interface CreateTenantDTO {
  code: string;
  name: string;
  ownerEmail: string;
  ownerPassword: string;
  subscriptionEnd: string;
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
  activeTransactions: number;
  readyPickupCount: number;
  monthlyRevenue: number;
}

export interface AdminKpis {
  totalTenants: number;
  activeTenants: number;
  totalTransactions: number;
  expiredSubscriptions: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}
