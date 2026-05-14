// Shared TypeScript types for the entire application

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginatedMeta;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'OWNER' | 'ADMIN';
  tenantId: string;
  tenantCode?: string;
  tenantName?: string;
  branchId?: string;
  tenant?: Pick<Tenant, 'id' | 'name' | 'subdomain'>;
}

export interface Tenant {
  id: string;
  code: string;
  name: string;
  subdomain?: string;
  logoUrl?: string;
  whatsappTemplate?: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  /** API contract field name */
  subscriptionStatus: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  /** Legacy alias kept for backward compat — prefer subscriptionStatus */
  status?: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    transactions: number;
    vehicles: number;
  };
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
  createdAt?: string;
  customer?: Pick<Customer, 'id' | 'name' | 'phone'>;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PricingRule {
  id: string;
  tenantId: string;
  serviceTypeId?: string;
  serviceType?: ServiceType;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  vehicleId: string;
  serviceTypeId: string;
  estimatedPrice: number;
  finalPrice?: number;
  vehicle?: Vehicle;
  serviceType?: ServiceType;
}

export interface TransactionLog {
  id: string;
  transactionId: string;
  fromStatus?: TransactionStatus;
  toStatus: TransactionStatus;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export type TransactionStatus =
  | 'DRAFT'
  | 'ON_PROCESS'
  | 'READY_TO_PICKUP'
  | 'COMPLETED'
  | 'CLOSED';

export interface Transaction {
  id: string;
  tenantId: string;
  branchId: string;
  customerId: string;
  invoiceNumber: string;
  trackingCode: string;
  status: TransactionStatus;
  estimatedTotal: number;
  finalTotal?: number;
  dpAmount: number;
  remainingAmount?: number;
  refundAmount?: number;
  estimatedFinishDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  branch?: Branch;
  items?: TransactionItem[];
  logs?: TransactionLog[];
  payments?: Payment[];
}

export type PaymentType = 'DP' | 'FINAL_PAYMENT' | 'REFUND';
export type PaymentMethod = 'CASH';

export interface Payment {
  id: string;
  transactionId: string;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface DashboardKpi {
  revenueToday: number;
  monthlyRevenue: number;
  totalRefund: number;
  activeTransactions: number;
  readyPickupCount: number;
  closedToday: number;
  overdueTransactions: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalDp: number;
  totalRefund: number;
  transactionCount: number;
  branchRevenue?: BranchRevenue[];
  monthlyRevenue?: MonthlyRevenue[];
}

export interface BranchRevenue {
  branchId: string;
  branchName: string;
  revenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface Subscription {
  id: string;
  tenantId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  isActive: boolean;
  plan: string;
  startDate: string;
  endDate: string;
  daysRemaining?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}