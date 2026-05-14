# Frontend Admin Audit
> Source of truth: `Doc/API_CONTRACT.md`, `backend/README.md`
> Audited: 2026-05-14

---

## Architecture

| Item | Status |
|------|--------|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict-ish) |
| State | Zustand + TanStack Query |
| API Client | `src/shared/services/api.ts` (Axios) |
| Auth storage | localStorage (`auth_token`, `refresh_token`) + cookie (`auth_token`) |
| Auth guard | `src/middleware.ts` reads cookie + redirects unauthenticated |

---

## Route Structure

### Available Routes (14 build routes)

| Route | Role | Status |
|-------|------|--------|
| `/` | All | ✅ |
| `/(auth)/login` | Guest | ✅ |
| `/(admin)/admin/dashboard` | SUPER_ADMIN | ✅ |
| `/(admin)/admin/tenants` | SUPER_ADMIN | ✅ |
| `/(admin)/admin/tenants/[id]` | SUPER_ADMIN | ❌ Page does not exist |
| `/(admin)/admin/subscriptions` | SUPER_ADMIN | ✅ |
| `/(admin)/admin/promotions` | SUPER_ADMIN | ⚠️ Stub only |
| `/(admin)/admin/notifications` | SUPER_ADMIN | ⚠️ Stub only |
| `/(admin)/admin/audit` | SUPER_ADMIN | ⚠️ Stub only |
| `/(admin)/admin/tracking` | SUPER_ADMIN | ❌ Sidebar link, no page |
| **`/dashboard`** | OWNER/ADMIN | ❌ **MISSING — 404 after login** |
| **`/dashboard/*`** | OWNER/ADMIN | ❌ **All missing** |

### Expected Tenant Dashboard Routes (NOT BUILT)

Per `backend/README.md` the following pages are expected for `OWNER`/`ADMIN`/`STAFF` roles:

```
/dashboard                    → Overview KPIs
/dashboard/transactions       → Transaction list
/dashboard/transactions/[id]  → Transaction detail
/dashboard/customers          → Customer list
/dashboard/vehicles           → Vehicle list
/dashboard/branches           → Branch list
/dashboard/revenue            → Revenue analytics
/dashboard/settings           → Tenant profile settings
/dashboard/subscription       → Subscription status
```

**Impact**: Every non-super-admin user gets a 404 immediately after login. The frontend is incomplete for ~90% of intended users.

---

## Auth Flow Audit

### Login → Redirect
- `POST /auth/login` called with `{ email, password }` ✅
- On success: sets `auth_token` in localStorage and `auth_token` cookie ✅  
- Redirects by role:
  - `SUPER_ADMIN` → `/admin/dashboard` ✅  
  - `OWNER` / `ADMIN` / `STAFF` → `/dashboard` ❌ (route doesn't exist)

### Protected Routes (Middleware)
- `src/middleware.ts` checks cookie `auth_token` ✅
- Routes `/admin/*` protected; non-admin roles are NOT redirected to tenant routes in middleware ⚠️
- No role-based guard in middleware — relies on page-level layout guard

### Token Refresh
- On 401: `axios` interceptor calls `authStore.refreshSession()` ✅
- `refreshSession()` uses `POST /auth/refresh` with `refreshToken` from localStorage ✅
- **Bug**: `refreshSession()` updates localStorage but does NOT update the cookie  
  → Next request from server-side or middleware still sees old cookie ❌
- **Bug**: Multiple concurrent 401s will fire multiple `refreshSession()` calls (no pending queue) ❌
  → Mobile `api-client.ts` has the correct queue-based pattern; should be ported to frontend

---

## API Client Audit (`src/shared/services/api.ts`)

| Check | Status |
|-------|--------|
| Base URL from `NEXT_PUBLIC_API_URL` env | ✅ |
| Auth header attached from localStorage | ✅ |
| 401 interceptor triggers refresh | ✅ |
| Concurrent 401 pending queue | ❌ Missing |
| Cookie updated after refresh | ❌ Missing |
| 402 sets `subscriptionExpired` flag | ✅ |
| Subscription expired UI shown to user | ❌ Flag set but nothing renders |

---

## Module Audit

### Wired and Functional
- **Tenants**: List, CRUD, subscription assignment — ✅
- **Auth**: Login, logout, role-based redirect — ✅ (redirect target broken for tenant roles)
- **Dashboard (admin)**: KPI cards — ✅ wired to `GET /dashboard/admin`
- **Subscriptions**: List, create, assign — ✅
- **Transactions**: List at admin level — ✅

### Stub Pages (Hooks Exist, Pages Not Wired)

| Page | Hook Available | Status |
|------|---------------|--------|
| `/admin/audit` | `useAuditLogs()` in `modules/audit/hooks/useAuditLogs.ts` | ⚠️ Stub — renders EmptyState |
| `/admin/notifications` | `useNotificationQueue()` in `modules/notifications/hooks/` | ⚠️ Stub — renders EmptyState |
| `/admin/promotions` | Unknown | ⚠️ Stub — renders EmptyState |

### Missing Pages (No File Exists)

| Route | Needed |
|-------|--------|
| `/admin/tracking` | Sidebar link points here — 404 |
| `/admin/tenants/[id]` | Tenant detail view |
| All `/dashboard/*` | Entire tenant-facing interface |

---

## TypeScript Audit

- Typecheck result: ✅ **0 errors**
- Build result: ✅ **Successful**
- Lint result: ✅ **0 warnings**

### Missing Types in `shared/types/index.ts`

These types exist in backend schema and are used in mobile but absent from frontend:
- `Vehicle` (only `VehicleFormData` exists)
- `ServiceType`
- `PricingRule`
- `TransactionItem`
- `TransactionLog`
- `NotificationQueue`
- `AuditLog`

---

## Environment Variables

| Variable | Used | Docs |
|----------|------|------|
| `NEXT_PUBLIC_API_URL` | ✅ | `Doc/ENVIRONMENT_SETUP.md` |
| `NEXTAUTH_SECRET` | Not used (no NextAuth) | — |
| `NEXT_PUBLIC_APP_ENV` | Not used | — |

---

## Issues Summary

| # | Severity | Issue |
|---|---------|-------|
| FRONTEND-001 | P1 🔴 | Tenant dashboard routes entirely missing — OWNER/ADMIN get 404 |
| FRONTEND-002 | P2 🟠 | `/admin/audit` page is a stub — hook exists |
| FRONTEND-003 | P2 🟠 | `/admin/notifications` page is a stub — hook exists |
| FRONTEND-004 | P2 🟠 | `/admin/tracking` page missing — sidebar link broken |
| FRONTEND-005 | P2 🟠 | `/admin/tenants/[id]` detail page missing |
| FRONTEND-006 | P2 🟠 | Subscription expired: 402 sets flag but no UI blocks the user |
| FRONTEND-007 | P3 🟡 | `authStore.refreshSession()` doesn't update cookie |
| FRONTEND-008 | P3 🟡 | No concurrent-401 queue in api.ts (race condition on multiple 401s) |
| FRONTEND-009 | P3 🟡 | Missing `Vehicle`, `ServiceType`, `PricingRule`, `TransactionItem` types |
