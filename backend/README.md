# Backend - SatuJasa Service Management SaaS

Node.js + Express + PostgreSQL backend for a multi-tenant SatuJasa Service Management SaaS Platform.

This backend powers:

* Mobile App for bureau/tenant operations
* Web-Based Super Admin Dashboard
* Public Customer Tracking Page
* PDF Invoice Generation
* WhatsApp Notification Queue
* Subscription Access Control
* Multi-branch Revenue Monitoring

---

## 1. System Overview

This backend is designed for Indonesian STNK bureau service operations such as:

* Perpanjangan STNK Tahunan
* Perpanjangan STNK 5 Tahunan
* Balik Nama Sedaerah
* Balik Nama Pindah Daerah / Mutasi
* Cabut Berkas
* Blokir Kendaraan Tidak Terpakai

The system is built as a **multi-tenant SaaS platform**, where each bureau service is treated as a tenant.

Platform hierarchy:

```text
Platform Owner / Super Admin
    ↓
Tenant / Biro Jasa
    ↓
Branch / Cabang
    ↓
Customer
    ↓
Vehicle
    ↓
Transaction
```

---

## 2. Tech Stack

### Core Backend

* Node.js
* Express.js
* TypeScript recommended
* PostgreSQL
* Redis
* JWT Authentication
* Docker

### Recommended Libraries

* `express`
* `pg` or `prisma`
* `jsonwebtoken`
* `bcrypt`
* `zod` or `joi`
* `bullmq` for queue worker
* `ioredis`
* `pdfkit` or `puppeteer` for PDF invoice generation
* `multer` for tenant logo upload
* `winston` or `pino` for logging
* `helmet`
* `cors`
* `dotenv`

---

## 3. Main Responsibilities

The backend handles:

* Tenant management
* Branch management
* User authentication
* Subscription validation
* Customer management
* Vehicle management
* Transaction workflow
* Payment recording
* PDF invoice generation
* WhatsApp notification queue
* Public tracking API
* Revenue aggregation
* Audit logging
* Admin monitoring
* Excel export

---

## 4. Project Structure

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── jwt.ts
│   │   └── storage.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── tenant/
│   │   ├── branch/
│   │   ├── user/
│   │   ├── customer/
│   │   ├── vehicle/
│   │   ├── service-type/
│   │   ├── pricing/
│   │   ├── transaction/
│   │   ├── payment/
│   │   ├── invoice/
│   │   ├── notification/
│   │   ├── tracking/
│   │   ├── subscription/
│   │   ├── dashboard/
│   │   ├── audit/
│   │   └── export/
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── subscription.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── response.ts
│   │   │   ├── pagination.ts
│   │   │   ├── invoice-number.ts
│   │   │   ├── tracking-code.ts
│   │   │   └── date.ts
│   │   │
│   │   ├── constants/
│   │   ├── types/
│   │   ├── validators/
│   │   ├── services/
│   │   └── logger/
│   │
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── index.ts
│   │
│   ├── workers/
│   │   ├── whatsapp.worker.ts
│   │   ├── invoice.worker.ts
│   │   └── subscription.worker.ts
│   │
│   └── jobs/
│       ├── subscription-expiry.job.ts
│       └── overdue-transaction.job.ts
│
├── uploads/
│   └── tenant-logos/
│
├── storage/
│   └── invoices/
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
└── README.md
```

---

## 5. Architecture Pattern

This backend uses **Modular Monolith Architecture**.

Each module follows layered structure:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

### Layer Responsibility

| Layer      | Responsibility                     |
| ---------- | ---------------------------------- |
| Route      | Define HTTP endpoints              |
| Controller | Handle request/response            |
| Service    | Business logic                     |
| Repository | Database queries                   |
| Middleware | Auth, tenant isolation, validation |
| Worker     | Background queue processing        |

---

## 6. Multi-Tenant Architecture

The backend uses **shared database multi-tenancy**.

All tenant-owned business tables must include:

```text
tenant_id
```

Examples:

* branches
* users
* customers
* vehicles
* transactions
* transaction_items
* payments
* pricing_rules
* whatsapp_queue
* audit_logs

### Tenant Isolation Rule

Backend must always use `tenant_id` from JWT token.

Never trust `tenant_id` from request body.

Bad:

```ts
req.body.tenant_id
```

Good:

```ts
req.user.tenant_id
```

---

## 7. Authentication & Authorization

Authentication uses:

* JWT access token
* Refresh token
* Password hashing with bcrypt

JWT payload:

```json
{
  "user_id": "uuid",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "role": "OWNER"
}
```

### Roles

| Role        | Description              |
| ----------- | ------------------------ |
| SUPER_ADMIN | Platform owner           |
| OWNER       | Tenant owner             |
| ADMIN       | Tenant operational admin |

### Route Protection

Protected routes require:

* valid JWT
* valid tenant access
* active subscription for tenant users
* role authorization

---

## 8. Subscription Rules

Tenant subscription is managed manually by Super Admin.

Tenant table includes:

* subscription_start
* subscription_end
* subscription_status

Possible status:

```text
ACTIVE
EXPIRED
SUSPENDED
```

### Expired Subscription Behavior

If subscription is expired:

* tenant cannot login
* tenant cannot access mobile app
* tenant cannot access tenant dashboard
* public customer tracking remains accessible
* super admin can still access tenant data
* super admin can still impersonate tenant for troubleshooting

---

## 9. Tenant Code & Document Numbering

Each tenant has a unique short code.

Example:

```text
Biro Jasa Arjuna → ARJ
Biro Jasa Abadi → BJA
```

Tenant code is used for:

* invoice number
* tracking code
* document naming
* tenant branding

### Invoice Format

```text
INV/{TENANT_CODE}/{YEAR}/{MONTH}/{RUNNING_NUMBER}
```

Example:

```text
INV/ARJ/2026/05/0001
```

Invoice number resets every month per tenant.

Use `invoice_sequences` table to prevent duplicate invoice numbers.

---

## 10. Core Database Tables

Required tables:

```text
tenants
branches
users
customers
vehicles
service_types
pricing_rules
transactions
transaction_items
payments
invoice_sequences
whatsapp_queue
transaction_logs
subscriptions
audit_logs
```

Recommended primary key:

```text
UUID
```

Recommended database:

```text
PostgreSQL
```

---

## 11. Transaction System

A transaction represents one customer order.

One transaction can contain multiple vehicles and multiple service types.

Example:

```text
Customer: Budi
Transaction: INV/ARJ/2026/05/0001
Vehicles:
- B 1234 ABC → Perpanjangan Tahunan
- B 5678 XYZ → Balik Nama
```

### Transaction Status Flow

```text
DRAFT
  ↓
ON_PROCESS
  ↓
READY_TO_PICKUP
  ↓
COMPLETED
  ↓
CLOSED
```

### Status Meaning

| Status          | Meaning                                 |
| --------------- | --------------------------------------- |
| DRAFT           | Transaction created but not active yet  |
| ON_PROCESS      | Documents are being processed at Samsat |
| READY_TO_PICKUP | Process completed and ready for pickup  |
| COMPLETED       | Customer has fully paid                 |
| CLOSED          | Document has been picked up             |

### Business Rules

* Invoice is active only when status is not DRAFT
* Final payment is required before CLOSED
* No debt allowed
* No installment allowed
* Refund is allowed if final price is lower than estimated price

---

## 12. Payment System

The payment system is intentionally simple.

Allowed payment types:

```text
DP
FINAL_PAYMENT
REFUND
```

Allowed payment method for MVP:

```text
CASH
```

Rules:

* No payment gateway integration
* No installment
* Customer must pay remaining balance before transaction is closed
* Payment logs should be append-only
* Avoid updating/deleting payment records

---

## 13. PDF Invoice System

PDF invoice must be generated in backend.

PDF invoice includes:

* tenant logo
* tenant name
* branch info
* invoice number
* customer data
* vehicle list
* service list
* estimated total
* DP amount
* remaining amount
* final total
* refund amount if any
* tracking URL

Generated invoice files are stored in:

```text
/storage/invoices
```

Recommended flow:

```text
Transaction Created
  ↓
Generate Invoice PDF
  ↓
Store Invoice File
  ↓
Create Public Invoice URL
  ↓
Queue WhatsApp Notification
```

---

## 14. WhatsApp Notification Queue

WhatsApp sending must be asynchronous.

Never send WhatsApp directly inside the transaction request flow.

Use queue-based architecture:

```text
API Request
  ↓
Insert whatsapp_queue record
  ↓
Worker processes queue
  ↓
Send WhatsApp message
  ↓
Update queue status
```

Queue status:

```text
PENDING
SENT
FAILED
```

Trigger events:

* transaction created
* transaction ready for pickup
* transaction closed
* subscription reminder
* overdue transaction reminder

---

## 15. Public Tracking System

Public tracking does not require login.

Tracking endpoint:

```http
GET /api/v1/tracking/:trackingCode
```

Public tracking page shows:

* tenant branding
* transaction status
* timeline
* estimated finish date
* invoice information
* payment status

Important rule:

```text
Tracking must remain active even if tenant subscription expires.
```

---

## 16. Revenue & Dashboard System

Revenue must be calculated for:

* branch level
* tenant level
* platform level

Tenant dashboard should show:

* revenue today
* monthly revenue
* total profit
* refund total
* active transactions
* ready pickup count
* overdue transactions

Super Admin dashboard should show:

* active tenants
* expired subscriptions
* total platform revenue
* transaction count
* system queue status
* error logs

---

## 17. Audit Logging

Audit logs are required for sensitive operations.

Track:

* transaction status changes
* payment changes
* pricing changes
* subscription changes
* tenant status changes
* impersonation activity

Audit log should include:

```text
tenant_id
action
entity
entity_id
before
after
created_by
created_at
```

---

## 18. API Response Standard

### Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

---

## 19. API Endpoints Overview

Base URL:

```text
/api/v1
```

### Auth

```http
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

### Tenants

```http
GET    /tenants
POST   /tenants
GET    /tenants/:id
PUT    /tenants/:id
PATCH  /tenants/:id/status
POST   /tenants/:id/impersonate
POST   /tenants/:id/logo
```

### Branches

```http
GET    /branches
POST   /branches
GET    /branches/:id
PUT    /branches/:id
DELETE /branches/:id
```

### Customers

```http
GET    /customers
POST   /customers
GET    /customers/:id
PUT    /customers/:id
```

### Vehicles

```http
GET    /vehicles
POST   /vehicles
GET    /vehicles/:id
PUT    /vehicles/:id
```

### Service Types

```http
GET    /service-types
POST   /service-types
PUT    /service-types/:id
PATCH  /service-types/:id/status
```

### Pricing Rules

```http
GET    /pricing-rules
POST   /pricing-rules
PUT    /pricing-rules/:id
```

### Transactions

```http
GET    /transactions
POST   /transactions
GET    /transactions/:id
PATCH  /transactions/:id/status
POST   /transactions/:id/finalize
POST   /transactions/:id/close
GET    /transactions/:id/invoice
```

### Payments

```http
GET    /transactions/:id/payments
POST   /transactions/:id/payments
```

### Tracking

```http
GET    /tracking/:trackingCode
```

### Notifications

```http
GET    /notifications/queue
POST   /notifications/:id/retry
```

### Dashboard

```http
GET    /dashboard/tenant
GET    /dashboard/admin
GET    /dashboard/branch/:branchId
```

### Export

```http
GET    /exports/transactions
GET    /exports/revenue
```

### Audit Logs

```http
GET    /audit-logs
```

---

## 20. Query Standards

### Pagination

```text
?page=1&limit=20
```

Response meta:

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Search

Transactions should support search by:

* plate number
* invoice number
* customer name

Example:

```http
GET /transactions?search=B1234ABC
```

### Filtering

Supported filters:

```text
status
branch_id
tenant_id
start_date
end_date
```

### Sorting

```http
GET /transactions?sort=created_at:desc
```

---

## 21. Middleware

Required middleware:

```text
authMiddleware
roleMiddleware
tenantMiddleware
subscriptionMiddleware
validationMiddleware
errorMiddleware
auditMiddleware
```

### Middleware Order

Recommended order:

```text
authMiddleware
  ↓
tenantMiddleware
  ↓
subscriptionMiddleware
  ↓
roleMiddleware
  ↓
controller
```

Public tracking routes should bypass subscription middleware.

---

## 22. Environment Variables

Example `.env`:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:password@postgres:5432/stnk_saas
REDIS_URL=redis://redis:6379

JWT_ACCESS_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
TRACKING_URL=http://localhost:3001/tracking

INVOICE_STORAGE_PATH=./storage/invoices
TENANT_LOGO_STORAGE_PATH=./uploads/tenant-logos

WHATSAPP_PROVIDER=manual
WHATSAPP_API_URL=
WHATSAPP_API_KEY=
```

---

## 23. Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Backend API:

```text
http://localhost:3000/api/v1
```

---

## 24. Docker Development

```bash
docker compose up -d
```

Required containers:

```text
backend
postgres
redis
nginx
```

---

## 25. Available Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
npm run migrate
npm run seed
npm run worker:whatsapp
npm run worker:invoice
```

---

## 26. Database Indexing Strategy

Required indexes:

```sql
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_transactions_branch_id ON transactions(branch_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_invoice_number ON transactions(invoice_number);
CREATE INDEX idx_transactions_tracking_code ON transactions(tracking_code);
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
```

---

## 27. Security Requirements

* Use Helmet
* Enable CORS with allowed origins only
* Hash passwords using bcrypt
* Never expose password_hash
* Never expose internal tenant_id on public tracking
* Never trust tenant_id from frontend request body
* Validate all inputs with Zod/Joi
* Use role-based access control
* Use audit logs for sensitive actions
* Rate limit auth endpoints
* Protect file uploads

---

## 28. File Upload Rules

Tenant logo upload:

* JPG only for MVP
* Max file size should be limited
* Store path in `tenants.logo_url`

Future document upload is not required for MVP.

Document requirements are handled as checklist only.

---

## 29. Export System

Export format:

```text
Excel only
```

Export transaction report fields:

* date
* invoice number
* tenant
* branch
* customer
* plate number
* service type
* estimated total
* final total
* DP
* remaining amount
* refund
* profit
* status

---

## 30. Background Jobs

Recommended jobs:

### Subscription Expiry Job

Runs daily.

Responsibilities:

* check expired subscriptions
* update tenant subscription_status
* queue subscription reminders

### Overdue Transaction Job

Runs daily.

Responsibilities:

* detect overdue transactions
* notify tenant users
* show overdue count on dashboard

### WhatsApp Queue Worker

Runs continuously.

Responsibilities:

* process pending WhatsApp queue
* retry failed messages
* update delivery status

---

## 31. Production Deployment Notes

Recommended VPS setup:

```text
Ubuntu VPS
Docker
Docker Compose
Nginx Reverse Proxy
PostgreSQL Container
Redis Container
Backend Container
```

Recommended production domains:

```text
api.domain.com
admin.domain.com
tracking.domain.com
```

---

## 32. Backup Strategy

Minimum backup requirements:

* daily PostgreSQL dump
* backup invoice PDF storage
* backup tenant logo storage
* keep at least 7 daily backups
* keep monthly backup archive

---

## 33. Development Roadmap

### Phase 1 - MVP Core

* Auth
* Tenant management
* Branch management
* Transaction management
* Payment recording
* PDF invoice generation
* WhatsApp queue
* Public tracking
* Dashboard KPI
* Subscription lock

### Phase 2 - Operational Enhancement

* Excel export
* Notification retry dashboard
* Better audit logs
* Revenue analytics
* Overdue reminders

### Phase 3 - Advanced Features

* Document upload
* OCR
* Payment gateway
* Customer portal
* Advanced analytics
* White label support

---

## 34. Important Business Rules Summary

* One tenant can have many branches
* One transaction can contain many vehicles
* One transaction can contain many services
* Invoice number resets monthly per tenant
* Tenant subscription is manually controlled by super admin
* Expired tenant cannot login
* Public tracking remains active after subscription expiry
* WhatsApp sending must use queue
* PDF invoice generated only in backend
* Payment system supports only DP, final payment, and refund
* No customer debt allowed
* No installment allowed
* Tenant cannot create custom service types
* Super admin manages global service types

---

## 35. Final Architecture Goal

This backend must be:

* scalable for 100+ tenants initially
* ready for 1000+ tenants in the future
* secure by tenant isolation
* maintainable with modular architecture
* simple enough for MVP
* strong enough for financial and operational workflows
* ready for VPS deployment
