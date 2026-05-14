# Integration Notes — STNK Bureau SaaS

> Source of truth: `backend/README.md` and `frontend/README.md`  
> Last audit: 2026-05-12

---

## 1. Architecture Overview

```
Browser / Next.js (port 3001)
  └── Axios (shared/services/api.ts)  — JWT Bearer + silent 401 retry
        └── Nginx reverse proxy (port 80)
              └── Express API (port 3000) — /api/v1/*
                    └── PostgreSQL + Redis (BullMQ queue)
```

The frontend and backend share a **single Axios instance** with:
- Request interceptor → attaches `Authorization: Bearer <accessToken>` from Zustand store
- Response interceptor → on 401: attempts silent refresh via `POST /auth/refresh`, retries; on 402: sets `subscriptionExpired = true` in store

---

## 2. Auth / Login / Refresh Token Flow

### Login sequence

```
POST /auth/login  { email, password }
  → 200: { success, message, data: { accessToken, refreshToken, expiresIn, user } }
  → 401: invalid credentials
  → 402: tenant subscription expired / suspended
```

Frontend stores:
- `localStorage.token` + cookie `token` — for middleware.ts route guard
- `localStorage.refreshToken` — for silent refresh
- `localStorage.user` — for hydration on reload
- Zustand `authStore` — in-memory runtime state

### Silent refresh sequence

```
API call → 401
  → POST /auth/refresh  { refreshToken }
  → 200: { success, message, data: { accessToken, refreshToken, expiresIn, user } }
  → Retry original request with new token
  → If refresh fails → logout() + redirect to /login
```

Backend: `POST /auth/refresh` validates the refresh token (JWT signed with `JWT_REFRESH_SECRET`), returns fresh token pair. No Redis blocklist in MVP — logout is client-side only (token discarded).

### Subscription expired (402) handling

- On **login**: backend returns 402 if tenant's `subscriptionStatus != 'ACTIVE'` or `subscriptionEnd < now`
- On **API call**: `subscriptionMiddleware` returns 402 for expired/suspended tenants
- Frontend interceptor catches 402 → `setSubscriptionExpired(true)` → UI shows full-screen modal
- SUPER_ADMIN bypasses subscription check entirely (both at login and in middleware)

---

## 3. Protected Route Behaviour

`frontend/src/middleware.ts` (Next.js edge middleware):

| Path pattern | Behaviour |
|---|---|
| `/login`, `/forgot-password` | Public — no token required |
| `/tracking/*` | Public — no token required |
| All other paths | Require cookie `token`; redirect to `/login?redirect=<path>` if missing |

Role-based routing after login (in `LoginPage`):
- `SUPER_ADMIN` → `/admin`
- `OWNER` / `ADMIN` → `/dashboard`

Backend role enforcement:
- Tenant routes: `SUPER_ADMIN` only
- Audit logs: `SUPER_ADMIN` or `OWNER`
- Dashboard tenant: `OWNER` / `ADMIN` with valid subscription
- Dashboard admin: `SUPER_ADMIN` only

---

## 4. Tenant / Subscription Rules

| Rule | Backend implementation |
|---|---|
| Tenant isolation | `tenant_id` always taken from `req.user.tenant_id` (JWT) — never from request body |
| Subscription check | `subscriptionMiddleware` runs after `authMiddleware` on all protected tenant routes |
| Expired subscription at login | 402 in `AuthService.login` |
| Expired subscription on API | 402 in `subscriptionMiddleware` |
| Public tracking bypass | `tracking.routes.ts` has no auth middleware |
| SUPER_ADMIN bypass | `subscriptionMiddleware` calls `next()` immediately for SUPER_ADMIN |
| Impersonation | `POST /tenants/:id/impersonate` → returns short-lived token for tenant OWNER |

---

## 5. Transaction API Integration

### List transactions
```
GET /transactions?page=1&limit=20&search=B1234&status=ON_PROCESS&branchId=&start_date=&end_date=&sort=created_at:desc
```
Frontend: `transactionService.list(filters)` → returns `{ data: Transaction[], meta: ApiMeta }`

### Create transaction
```
POST /transactions
Body: { customerId, branchId?, estimatedFinishDate?, notes?, items: [{ vehicleId, serviceTypeId, price, notes? }] }
→ 201: { success, message, data: Transaction }
```

### Status transitions
```
PATCH /transactions/:id/status  { status, notes? }
```
Valid transitions per `STATUS_TRANSITIONS` constant on backend:
- `DRAFT` → `ON_PROCESS`
- `ON_PROCESS` → `READY_TO_PICKUP`
- `READY_TO_PICKUP` → `COMPLETED`
- `COMPLETED` → `CLOSED`

### Finalize
```
POST /transactions/:id/finalize  { finalTotal, notes? }
```
Sets `finalTotal`, calculates `remainingAmount = finalTotal - dpAmount`.

### Close
```
POST /transactions/:id/close
```
Validates full payment (no remaining balance) before closing.

### Invoice PDF
```
GET /transactions/:id/invoice
→ Content-Type: application/pdf (file download)
```

---

## 6. Payment Integration

Payments are nested under transactions:
```
GET  /transactions/:id/payments
POST /transactions/:id/payments  { type: DP|FINAL_PAYMENT|REFUND, method: CASH, amount, notes? }
```

Rules (from README):
- No payment gateway — cash only in MVP
- Payment records are append-only (no update/delete)
- Transaction can only be CLOSED when `remainingAmount == 0`
- REFUND is allowed if `finalTotal < estimatedTotal`

---

## 7. Public Tracking Page

Endpoint: `GET /tracking/:trackingCode` — **no auth required**

Frontend: `tracking.service.ts` → `trackingService.getByCode(code)` → `r.data.data`

Response includes: tenant branding (name, logoUrl), branch info, customer name, transaction status, items (vehicle + service), payments, timeline (status change log), estimatedFinishDate.

**Security note**: `tenant_id` is never exposed in the public tracking response.

Tracking remains active even if tenant subscription expires — tracking routes bypass `subscriptionMiddleware`.

---

## 8. Dashboard KPI Endpoints

| Endpoint | Audience | Fields returned |
|---|---|---|
| `GET /dashboard/tenant` | OWNER / ADMIN | revenueToday, monthlyRevenue, totalRefund, activeTransactions, readyPickupCount, closedToday, overdueTransactions |
| `GET /dashboard/admin` | SUPER_ADMIN | totalTenants, activeTenants, expiredSubscriptions, totalTransactions, platformMonthlyRevenue, whatsappQueuePending |
| `GET /dashboard/branch/:branchId` | OWNER / ADMIN | same fields as tenant but filtered by branch |

Frontend hooks: `useAdminDashboard()`, `useTenantDashboard()`, `useBranchDashboard(branchId)` in `modules/dashboard/hooks/useDashboard.ts`.

---

## 9. Notification Queue Monitoring

```
GET  /notifications/queue?status=PENDING&page=1&limit=20
POST /notifications/:id/retry
```

- SUPER_ADMIN sees all tenants' queues
- OWNER/ADMIN sees their own tenant's queue only
- Retry resets `status = PENDING` and `attempts = 0`

Frontend: `subscriptionMiddleware` is applied — expired tenants cannot access notification queue.

---

## 10. Audit Log Page

```
GET /audit-logs?entity=TRANSACTION&action=STATUS_CHANGE&page=1&limit=20
```

- Accessible to `SUPER_ADMIN` and `OWNER` only
- SUPER_ADMIN sees all tenants' logs
- OWNER sees their own tenant's logs only

Frontend: Build an audit log table using `AuditLog` type from `shared/types/index.ts`.

---

## 11. Export Endpoints

```
GET /exports/transactions?start_date=&end_date=&status=&branch_id=&tenant_id=
→ Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
→ Disposition: attachment; filename=transactions.xlsx

GET /exports/revenue?start_date=&end_date=
→ JSON: { totalRevenue, totalDp, totalRefund, transactionCount }
```

SUPER_ADMIN can filter by `tenant_id`. Tenant OWNER/ADMIN sees their own data only.
Frontend analytics service maps to these endpoints — see `modules/analytics/services/analytics.service.ts`.

---

## 12. Response Envelope Standard

All backend responses use the standard envelope (from `shared/utils/response.ts`):

```json
{ "success": true, "message": "Success", "data": {}, "meta": {} }
{ "success": false, "message": "Validation error", "errors": [] }
```

**Frontend services must always extract `r.data.data`** (axios response body → envelope → inner data).
Services using `r.data.data` pattern: all except the `auth.service.ts` which uses `const { data } = await api.post(...)` then `data.data`.

---

## 13. Bugs Fixed in This Audit

| # | Location | Bug | Fix |
|---|---|---|---|
| 1 | `backend/auth/auth.service.ts` | Subscription expired threw 403 | Changed to 402 |
| 2 | `backend/shared/middleware/auth.middleware.ts` | subscriptionMiddleware returned 403 for expired | Changed to 402 |
| 3 | `frontend/shared/types/index.ts` | `LoginResponse` had `token` field | Updated to `accessToken`, `refreshToken`, `expiresIn` |
| 4 | `frontend/shared/types/index.ts` | `User` missing `tenantId` field | Added `tenantId: string` |
| 5 | `frontend/shared/types/index.ts` | `CreateTenantDTO` had `subscriptionEnd` | Updated to match backend schema (`subscriptionMonths`, `ownerName`, etc.) |
| 6 | `frontend/shared/types/index.ts` | `Tenant` had `status` field | Renamed to `subscriptionStatus`; added `isActive`, `phone`, `address` |
| 7 | `frontend/shared/types/index.ts` | `DashboardKpis` / `AdminKpis` incomplete | Added all fields returned by backend |
| 8 | `frontend/modules/auth/services/auth.service.ts` | Returned full envelope as `LoginResponse` | Unwrap with `data.data` |
| 9 | `frontend/modules/auth/hooks/useAuth.ts` | Used `data.token` (undefined) | Changed to `data.accessToken`; now stores `refreshToken` |
| 10 | `frontend/store/authStore.ts` | `refreshSession` sent `refresh_token` (snake_case) | Changed to `refreshToken` (camelCase) |
| 11 | `frontend/store/authStore.ts` | `refreshSession` read `data.access_token` | Changed to `data.data.accessToken`; updates `refreshToken` in state |
| 12 | `frontend/modules/dashboard/services/dashboard.service.ts` | Called `/admin/dashboard` | Changed to `/dashboard/admin` |
| 13 | `frontend/modules/transactions/services/transaction.service.ts` | Returned full envelope as `Transaction[]` | Proper unwrap; added full CRUD; added `PaginatedTransactions` type |
| 14 | `frontend/modules/tenants/services/tenant.service.ts` | Called `/admin/tenants` (wrong prefix) | Changed to `/tenants`; fixed `create` to use `/auth/register-tenant`; fixed `updateSubscription` to use `PATCH /tenants/:id/status` |
| 15 | `frontend/modules/subscriptions/services/subscription.service.ts` | Called `/admin/subscriptions` (non-existent) | Mapped to `/tenants` list + `PATCH /tenants/:id/status` |
| 16 | `frontend/modules/analytics/services/analytics.service.ts` | Called `/analytics/revenue` (non-existent) | Mapped to `/exports/revenue` and `/dashboard/*` endpoints |
