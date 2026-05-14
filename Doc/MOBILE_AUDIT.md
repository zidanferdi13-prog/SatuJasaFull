# Mobile App Audit
> Source of truth: `Doc/API_CONTRACT.md`, `backend/README.md`
> Audited: 2026-05-14

---

## Architecture

| Item | Status |
|------|--------|
| Framework | Expo SDK ~50 + expo-router v3 |
| Language | TypeScript strict mode |
| State | Zustand + TanStack Query |
| API Client | `src/shared/services/api-client.ts` (Axios + queue-based 401 handling) |
| Auth storage | AsyncStorage via `src/shared/services/storage.ts` |
| Path alias | `@/` → `src/` |

---

## Auth Flow Audit

### Login
- POST `/auth/login` with `{ email, password }` ✅ (fixed in this audit — was `phone`)
- Stores `accessToken` + `refreshToken` in AsyncStorage ✅
- Sets user object in Zustand store ✅
- Redirects to `/(tabs)/dashboard` ✅

### Token Refresh (api-client.ts)
- On 401: queues pending requests, calls `POST /auth/refresh` once ✅
- On success: retries all queued requests ✅
- On failure: clears auth, redirects to `/(auth)/login` ✅
- **Best practice pattern** — identical to mobile should be ported to frontend admin

### Logout
- Calls `POST /auth/logout` ✅
- Clears AsyncStorage ✅
- Redirects to `/(auth)/login` ✅

---

## Screen → Endpoint Mapping

| Screen | Endpoint(s) | Status |
|--------|------------|--------|
| `(auth)/login` | `POST /auth/login` | ✅ Fixed (was phone→email) |
| `(tabs)/dashboard` | `GET /dashboard/tenant` or `GET /dashboard/branch/:branchId` | ✅ |
| `(tabs)/revenue` | `GET /exports/revenue` | ✅ Fixed (was `/dashboard/revenue`) |
| `(tabs)/transactions` | `GET /transactions` | ✅ |
| `transactions/[id]/index` | `GET /transactions/:id` | ✅ |
| `transactions/create` | `POST /transactions` | ✅ Fixed (`estimatedPrice` → `price`) |
| `transactions/[id]/finalize` | `POST /transactions/:id/finalize` | ✅ Fixed (removed `items` array) |
| `transactions/[id]/payments` | `GET /transactions/:id/payments`, `POST /transactions/:id/payments` | ✅ |
| `transactions/[id]/status` | `PATCH /transactions/:id/status` | ✅ |
| `customers/index` | `GET /customers` | ✅ |
| `customers/[id]` | `GET /customers/:id`, `PUT /customers/:id` | ✅ |
| `vehicles/index` | `GET /vehicles` | ✅ |
| `vehicles/[id]` | `GET /vehicles/:id`, `PUT /vehicles/:id` | ✅ |
| `branches/index` | `GET /branches` | ✅ |
| `(tabs)/settings` → tenant profile | `GET /tenants/me` → **should be** `GET /tenants/:id` | ❌ Broken |
| `(tabs)/settings` → logo upload | `POST /tenants/me/logo` → **should be** `POST /tenants/:id/logo` | ❌ Broken |
| `(tabs)/settings` → subscription | `GET /tenants/me/subscription` → **no equivalent** | ❌ Missing endpoint |
| Tracking search | `GET /tracking/search?q=` → **not in API contract** | ⚠️ Unconfirmed |
| Public tracking | `GET /tracking/:trackingCode` | ✅ |

---

## Type Audit (`src/shared/types/index.ts`)

### Fixed in This Audit

| Type | Before | After |
|------|--------|-------|
| `LoginPayload.phone` | `phone: string` | `email: string` ✅ |
| `DashboardKpi.refundTotal` | `refundTotal?: number` | `totalRefund: number` ✅ |
| `DashboardKpi.totalProfit` | `totalProfit?: number` | **Removed** ✅ |
| `DashboardKpi.closedToday` | Missing | `closedToday: number` ✅ |
| `DashboardKpi.overdueTransactions` | `overdueTransactions?: number` | `overdueTransactions: number` ✅ |
| `RevenueSummary.refundTotal` | `refundTotal: number` | `totalRefund: number` ✅ |
| `RevenueSummary.closedTransactions` | `closedTransactions: number` | `transactionCount: number` ✅ |
| `RevenueSummary.totalDp` | Missing | `totalDp: number` ✅ |
| `RevenueSummary.totalProfit` | `totalProfit: number` | **Removed** ✅ |
| `Tenant.subscriptionStatus` | Missing | `subscriptionStatus: 'ACTIVE' \| 'SUSPENDED' \| 'EXPIRED'` ✅ |
| `CreateTransactionPayload.items[].estimatedPrice` | `estimatedPrice` | `price` ✅ |
| `FinalizePayload.items` | `items: {id,finalPrice}[]` | **Removed** ✅ |

### Remaining Known Issues

| Type | Issue |
|------|-------|
| `PaginatedMeta.totalPages` | API returns `total_pages` (snake_case), mobile uses `totalPages` (camelCase) |

---

## Services Audit

| Service | Issues |
|---------|--------|
| `auth.service.ts` | ✅ Clean |
| `transaction.service.ts` | ✅ Fixed in audit |
| `dashboard.service.ts` | ✅ Fixed in audit |
| `customer.service.ts` | ✅ Not audited deeply — assumed aligned |
| `vehicle.service.ts` | ✅ Not audited deeply |
| `branch.service.ts` | ✅ Not audited deeply |
| `settings.service.ts` | ❌ Calls `/tenants/me`, `/tenants/me/logo`, `/tenants/me/subscription` — none exist |

---

## Navigation Audit

### Route Groups
- `(auth)`: login screen ✅
- `(tabs)`: main tab navigator ✅
- `transactions/`: stack routes for transaction flows ✅
- `customers/`, `vehicles/`, `branches/`: entity detail stacks ✅

### Orphan File (Fixed)
- `src/app/settings.tsx`: **deleted** in this audit — was duplicate of `(tabs)/settings.tsx`

---

## TypeScript & Lint

| Check | Before Audit | After Audit |
|-------|-------------|-------------|
| `npx tsc --noEmit` | ✅ 0 errors | ✅ 0 errors |
| ESLint | ❌ No config file | ✅ `.eslintrc.js` created |

---

## Issues Summary

| # | Severity | Issue | Status |
|---|---------|-------|--------|
| MOBILE-001 | P1 🔴 | Login sends `phone` instead of `email` | ✅ Fixed |
| MOBILE-002 | P1 🔴 | `CreateTransaction` sends `estimatedPrice` instead of `price` | ✅ Fixed |
| MOBILE-003 | P2 🟠 | `FinalizePayload` included extra `items` array | ✅ Fixed |
| MOBILE-004 | P2 🟠 | Dashboard KPI field name mismatches | ✅ Fixed |
| MOBILE-005 | P1 🔴 | Revenue endpoint `/dashboard/revenue` doesn't exist | ✅ Fixed |
| MOBILE-006 | P2 🟠 | Orphan `settings.tsx` route conflict | ✅ Fixed (deleted) |
| MOBILE-007 | P2 🟠 | No ESLint config | ✅ Fixed |
| MOBILE-008 | P1 🔴 | Settings service calls `/tenants/me` (not in API) | ❌ Open |
| MOBILE-009 | P1 🔴 | Settings service calls `/tenants/me/subscription` (not in API) | ❌ Open |
| MOBILE-010 | P2 🟠 | Tracking search `GET /tracking/search` not confirmed in API | ⚠️ Unconfirmed |
| MOBILE-011 | P3 🟡 | `PaginatedMeta.totalPages` vs API `total_pages` snake_case | ❌ Open |
| MOBILE-012 | P3 🟡 | Revenue screen `branchRevenue`/`monthlyRevenue` sections always empty | ❌ Open |
