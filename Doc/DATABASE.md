# Database Schema Documentation

## Overview

PostgreSQL database with multi-tenant architecture. Single database instance with `bureau_id` field for row-level isolation.

## Tables

### Core User & Organization

#### `users`
Sistem pengguna dengan role-based access control.

```sql
- id (UUID): Primary key
- bureau_id (UUID): Foreign key to bureaus (nullable for ADMIN)
- email (VARCHAR): Unique email address
- password_hash (VARCHAR): Bcrypt hashed password
- full_name (VARCHAR): User's full name
- phone (VARCHAR): Contact phone
- role (VARCHAR): 'OWNER', 'STAFF', or 'ADMIN'
- is_active (BOOLEAN): Account status
- created_at, updated_at (TIMESTAMP)
```

**Roles:**
- `ADMIN`: Full system access (create bureaus, manage subscriptions)
- `OWNER`: Manage own bureau and staff
- `STAFF`: Input transactions and manage services (limited)

#### `bureaus`
Tenant data representing each service bureau.

```sql
- id (UUID): Primary key
- name (VARCHAR): Bureau name
- owner_id (UUID): FK to users
- phone, address, city, province (VARCHAR/TEXT)
- status: 'ACTIVE', 'INACTIVE', 'SUSPENDED'
- subscription_plan: 'BASIC', 'PRO', 'ENTERPRISE'
- subscription_expires_at (TIMESTAMP): When subscription ends
- auto_renew (BOOLEAN): Auto-renewal preference
- created_at, updated_at (TIMESTAMP)
```

### Services & Pricing

#### `services`
Available services offered by each bureau.

```sql
- id (UUID): Primary key
- bureau_id (UUID): FK to bureaus (TENANT ISOLATION)
- name (VARCHAR): Service name (STNK Renewal, Balik Nama, etc.)
- description (TEXT): Service details
- base_price (DECIMAL): Original service price
- margin_percentage (DECIMAL): Bureau's profit margin (0-100%)
- active (BOOLEAN): Whether service is available
- sort_order (INT): Display order
- created_at, updated_at (TIMESTAMP)

UNIQUE(bureau_id, name)
```

#### `promotional_pricing`
Promotional discounts managed by admin.

```sql
- id (UUID): Primary key
- bureau_id (UUID): FK to bureaus
- service_id (UUID): FK to services (nullable = all services)
- name (VARCHAR): Promo name
- discount_type: 'PERCENTAGE' or 'FIXED_AMOUNT'
- discount_value (DECIMAL): Discount amount
- valid_from, valid_until (TIMESTAMP): Promo validity period
- active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Transactions & Customers

#### `customers`
End customers using the service bureau.

```sql
- id (UUID): Primary key
- bureau_id (UUID): FK to bureaus (TENANT ISOLATION)
- name (VARCHAR): Customer name
- phone (VARCHAR): Phone number
- email (VARCHAR): Email address
- vehicle_number (VARCHAR): License plate
- vehicle_type (VARCHAR): Car/Motorcycle/Truck
- id_type (VARCHAR): 'KTP', 'SIM', 'Passport', etc.
- id_number (VARCHAR): ID number
- notes (TEXT): Additional notes
- created_at, updated_at (TIMESTAMP)
```

#### `transactions`
Main transaction records for services rendered.

```sql
- id (UUID): Primary key
- bureau_id (UUID): FK to bureaus (TENANT ISOLATION)
- customer_id (UUID): FK to customers
- service_id (UUID): FK to services
- base_price (DECIMAL): Original service price
- margin_amount (DECIMAL): Bureau's profit
- final_price (DECIMAL): Total price = base_price + margin_amount - promo
- status: 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'
- payment_method: 'CASH', 'TRANSFER', 'OTHER'
- payment_status: 'UNPAID', 'PAID', 'PARTIAL'
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
- completed_at (TIMESTAMP): When transaction finished
```

### Document Tracking

#### `document_tracking`
Track document progress through stages.

```sql
- id (UUID): Primary key
- transaction_id (UUID): FK to transactions (UNIQUE)
- bureau_id (UUID): FK to bureaus
- customer_id (UUID): FK to customers
- current_stage (INT): 1-5 (Diterima, Verifikasi, Processing, Ready Ambil, Completed)
- tracking_token (UUID): UNIQUE token for customer tracking link
- created_at, updated_at (TIMESTAMP)
```

**Stages:**
1. Dokumen Diterima (Document Received)
2. Verifikasi (Verification)
3. Processing (In Process)
4. Ready Ambil (Ready for Pickup)
5. Completed (Completed)

#### `document_stage_history`
History of stage changes.

```sql
- id (UUID): Primary key
- document_tracking_id (UUID): FK to document_tracking
- stage (INT): Stage number when changed
- notes (TEXT): Notes for this stage change
- created_at (TIMESTAMP): When change happened
```

### Subscriptions & Revenue

#### `subscription_plans`
Available subscription tiers.

```sql
- id (UUID): Primary key
- name (VARCHAR): UNIQUE plan name (BASIC, PRO, ENTERPRISE)
- price_monthly (DECIMAL): Monthly price
- max_staff (INT): Max staff members (null = unlimited)
- max_transactions (INT): Max transactions/month (null = unlimited)
- features (JSONB): Feature list as JSON
- created_at, updated_at (TIMESTAMP)
```

Example `features`:
```json
["Transactions", "Basic Tracking", "Analytics", "WhatsApp Receipts"]
```

#### `bureau_subscriptions`
Subscription history for each bureau.

```sql
- id (UUID): Primary key
- bureau_id (UUID): FK to bureaus
- plan_id (UUID): FK to subscription_plans
- started_at (TIMESTAMP): When subscription started
- expires_at (TIMESTAMP): When subscription expires
- auto_renew (BOOLEAN): Auto-renewal setting
- created_at, updated_at (TIMESTAMP)
```

#### `revenue_summary`
Daily revenue summary per bureau.

```sql
- id (UUID): Primary key
- bureau_id (UUID): FK to bureaus
- period_date (DATE): Summary date (UNIQUE per bureau)
- total_transactions (INT): Transaction count
- total_amount (DECIMAL): Total transaction amount
- total_margin (DECIMAL): Total bureau margin earned
- subscription_status: 'ACTIVE', 'EXPIRED', 'SUSPENDED'
- created_at, updated_at (TIMESTAMP)
```

### Audit & Logging

#### `audit_logs`
Track all sensitive operations for compliance.

```sql
- id (UUID): Primary key
- user_id (UUID): FK to users (who did it)
- bureau_id (UUID): FK to bureaus (which bureau)
- action (VARCHAR): Action description
- entity_type (VARCHAR): What was modified (user, transaction, etc.)
- entity_id (UUID): Record ID that was modified
- old_values (JSONB): Previous values
- new_values (JSONB): New values
- ip_address (VARCHAR): User's IP
- user_agent (TEXT): Browser/app info
- created_at (TIMESTAMP): When action occurred
```

## Multi-Tenancy Strategy

### Row-Level Isolation

Every table has `bureau_id` column (except users table which can be ADMIN):

```sql
-- ✓ Correct - User can only see their bureau data
SELECT * FROM services WHERE bureau_id = 'user-bureau-id'

-- ✗ Wrong - Would expose data across tenants
SELECT * FROM services
```

### Database Constraints

```sql
-- Prevent duplicate service names per bureau
UNIQUE(bureau_id, name)

-- Prevent duplicate subscription dates per bureau
UNIQUE(bureau_id, period_date)
```

### Indexes

Created for:
- Frequent filters: `bureau_id`, `status`, `created_at`
- Foreign keys: `owner_id`, `customer_id`, etc.
- Unique lookups: `email`, `tracking_token`

## Migrations

### Running Migrations

```bash
cd backend
npm install
npm run migrate
```

### Seeding Test Data

```bash
npm run seed
```

Creates:
- Admin user: `admin@stnkbureau.local` / `admin123456`
- 3 test bureaus with owners
- Sample services per bureau
- Subscription plans

### Full Setup

```bash
npm run migrate:seed
```

## Data Integrity

### Constraints

- **NOT NULL**: Required fields for data consistency
- **FOREIGN KEY**: Prevent orphaned records
- **UNIQUE**: Prevent duplicates
- **CHECK**: Validate specific values (status, role, etc.)

### Timestamps

All tables have:
- `created_at`: Record creation time (auto-set)
- `updated_at`: Last modification time (auto-set)

### Soft Deletes

Not used - hard deletes with CASCADE/RESTRICT:
- CASCADE: Delete related records (services when bureau deleted)
- RESTRICT: Prevent deletion if related records exist (customer has transactions)

## Performance Considerations

### Indexes

Primary indexes:
- `bureau_id` on all tenant-scoped tables
- `created_at` for time-based queries
- `status` for filtering
- `tracking_token` for public lookups

### Query Patterns

**Fast:**
```sql
SELECT * FROM transactions 
WHERE bureau_id = ? AND created_at > ?
```

**Slow (avoid):**
```sql
SELECT * FROM transactions 
WHERE customer_name LIKE '%search%'  -- Full table scan
```

### Partitioning (Future)

Could partition large tables by `bureau_id` or `created_at` as system grows.

## Backup & Recovery

### Backup Strategy

```bash
# Full database dump
pg_dump stnk_bureau > backup.sql

# Restore
psql stnk_bureau < backup.sql
```

### Retention

- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

## Database Diagram (Simplified)

```
┌──────────────┐
│   users      │
├──────────────┤
│ id (PK)      │
│ bureau_id (FK)
│ email        │
│ role         │
└──────────────┘
       │
       ├─→ ┌──────────────┐
       │   │  bureaus     │
       │   ├──────────────┤
       └──→│ id (PK)      │
           │ owner_id (FK)│
           └──────┬───────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
  ┌────────┐ ┌──────────┐ ┌──────────────────┐
  │services│ │customers │ │transactions      │
  │        │ │          │ │                  │
  │-bureau │ │-bureau   │ │-bureau_id (TENANT)
  │-base_  │ │-phone    │ │-customer_id      │
  │  price │ │-vehicle  │ │-service_id       │
  │-margin │ │          │ │-final_price      │
  └────────┘ └────┬─────┘ └────┬─────────────┘
                 │             │
                 └─────┬───────┘
                       │
                       ▼
                ┌──────────────────┐
                │document_tracking │
                │                  │
                │-tracking_token   │
                │-current_stage    │
                │-stage_history    │
                └──────────────────┘
```

## SQL Query Examples

### Get bureau revenue for today

```sql
SELECT 
  b.name,
  COUNT(t.id) as transaction_count,
  SUM(t.final_price) as total_revenue,
  SUM(t.margin_amount) as margin_earned
FROM bureaus b
LEFT JOIN transactions t ON b.id = t.bureau_id 
  AND DATE(t.created_at) = CURRENT_DATE
  AND t.status = 'COMPLETED'
WHERE b.status = 'ACTIVE'
GROUP BY b.id, b.name
ORDER BY margin_earned DESC;
```

### Get document tracking status

```sql
SELECT 
  c.name,
  c.phone,
  s.name as service,
  dt.current_stage,
  dsh.created_at as last_updated
FROM document_tracking dt
JOIN customers c ON dt.customer_id = c.id
JOIN transactions t ON dt.transaction_id = t.id
JOIN services s ON t.service_id = s.id
LEFT JOIN document_stage_history dsh ON dt.id = dsh.document_tracking_id
WHERE dt.tracking_token = ?
ORDER BY dsh.created_at DESC
LIMIT 1;
```

### Find pending documents for bureau

```sql
SELECT 
  c.name,
  c.phone,
  s.name as service,
  dt.current_stage,
  t.created_at
FROM document_tracking dt
JOIN customers c ON dt.customer_id = c.id
JOIN transactions t ON dt.transaction_id = t.id
JOIN services s ON t.service_id = s.id
WHERE dt.bureau_id = ?
  AND dt.current_stage < 5
  AND t.status = 'COMPLETED'
ORDER BY t.created_at ASC;
```
