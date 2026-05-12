# Frontend — Web Admin Dashboard

Next.js + TypeScript admin dashboard for STNK Bureau Service Management SaaS Platform.

> Full architecture reference: [`Doc/FRONTEND-ARCHITECTURE.md`](../Doc/FRONTEND-ARCHITECTURE.md)

---

## Tech Stack

| Concern | Library |
|:--------|:--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.x |
| Server State | TanStack Query 5 |
| Client State | Zustand 4 |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Charts | Recharts |
| UI Kit | ShadCN UI + Tailwind CSS |

### Architecture Patterns

* Feature-Based Modular Architecture
* Shared UI System
* Multi-Tenant SaaS Architecture
* JWT Authentication with silent refresh
* Role-Based Access Control (SUPER_ADMIN / OWNER / ADMIN)

---

## Multi-Tenant Architecture

Shared-database multi-tenant model. Each tenant (bureau) has isolated data access, custom subscription, pricing, branding, and branch management.

JWT payload contains: `user_id`, `tenant_id`, `branch_id`, `role`.

**Subscription Enforcement:**

* Expired subscription → tenant login blocked (402 response)
* Public tracking page always accessible
* Super Admin can impersonate any tenant

---

## Transaction Lifecycle

```
DRAFT → ON_PROCESS → READY_TO_PICKUP → COMPLETED → CLOSED
```

---

## Security

* JWT authentication with silent 401 retry
* Protected routes via `middleware.ts`
* Role-based access (SUPER_ADMIN / OWNER / ADMIN)
* Tenant isolation enforced server-side
* Subscription expired → 402 response → full-screen modal + auto logout

---

## Dashboard Features

### Super Admin (`/admin/*`)
| Feature | Description |
|:--------|:-----------|
| Tenant Management | Create, edit, activate, suspend tenants |
| Subscriptions | View, renew, monitor expiry |
| Analytics | Platform-wide revenue, branch performance |
| Promotions | Create discount rules per tenant |
| Notification Monitor | WhatsApp queue, retry failed |
| Tracking Monitor | Public tracking analytics |
| Audit Logs | Activity and transaction audit trail |

### Tenant Admin (`/dashboard/*`)
| Feature | Description |
|:--------|:-----------|
| Dashboard | KPIs, revenue summary, active transactions |
| Transactions | Full transaction lifecycle management |
| Customers | Customer and vehicle management |
| Revenue | Branch and service revenue analytics |
| Settings | Branding, WhatsApp, pricing setup |
| Subscription | View plan and renewal info |

---

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: `http://localhost:3001`

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=STNK Bureau Admin
```

---

## Available Scripts

```bash
npm run dev        # Start dev server (port 3001)
npm run build      # Production build
npm start          # Start production server
npm run lint       # ESLint check
npm run typecheck  # TypeScript type check
```
```

---

## Available Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
```

---

## Folder Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (public)/
│   │   └── tracking/[trackingCode]/page.tsx
│   ├── (dashboard)/                    # Tenant admin routes
│   │   ├── layout.tsx                  # Dashboard layout + auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── transactions/[id]/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── vehicles/page.tsx
│   │   ├── branches/page.tsx
│   │   ├── revenue/page.tsx
│   │   ├── settings/page.tsx
│   │   └── subscription/page.tsx
│   ├── (admin)/                        # Super admin routes
│   │   ├── layout.tsx                  # Admin layout + SUPER_ADMIN guard
│   │   ├── page.tsx                    # Admin landing
│   │   ├── tenants/page.tsx
│   │   ├── tenants/[id]/page.tsx
│   │   ├── subscriptions/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── promotions/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── tracking/page.tsx
│   │   ├── audit/page.tsx
│   │   └── monitoring/page.tsx
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Redirect to /login
│   └── providers.tsx                   # TanStack Query + Auth provider
│
├── modules/                            # Feature-based modules
│   ├── auth/
│   │   ├── components/LoginForm.tsx
│   │   ├── hooks/useAuth.ts
│   │   ├── services/auth.service.ts
│   │   ├── schemas/login.schema.ts
│   │   └── types/index.ts
│   ├── dashboard/
│   ├── tenants/
│   ├── subscriptions/
│   ├── branches/
│   ├── transactions/
│   ├── customers/
│   ├── vehicles/
│   ├── analytics/
│   ├── promotions/
│   ├── notifications/
│   ├── tracking/
│   ├── monitoring/
│   ├── audit/
│   └── settings/
│
├── shared/
│   ├── components/
│   │   ├── layout/          # Sidebar, Navbar, PageWrapper
│   │   ├── forms/           # FormField, Select, DatePicker
│   │   ├── tables/          # DataTable, Pagination
│   │   ├── modals/          # Modal, ConfirmDialog
│   │   ├── cards/           # KpiCard, StatCard
│   │   └── charts/          # RevenueChart, BarChart
│   ├── hooks/               # useDebounce, usePagination
│   ├── services/
│   │   └── api.ts           # Centralized Axios instance + interceptors
│   ├── store/               # Shared Zustand stores
│   ├── utils/               # format.ts, date.ts
│   ├── validators/          # Common Zod schemas
│   ├── constants/           # API endpoints, status maps
│   └── types/               # Shared TypeScript interfaces
│
├── store/
│   ├── authStore.ts         # Auth state (user, token, refresh)
│   └── uiStore.ts           # UI state (toast, loading)
│
├── styles/                  # Global styles
├── assets/                  # Static assets
└── middleware.ts            # Next.js route protection
```

---

### Module Internal Structure

Each module under `modules/` follows this pattern:

```text
modules/[feature]/
├── components/     # Feature-specific UI components
├── hooks/          # TanStack Query hooks (useQuery/useMutation)
├── services/       # API service functions
├── schemas/        # Zod validation schemas
└── types/          # Feature TypeScript interfaces
```

---

## API Reference

Base URL: `/api/v1`

### Response Envelope

```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
{ "success": false, "message": "...", "errors": [] }
```

### Key Endpoints

```http
POST /auth/login
POST /auth/refresh
POST /auth/logout

GET  /admin/tenants
POST /admin/tenants
GET  /admin/tenants/:id
PATCH /admin/tenants/:id/status

GET  /transactions
POST /transactions
GET  /transactions/:id
PATCH /transactions/:id/status

GET  /customers
POST /customers
GET  /analytics/revenue
GET  /analytics/branches

GET  /notifications/queue
POST /notifications/retry/:id
GET  /tracking/:trackingCode      # Public - no auth required
GET  /audit-logs
```

All protected endpoints require: `Authorization: Bearer <token>`

Token refresh is handled automatically by the Axios interceptor on `401` responses.

---

## State Management

| State Type | Tool | Examples |
|:-----------|:-----|:---------|
| Server data | TanStack Query | Transactions, Tenants, KPIs |
| Auth session | Zustand `authStore` | User, Token, Role |
| UI state | Zustand `uiStore` | Toast, Loading |
| Form state | React Hook Form | Input values, validation |
| URL params | Router | Filters, Pagination, Search |

### Query Key Standards

```typescript
['admin-dashboard']
['tenants']
['tenants', id]
['transactions']
['transactions', id]
['subscriptions']
```

---

## Data Flow

```
UI Component
    ↓
Custom Hook  (useQuery / useMutation)
    ↓
Service Layer  (modules/[feature]/services/*.service.ts)
    ↓
Axios Instance  (shared/services/api.ts — interceptors, auth, error handling)
    ↓
Backend REST API  (/api/v1/*)
```

