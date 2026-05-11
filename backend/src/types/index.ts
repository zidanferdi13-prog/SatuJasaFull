export interface User {
  id: string;
  bureau_id?: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'ADMIN' | 'OWNER' | 'STAFF';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Bureau {
  id: string;
  name: string;
  owner_id: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  subscription_plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  subscription_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  bureau_id: string;
  customer_id: string;
  service_id: string;
  base_price: number;
  margin_amount: number;
  final_price: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payment_method: string;
  payment_status: 'UNPAID' | 'PAID' | 'PARTIAL';
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  bureau_id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_number?: string;
  created_at: Date;
}

export interface DocumentTracking {
  id: string;
  transaction_id: string;
  bureau_id: string;
  customer_id: string;
  current_stage: number;
  tracking_token: string;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  bureau_id: string;
  name: string;
  base_price: number;
  margin_percentage: number;
  active: boolean;
  created_at: Date;
}

export interface JwtPayload {
  id: string;
  bureau_id?: string;
  role: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}
