-- Migration: 001_create_initial_tables
-- Description: Create core tables for STNK Bureau system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bureau_id UUID,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('OWNER', 'STAFF', 'ADMIN')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_bureau_id ON users(bureau_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Bureaus table (Tenants)
CREATE TABLE bureaus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')) DEFAULT 'ACTIVE',
  subscription_plan VARCHAR(50) CHECK (subscription_plan IN ('BASIC', 'PRO', 'ENTERPRISE')) DEFAULT 'BASIC',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bureaus_owner_id ON bureaus(owner_id);
CREATE INDEX idx_bureaus_status ON bureaus(status);
CREATE INDEX idx_bureaus_subscription_expires ON bureaus(subscription_expires_at);

-- Update users table to add foreign key to bureaus
ALTER TABLE users ADD CONSTRAINT fk_users_bureau_id
  FOREIGN KEY (bureau_id) REFERENCES bureaus(id) ON DELETE SET NULL;

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bureau_id UUID NOT NULL REFERENCES bureaus(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(12, 2) NOT NULL,
  margin_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_price CHECK (base_price > 0),
  CONSTRAINT valid_margin CHECK (margin_percentage >= 0 AND margin_percentage <= 100)
);

CREATE INDEX idx_services_bureau_id ON services(bureau_id);
CREATE INDEX idx_services_active ON services(active);
CREATE UNIQUE INDEX idx_services_bureau_name ON services(bureau_id, name);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bureau_id UUID NOT NULL REFERENCES bureaus(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  vehicle_number VARCHAR(20),
  vehicle_type VARCHAR(50),
  id_type VARCHAR(20) DEFAULT 'KTP',
  id_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customers_bureau_id ON customers(bureau_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bureau_id UUID NOT NULL REFERENCES bureaus(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  base_price DECIMAL(12, 2) NOT NULL,
  margin_amount DECIMAL(12, 2) NOT NULL,
  final_price DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')) DEFAULT 'PENDING',
  payment_method VARCHAR(50) CHECK (payment_method IN ('CASH', 'TRANSFER', 'OTHER')) DEFAULT 'CASH',
  payment_status VARCHAR(50) CHECK (payment_status IN ('UNPAID', 'PAID', 'PARTIAL')) DEFAULT 'UNPAID',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT positive_final_price CHECK (final_price > 0)
);

CREATE INDEX idx_transactions_bureau_id ON transactions(bureau_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_service_id ON transactions(service_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Document Tracking table
CREATE TABLE document_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  bureau_id UUID NOT NULL REFERENCES bureaus(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  current_stage INT DEFAULT 1 CHECK (current_stage >= 1 AND current_stage <= 5),
  tracking_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_document_tracking_transaction_id ON document_tracking(transaction_id);
CREATE INDEX idx_document_tracking_bureau_id ON document_tracking(bureau_id);
CREATE INDEX idx_document_tracking_customer_id ON document_tracking(customer_id);
CREATE INDEX idx_document_tracking_token ON document_tracking(tracking_token);

-- Document Stage History table
CREATE TABLE document_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_tracking_id UUID NOT NULL REFERENCES document_tracking(id) ON DELETE CASCADE,
  stage INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stage_history_document_id ON document_stage_history(document_tracking_id);

-- Promotional Pricing table
CREATE TABLE promotional_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bureau_id UUID NOT NULL REFERENCES bureaus(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  discount_type VARCHAR(20) CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')) NOT NULL,
  discount_value DECIMAL(12, 2) NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_discount CHECK (discount_value > 0)
);

CREATE INDEX idx_promo_bureau_id ON promotional_pricing(bureau_id);
CREATE INDEX idx_promo_service_id ON promotional_pricing(service_id);
CREATE INDEX idx_promo_active ON promotional_pricing(active);
CREATE INDEX idx_promo_valid_dates ON promotional_pricing(valid_from, valid_until);

-- Subscription Plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  price_monthly DECIMAL(12, 2) NOT NULL,
  max_staff INT,
  max_transactions INT,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_price CHECK (price_monthly > 0)
);

-- Bureau Subscriptions History table
CREATE TABLE bureau_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bureau_id UUID NOT NULL REFERENCES bureaus(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bureau_subs_bureau_id ON bureau_subscriptions(bureau_id);
CREATE INDEX idx_bureau_subs_plan_id ON bureau_subscriptions(plan_id);
CREATE INDEX idx_bureau_subs_expires ON bureau_subscriptions(expires_at);

-- Revenue Summary table
CREATE TABLE revenue_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bureau_id UUID NOT NULL REFERENCES bureaus(id) ON DELETE CASCADE,
  period_date DATE NOT NULL,
  total_transactions INT DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  total_margin DECIMAL(12, 2) DEFAULT 0,
  subscription_status VARCHAR(20) CHECK (subscription_status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_bureau_period UNIQUE (bureau_id, period_date)
);

CREATE INDEX idx_revenue_bureau_id ON revenue_summary(bureau_id);
CREATE INDEX idx_revenue_period_date ON revenue_summary(period_date);

-- Audit Log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  bureau_id UUID REFERENCES bureaus(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_bureau_id ON audit_logs(bureau_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
