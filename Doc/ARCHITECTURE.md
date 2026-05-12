# STNK Bureau Service Management System - Architecture

## System Overview

**Multi-tenant SaaS platform** untuk mengelola jasa perpanjangan STNK, balik nama, dan pergantian kepemilikan kendaraan dengan billing, tracking, dan WhatsApp integration.

```
┌─────────────────┐           ┌──────────────────┐           ┌─────────────────┐
│  Mobile App     │           │  Web Admin Panel │           │  Customer Portal│
│ (React Native/  │           │  (React/Next.js) │           │  (Tracking Link)│
│  Flutter)       │           │                  │           │                 │
└────────┬────────┘           └────────┬─────────┘           └────────┬────────┘
         │                             │                               │
         └─────────────────┬───────────┴───────────────┬───────────────┘
                           │                           │
                    ┌──────▼─────────┐         ┌──────▼────────┐
                    │  REST API /    │         │  WebSocket    │
                    │  GraphQL       │         │  (Real-time)  │
                    └──────┬─────────┘         └──────┬────────┘
                           │                          │
                    ┌──────▼──────────────────────────▼──────┐
                    │        Backend Services Layer          │
                    │  (Node.js - Express/Nest.js)         │
                    │  - Auth Service                       │
                    │  - Transaction Service                │
                    │  - Pricing Service                    │
                    │  - Tracking Service                   │
                    │  - Notification Service (WhatsApp)    │
                    │  - User Management Service            │
                    │  - Subscription Service               │
                    └──────┬──────────────────────────────┬──┘
                           │                              │
                    ┌──────▼──────────┐          ┌───────▼────────┐
                    │  PostgreSQL DB  │          │  External APIs │
                    │  (Shared, with  │          │  - WhatsApp    │
                    │   tenant_id)    │          │  - Email       │
                    └─────────────────┘          └────────────────┘
```

---

## 1. Database Schema (Multi-tenant with Shared DB)

### Core Principle
- **Tenant Isolation**: Setiap bureau adalah `tenant_id` (bureau_id)
- **Row-Level Security**: Semua queries filter by `tenant_id`
- **Shared Infrastructure**: Cost efficient, single database

### Key Tables

```sql
-- Users & Authentication
users (
  id UUID PRIMARY KEY,
  bureau_id UUID (tenant_id),
  email UNIQUE,
  password_hash,
  role: 'OWNER' | 'STAFF' | 'ADMIN',
  created_at, updated_at
)

-- Bureaus (Tenants)
bureaus (
  id UUID PRIMARY KEY,
  name,
  owner_id UUID FK users.id,
  phone,
  address,
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  subscription_plan: 'BASIC' | 'PRO' | 'ENTERPRISE',
  subscription_expires_at,
  created_at, updated_at
)

-- Services offered by each bureau
services (
  id UUID PRIMARY KEY,
  bureau_id UUID (tenant_id),
  name: 'STNK Renewal' | 'Balik Nama' | 'Ownership Transfer',
  base_price DECIMAL,
  margin_percentage DECIMAL (bureau's cut),
  active BOOLEAN,
  created_at, updated_at,
  INDEX(bureau_id)
)

-- Customers (yang register untuk tracking)
customers (
  id UUID PRIMARY KEY,
  bureau_id UUID (tenant_id),
  name,
  phone,
  vehicle_number,
  email,
  created_at, updated_at,
  INDEX(bureau_id)
)

-- Transactions
transactions (
  id UUID PRIMARY KEY,
  bureau_id UUID (tenant_id),
  customer_id UUID FK customers.id,
  service_id UUID FK services.id,
  amount DECIMAL,
  status: 'PENDING' | 'COMPLETED' | 'FAILED',
  payment_method: 'CASH' | 'TRANSFER' (just recording),
  created_at, updated_at,
  INDEX(bureau_id),
  INDEX(customer_id)
)

-- Document Tracking
document_tracking (
  id UUID PRIMARY KEY,
  transaction_id UUID FK transactions.id,
  bureau_id UUID (tenant_id),
  customer_id UUID FK customers.id,
  current_stage: 1 | 2 | 3 | 4 | 5
    (1: Dokumen Diterima,
     2: Verifikasi,
     3: Processing,
     4: Ready Ambil,
     5: Completed),
  stage_history [
    {stage: INT, updated_at: TIMESTAMP, notes: TEXT}
  ],
  tracking_token UNIQUE UUID (untuk customer tracking link),
  created_at, updated_at,
  INDEX(bureau_id),
  INDEX(customer_id),
  INDEX(tracking_token)
)

-- Revenue & Commission Tracking
revenue_summary (
  id UUID PRIMARY KEY,
  bureau_id UUID (tenant_id),
  period_start DATE,
  period_end DATE,
  total_transactions INT,
  total_amount DECIMAL,
  subscription_status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED',
  created_at, updated_at,
  INDEX(bureau_id)
)

-- Promotional Pricing (admin bisa set diskon)
promotional_pricing (
  id UUID PRIMARY KEY,
  bureau_id UUID (tenant_id),
  service_id UUID FK services.id,
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT',
  discount_value DECIMAL,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  active BOOLEAN,
  created_at, updated_at,
  INDEX(bureau_id)
)

-- Subscription Plans
subscription_plans (
  id UUID PRIMARY KEY,
  name,
  price_monthly DECIMAL,
  max_staff INT,
  max_transactions INT (null = unlimited),
  features JSON,
  created_at, updated_at
)

-- Bureau Subscription History
bureau_subscriptions (
  id UUID PRIMARY KEY,
  bureau_id UUID (tenant_id),
  plan_id UUID FK subscription_plans.id,
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  auto_renew BOOLEAN,
  created_at, updated_at,
  INDEX(bureau_id)
)
```

---

## 2. API Structure (Node.js/Express or Nest.js)

### Authentication & Authorization
- **JWT tokens** for mobile app & web
- **Role-based access control**: OWNER, STAFF, ADMIN
- **Tenant isolation middleware**: Auto-add `bureau_id` to queries

### API Routes

#### Mobile App Routes
```
POST   /api/v1/auth/login                    → Login bureau
POST   /api/v1/auth/refresh-token            → Refresh JWT
POST   /api/v1/transactions                  → Create transaction
GET    /api/v1/transactions                  → List transactions (filtered by bureau_id)
GET    /api/v1/dashboard/revenue             → Today/Weekly/Monthly revenue
POST   /api/v1/services                      → Create/update service pricing
GET    /api/v1/services                      → List services
GET    /api/v1/staff                         → List staff (if owner)
POST   /api/v1/staff                         → Add staff member (owner only)
GET    /api/v1/transactions/:id/tracking     → Get tracking link status
```

#### Web Admin Routes
```
GET    /api/v1/admin/bureaus                 → List all bureaus
POST   /api/v1/admin/bureaus                 → Create bureau
GET    /api/v1/admin/bureaus/:id             → Bureau details
PUT    /api/v1/admin/bureaus/:id/subscription → Set/update subscription
GET    /api/v1/admin/transactions            → All transactions (all bureaus)
GET    /api/v1/admin/analytics               → System-wide analytics
POST   /api/v1/admin/promotions              → Create promotional pricing
GET    /api/v1/admin/revenue-summary         → Revenue overview
```

#### Customer Tracking Routes (Public)
```
GET    /api/v1/tracking/:tracking_token      → Get document status (public, no auth)
GET    /api/v1/tracking/:tracking_token/history → Get full tracking history
```

#### Notification Service
```
POST   /api/v1/notifications/send-receipt    → WhatsApp receipt (internal)
POST   /api/v1/notifications/stage-update    → Send tracking update (internal)
```

---

## 3. Component Architecture

### Frontend (Mobile App - React Native/Flutter)
```
Screens:
├── Auth
│   ├── Login
│   └── Register (hanya admin bisa create)
├── Dashboard
│   ├── Today Revenue
│   ├── Pending Transactions
│   └── Quick Stats
├── Transaction
│   ├── New Transaction
│   ├── Transaction List
│   └── Transaction Detail (dengan tracking)
├── Services Management
│   ├── Service List
│   ├── Edit Service Pricing
│   └── View Margin
└── Settings
    ├── Profile
    ├── Staff Management
    └── Subscription Info
```

### Frontend (Web Admin - React/Next.js)
```
Pages:
├── Dashboard
│   ├── System-wide stats
│   ├── Bureau list with status
│   └── Revenue overview
├── Bureau Management
│   ├── Create bureau
│   ├── Edit bureau details
│   ├── Manage subscription
│   └── View bureau staff
├── Transactions
│   ├── All transactions
│   ├── Filter by bureau/date
│   └── Export data
├── Analytics
│   ├── Revenue by bureau
│   ├── Service popularity
│   └── Churn analysis
└── Promotions
    ├── Create discount
    ├── Set expiry
    └── View active promos
```

### Backend Services (Node.js)

**1. Auth Service**
- JWT generation/validation
- Login/logout
- Role-based middleware
- Tenant isolation middleware

**2. Transaction Service**
- Create/update/delete transactions
- Auto-generate tracking token
- Calculate revenue split
- Trigger WhatsApp receipt

**3. Tracking Service**
- Update document stage
- Maintain stage history
- Public tracking endpoint
- Send customer notifications

**4. Pricing Service**
- Calculate final price (base + margin + promo)
- Apply promotional discounts
- Handle price history

**5. Notification Service**
- WhatsApp integration (e.g., Twilio)
- E-receipt generation
- Send tracking updates
- Stage change notifications

**6. User Management Service** (Admin only)
- Create bureaus
- Manage staff
- Set roles/permissions

**7. Subscription Service** (Admin only)
- Create/update subscription plans
- Manage bureau subscriptions
- Expiry tracking
- Manual renewal/suspension

---

## 4. Data Flow

### Transaction Flow
```
1. Bureau Owner/Staff opens mobile app
2. Input transaction:
   - Customer name & phone
   - Vehicle number
   - Service type
   - Payment method (cash recording)
3. Submit transaction
   ↓
4. Backend:
   - Create transaction record
   - Create document_tracking (stage 1: Dokumen Diterima)
   - Generate unique tracking_token
   - Calculate price with margin
   ↓
5. Auto-send WhatsApp:
   - E-receipt to customer
   - Tracking link: https://app.com/tracking/{tracking_token}
   ↓
6. Bureau sees confirmation on mobile
7. Revenue updated in dashboard
```

### Tracking Flow
```
Customer receives:
1. WhatsApp with tracking link
2. Clicks link → Public tracking page
3. Sees current stage (e.g., "Verifikasi")
4. Can see full history

As document progresses:
- Bureau updates stage in mobile app (stage selector)
- Backend auto-sends WhatsApp update to customer
- Customer sees updated status on tracking page
```

### Admin Dashboard Flow
```
Admin logs into web panel:
1. Sees all bureaus + status
2. Sees total revenue across all bureaus
3. Can create new bureau account
4. Can set subscription plan & expiry
5. Can create promotional pricing
6. Can view all transactions (debug/audit)
```

---

## 5. Multi-Tenancy Strategy

### Tenant Isolation
```typescript
// Middleware - Auto-add bureau_id to all queries
const tenantMiddleware = (req, res, next) => {
  req.bureau_id = req.user.bureau_id; // From JWT
  req.query.bureau_id = req.bureau_id; // Force filter
  next();
};

// Example: Secure query
// Instead of: SELECT * FROM transactions
// Always:     SELECT * FROM transactions WHERE bureau_id = $1
```

### Security Rules
- **No cross-tenant access**: Every query MUST filter by `bureau_id`
- **Admin override**: Only admin role can access `?admin=true&target_bureau=...`
- **Audit logging**: Log all admin cross-tenant access
- **Database constraints**: Add UNIQUE constraints on (bureau_id, name/code) pairs

---

## 6. WhatsApp Integration

### Service Used
- **Twilio API** or **Official WhatsApp Business API** (recommend Twilio for ease)

### Message Types
```
1. E-Receipt (on transaction creation)
   Format: 
   ────────────────
   Terima kasih telah menggunakan layanan kami!
   
   Jasa: STNK Renewal
   Nomor Kendaraan: BL 1234 AB
   Harga: Rp 500.000
   Status: Pending
   
   Lacak dokumen Anda:
   https://tracking.app.com/T-UUID-123456
   ────────────────

2. Stage Update (on stage change)
   Format:
   ────────────────
   Update Dokumen STNK Anda
   Status Terbaru: Verifikasi
   Waktu Update: 10:30 AM
   
   Lacak di: https://tracking.app.com/T-UUID-123456
   ────────────────
```

---

## 7. Deployment Architecture

### Tech Stack
- **Backend**: Node.js (Express.js or Nest.js) + TypeScript
- **Database**: PostgreSQL (shared instance)
- **Mobile**: React Native or Flutter (can share JS codebase)
- **Web Admin**: React/Next.js
- **Hosting**: Docker + Kubernetes or Docker Compose for MVP
- **Message Queue**: Redis (for async WhatsApp sends)

### Environment Setup
```
.env vars:
- DATABASE_URL
- JWT_SECRET
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_NUMBER
- ADMIN_EMAIL
- APP_URL (for tracking links)
```

---

## 8. Security Considerations

1. **Data Isolation**: Row-level security by `bureau_id`
2. **Authentication**: JWT + refresh tokens
3. **Authorization**: Role-based middleware
4. **Audit Logging**: Log all sensitive operations
5. **Rate Limiting**: Prevent abuse on public tracking endpoint
6. **Input Validation**: Sanitize all inputs (phone, vehicle number, etc.)
7. **Encryption**: Hash passwords, encrypt sensitive data at rest
8. **HTTPS Only**: All communication encrypted
9. **Admin Access**: Track all admin actions on bureaus

---

## 9. Implementation Phases

### Phase 1: MVP (Core)
- [ ] Database design & setup
- [ ] Auth service + JWT
- [ ] Transaction creation + basic tracking
- [ ] WhatsApp e-receipt (static)
- [ ] Mobile app basic UI
- [ ] Web admin basic bureau management

### Phase 2: Enhancement
- [ ] Dynamic tracking stages
- [ ] Revenue dashboard
- [ ] Service pricing management
- [ ] Staff management
- [ ] WhatsApp stage notifications

### Phase 3: Scale
- [ ] Analytics & reporting
- [ ] Promotional pricing
- [ ] Advanced permission system
- [ ] Mobile performance optimization
- [ ] Subscription management automation

---

## Questions Before Implementation

1. **Customer phone number format**: Apakah simpan +62 atau 0812xxx?
2. **Receipt design**: Ada template khusus atau standard?
3. **Staff role level**: Bisa staff melihat revenue atau hanya input saja?
4. **Tracking link expiry**: Apakah tracking link active selamanya atau ada expiry?
5. **Backup & disaster recovery**: Butuh backup strategi khusus?

---

**Status**: Architecture ready for review & refinement before coding starts.
