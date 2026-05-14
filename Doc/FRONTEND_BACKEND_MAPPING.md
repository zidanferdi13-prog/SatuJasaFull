# Frontend ↔ Backend Mapping — STNK Bureau SaaS

> Traces each frontend feature to its backend endpoint, service file, and hook.

---

## Authentication

| Frontend | Backend |
|---|---|
| `modules/auth/services/auth.service.ts` → `login()` | `POST /auth/login` |
| `modules/auth/services/auth.service.ts` → `refresh()` | `POST /auth/refresh` |
| `modules/auth/services/auth.service.ts` → `logout()` | `POST /auth/logout` |
| `modules/auth/services/auth.service.ts` → `me()` | `GET /auth/me` |
| `modules/auth/hooks/useAuth.ts` → `useLogin()` | stores `accessToken` + `refreshToken` in Zustand + localStorage + cookie |
| `modules/auth/hooks/useAuth.ts` → `useLogout()` | calls logout API + clears Zustand + localStorage |
| `store/authStore.ts` → `refreshSession()` | `POST /auth/refresh` (silent retry on 401) |
| `app/(auth)/login/page.tsx` | `/login` page — calls `useLogin()` |
| `middleware.ts` | Edge route guard — checks `token` cookie |

---

## Tenants (Super Admin)

| Frontend | Backend |
|---|---|
| `modules/tenants/services/tenant.service.ts` → `list()` | `GET /tenants` |
| `modules/tenants/services/tenant.service.ts` → `getById()` | `GET /tenants/:id` |
| `modules/tenants/services/tenant.service.ts` → `create()` | `POST /auth/register-tenant` |
| `modules/tenants/services/tenant.service.ts` → `update()` | `PUT /tenants/:id` |
| `modules/tenants/services/tenant.service.ts` → `updateStatus()` | `PATCH /tenants/:id/status` |
| `modules/tenants/services/tenant.service.ts` → `impersonate()` | `POST /tenants/:id/impersonate` |
| `app/(admin)/tenants/page.tsx` | Tenant list |
| `app/(admin)/tenants/[id]/page.tsx` | Tenant detail |

---

## Subscriptions (Super Admin)

Subscription data lives on the `Tenant` model. There is no separate `/subscriptions` resource.

| Frontend | Backend |
|---|---|
| `modules/subscriptions/services/subscription.service.ts` → `list()` | `GET /tenants` (with limit=100) |
| `modules/subscriptions/services/subscription.service.ts` → `renew()` | `PATCH /tenants/:id/status` → `{ subscriptionEnd, subscriptionStatus: 'ACTIVE' }` |
| `modules/subscriptions/services/subscription.service.ts` → `suspend()` | `PATCH /tenants/:id/status` → `{ subscriptionStatus: 'SUSPENDED' }` |
| `app/(admin)/subscriptions/page.tsx` | Subscription list |

---

## Branches

| Frontend | Backend |
|---|---|
| `modules/branches/services/branch.service.ts` → `list()` | `GET /branches` (tenant_id from JWT) |
| `modules/branches/services/branch.service.ts` → `listByTenant()` | ⚠️ See TODO_INTEGRATION.md — no `/admin/tenants/:id/branches` endpoint |
| `app/(dashboard)/branches/page.tsx` | Branch list |

---

## Customers

| Frontend | Backend |
|---|---|
| `modules/customers/services/customer.service.ts` → `list()` | `GET /customers` |
| `modules/customers/services/customer.service.ts` → `getById()` | `GET /customers/:id` |
| `modules/customers/services/customer.service.ts` → `create()` | `POST /customers` |
| `modules/customers/services/customer.service.ts` → `update()` | `PUT /customers/:id` |
| `modules/customers/services/customer.service.ts` → `search()` | `GET /customers?search=` |
| `app/(dashboard)/customers/page.tsx` | Customer list |

---

## Transactions

| Frontend | Backend |
|---|---|
| `modules/transactions/services/transaction.service.ts` → `list(filters)` | `GET /transactions?...` |
| `modules/transactions/services/transaction.service.ts` → `getById()` | `GET /transactions/:id` |
| `modules/transactions/services/transaction.service.ts` → `create()` | `POST /transactions` |
| `modules/transactions/services/transaction.service.ts` → `updateStatus()` | `PATCH /transactions/:id/status` |
| `modules/transactions/services/transaction.service.ts` → `finalize()` | `POST /transactions/:id/finalize` |
| `modules/transactions/services/transaction.service.ts` → `close()` | `POST /transactions/:id/close` |
| `modules/transactions/services/transaction.service.ts` → `getInvoiceUrl()` | `GET /transactions/:id/invoice` (PDF) |
| `modules/transactions/hooks/useTransactions.ts` → `useTransactions(filters)` | Returns `{ data: Transaction[], meta: ApiMeta }` |
| `modules/transactions/hooks/useTransactions.ts` → `useTransaction(id)` | Single transaction |
| `modules/transactions/hooks/useTransactions.ts` → `useCreateTransaction()` | Mutation + invalidates list |
| `modules/transactions/hooks/useTransactions.ts` → `useUpdateTransactionStatus()` | Mutation + invalidates list + detail |
| `app/(dashboard)/transactions/page.tsx` | Transaction list |
| `app/(dashboard)/transactions/[id]/page.tsx` | Transaction detail |

---

## Payments (within transaction detail)

| Frontend | Backend |
|---|---|
| *(to be implemented in transaction detail page)* | `GET /transactions/:id/payments` |
| *(mutation)* | `POST /transactions/:id/payments` |

---

## Dashboard / KPIs

| Frontend | Backend |
|---|---|
| `modules/dashboard/services/dashboard.service.ts` → `getAdminKpis()` | `GET /dashboard/admin` (SUPER_ADMIN) |
| `modules/dashboard/services/dashboard.service.ts` → `getTenantKpis()` | `GET /dashboard/tenant` (OWNER/ADMIN) |
| `modules/dashboard/services/dashboard.service.ts` → `getBranchKpis(id)` | `GET /dashboard/branch/:branchId` |
| `modules/dashboard/hooks/useDashboard.ts` → `useAdminDashboard()` | Auto-refreshes every 30s |
| `modules/dashboard/hooks/useDashboard.ts` → `useTenantDashboard()` | Auto-refreshes every 30s |
| `modules/dashboard/hooks/useDashboard.ts` → `useBranchDashboard(id)` | Auto-refreshes every 30s |
| `app/(admin)/page.tsx` | Super admin landing |
| `app/(dashboard)/dashboard/page.tsx` | Tenant KPI dashboard |

---

## Analytics / Revenue

| Frontend | Backend |
|---|---|
| `modules/analytics/services/analytics.service.ts` → `getRevenueSummary()` | `GET /exports/revenue` |
| `modules/analytics/services/analytics.service.ts` → `getAdminSnapshot()` | `GET /dashboard/admin` |
| `modules/analytics/services/analytics.service.ts` → `getTenantSnapshot()` | `GET /dashboard/tenant` |
| `modules/analytics/services/analytics.service.ts` → `getBranchKpis()` | `GET /dashboard/branch/:branchId` |
| `app/(admin)/analytics/page.tsx` | Platform analytics |
| `app/(dashboard)/revenue/page.tsx` | Tenant revenue |

---

## Notifications

| Frontend | Backend |
|---|---|
| *(to be implemented)* | `GET /notifications/queue?status=&page=&limit=` |
| *(mutation)* | `POST /notifications/:id/retry` |
| `app/(admin)/notifications/page.tsx` | Admin notification monitor |

---

## Audit Logs

| Frontend | Backend |
|---|---|
| *(to be implemented)* | `GET /audit-logs?entity=&action=&page=&limit=` |
| `app/(admin)/audit/page.tsx` | Super admin audit trail |

---

## Tracking (Public)

| Frontend | Backend |
|---|---|
| `modules/tracking/services/tracking.service.ts` → `getByCode()` | `GET /tracking/:trackingCode` |
| `app/(public)/tracking/[trackingCode]/page.tsx` | Public tracking page |

---

## Export

| Frontend | Backend |
|---|---|
| *(direct link/window.open)* | `GET /exports/transactions?...` → XLSX download |
| `modules/analytics/services/analytics.service.ts` → `getRevenueSummary()` | `GET /exports/revenue` → JSON |
| `app/(admin)/analytics/page.tsx` | Provides export button |

---

## Settings / Service Types / Pricing

| Frontend | Backend |
|---|---|
| *(to be implemented)* | `GET/POST /service-types`, `PATCH /service-types/:id/status` |
| *(to be implemented)* | `GET/POST/PUT /pricing-rules` |
| `app/(dashboard)/settings/page.tsx` | Tenant settings |

---

## JWT Payload → Frontend Store Mapping

| JWT field | Frontend `User` field | Usage |
|---|---|---|
| `user_id` | `id` | Identify current user |
| `tenant_id` | `tenantId` | Passed in JWT only; never in request body |
| `branch_id` | `branchId` | Filter branch-scoped views |
| `role` | `role` | Route guard + UI branching |
| `tenant_code` | `tenantCode` | Display + invoice prefix context |

Backend adds `tenantName` to the auth response user object (not in JWT).

---

## TanStack Query Key Conventions

| Key | Description |
|---|---|
| `['admin-dashboard']` | Admin KPI data |
| `['tenant-dashboard']` | Tenant KPI data |
| `['branch-dashboard', branchId]` | Branch KPI data |
| `['transactions', filters]` | Transaction list (with filter object) |
| `['transactions', id]` | Single transaction detail |
| `['tenants', filters]` | Tenant list |
| `['tenants', id]` | Single tenant |
| `['customers']` | Customer list |
| `['branches']` | Branch list |
| `['notifications']` | WhatsApp queue |
| `['audit-logs']` | Audit log list |
