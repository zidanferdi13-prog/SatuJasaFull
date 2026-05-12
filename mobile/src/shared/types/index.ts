// Shared TypeScript types for the entire application

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  _count?: {
    transactions: number;
    users: number;
  };
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

export interface Vehicle {
  id: string;
  customerId: string;
  plateNumber: string;
  model?: string;
  brand?: string;
  engineNumber?: string;
  chassisNumber?: string;
  registrationYear?: number;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  basePrice: number;
  isActive: boolean;
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
  refundAmount: number;
  estimatedFinishDate?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items?: TransactionItem[];
  logs?: TransactionLog[];
}

export type TransactionStatus =
  | 'DRAFT'
  | 'ON_PROCESS'
  | 'READY_TO_PICKUP'
  | 'COMPLETED'
  | 'CLOSED';

export interface TransactionItem {
  id: string;
  transactionId: string;
  vehicleId: string;
  serviceId: string;
  price: number;
  vehicle?: Vehicle;
  service?: Service;
}

export interface TransactionLog {
  id: string;
  transactionId: string;
  fromStatus: string;
  toStatus: string;
  notes?: string;
  createdAt: string;
}

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

export interface CreateTransactionDTO {
  customerId: string;
  items: { vehicleId: string; serviceId: string; price: number }[];
  dpAmount: number;
  estimatedFinishDate?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}