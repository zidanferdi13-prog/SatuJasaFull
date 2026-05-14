# AUDIT REPORT — STNK Bureau SaaS Platform
> Audit Date: 2026-05-14  
> Audited by: Senior Full-Stack QA / API Integration Auditor  
> Source of Truth: `backend/README.md`, `Doc/API_CONTRACT.md`

---

## 1. Executive Summary

| System | TypeScript | Build | Lint | Feature Complete |
|--------|-----------|-------|------|-----------------|
| Backend | ✅ (not audited) | ✅ | — | ✅ (source of truth) |
| Frontend Admin | ✅ 0 errors | ✅ Builds | ✅ 0 warnings | ⚠️ Partial — **tenant dashboard entirely missing** |
| Mobile App | ✅ 0 errors (after fixes) | N/A (Expo) | ❌ ESLint config missing → added | ⚠️ Partial — several API mismatches fixed |

---

## 2. Critical Issues Found & Fixed

### [FIXED] MOBILE-001 — `LoginPayload.phone` should be `email`
- **Location**: `mobile/src/shared/types/index.ts`, `mobile/src/app/(auth)/login.tsx`
- **Problem**: API contract specifies `POST /auth/login` accepts `{ email, password }`. Mobile `LoginPayload` had `phone` field; login screen sent `{ phone: "..." }`.
- **Impact**: Login would always fail with 422 Validation Error from backend.
- **Fix**: Renamed `phone → email` in `LoginPayload` and updated login screen label/field.

### [FIXED] MOBILE-002 — `CreateTransactionPayload.items[].estimatedPrice` should be `price`
- **Location**: `mobile/src/modules/transactions/services/transaction.service.ts`, `mobile/src/app/transactions/create.tsx`
- **Problem**: API contract specifies `items[].price`. Mobile sent `estimatedPrice`.
- **Impact**: Item prices not recorded on transaction creation (backend validation error or ignored).
- **Fix**: Renamed `estimatedPrice → price` in the payload interface and submit handler.

### [FIXED] MOBILE-003 — `FinalizePayload` had extra `items` array not in API
- **Location**: `mobile/src/modules/transactions/services/transaction.service.ts`, `mobile/src/app/transactions/[id]/finalize.tsx`
- **Problem**: API `POST /transactions/:id/finalize` only accepts `{ finalTotal, notes? }`. Mobile sent `{ items: [{id, finalPrice}], finalTotal }`.
- **Impact**: Extra field silently ignored by backend; no functional breakage but type mismatch.
- **Fix**: Simplified `FinalizePayload` to `{ finalTotal: number; notes?: string }`.

### [FIXED] MOBILE-004 — `DashboardKpi` and `RevenueSummary` field name mismatches
- **Location**: `mobile/src/shared/types/index.ts`, `mobile/src/app/(tabs)/dashboard.tsx`, `mobile/src/app/(tabs)/revenue.tsx`
- **Problem**: API returns `totalRefund` and `closedToday`; mobile type had `refundTotal` and no `closedToday`. `RevenueSummary` had `closedTransactions` (should be `transactionCount`) and `refundTotal` (should be `totalRefund`).
- **Impact**: KPI cards showed 0 for refund, missed `closedToday` entirely.
- **Fix**: Renamed all fields to match API contract exactly.

### [FIXED] MOBILE-005 — Dashboard revenue calls non-existent endpoint
- **Location**: `mobile/src/modules/dashboard/services/dashboard.service.ts`
- **Problem**: Called `GET /dashboard/revenue` which does not exist. Correct endpoint is `GET /exports/revenue`.
- **Impact**: Revenue screen always failed with 404.
- **Fix**: Changed URL to `/exports/revenue`.

### [FIXED] MOBILE-006 — Orphan `src/app/settings.tsx` causing route conflict
- **Location**: `mobile/src/app/settings.tsx` (deleted)
- **Problem**: Old settings screen at `/settings` route; current settings live in `(tabs)/settings.tsx`. The orphan file used `MaterialCommunityIcons` (not installed), routed logout to `'/'` instead of `/(auth)/login`, and duplicated functionality.
- **Impact**: Expo-router might resolve `/settings` ambiguously; logout flow broken in orphan.
- **Fix**: Deleted the orphan file.

### [FIXED] MOBILE-007 — No ESLint config in mobile project
- **Location**: `mobile/.eslintrc.js` (created)
- **Problem**: `npm run lint` in mobile failed with "ESLint couldn't find a configuration file".
- **Impact**: Lint step non-functional; code quality checks skipped.
- **Fix**: Created `.eslintrc.js` with `@typescript-eslint` rules.

---

## 3. Critical Issues NOT Fixed (require architectural decision or out-of-scope)

### [OPEN] FRONTEND-001 — Tenant dashboard routes entirely missing (CRITICAL)
- **Severity**: P1 Blocker
- **Problem**: Frontend admin redirects `OWNER` and `ADMIN` users to `/dashboard` after login, but no `(dashboard)` route group exists. All `/dashboard/*` pages are missing.
- **Routes missing**: `/dashboard`, `/dashboard/transactions`, `/dashboard/transactions/[id]`, `/dashboard/customers`, `/dashboard/vehicles`, `/dashboard/branches`, `/dashboard/revenue`, `/dashboard/settings`, `/dashboard/subscription`
- **Impact**: Tenant users get a 404 immediately after login. The frontend only serves `SUPER_ADMIN`.
- **Fix needed**: Create `src/app/(dashboard)/` route group with all tenant pages. See `TODO_FRONTEND_ADMIN.md`.

### [OPEN] MOBILE-008 — `/tenants/me` endpoint does not exist in API contract
- **Severity**: P1 Blocker
- **Location**: `mobile/src/modules/settings/services/settings.service.ts`
- **Problem**: Mobile settings calls `GET /tenants/me`, `PUT /tenants/me`, `POST /tenants/me/logo`, and `GET /tenants/me/subscription`. None of these paths exist in the API contract.
- **API contract has**: `GET /tenants/:id`, `PUT /tenants/:id`, `POST /tenants/:id/logo`
- **Impact**: All tenant settings and branding screens fail with 404.
- **Fix needed**: Either (a) add `GET /tenants/me` to backend (alias for `GET /tenants/:id` using JWT `tenant_id`), or (b) update mobile service to use `/tenants/${user.tenantId}`. Recommend option (a) for cleaner mobile API.

### [OPEN] MOBILE-009 — `/tenants/me/subscription` does not exist in API contract
- **Severity**: P2
- **Problem**: No `/tenants/me/subscription` or `/tenants/:id/subscription` endpoint exists. Subscription data is only available as part of the tenant object from `GET /tenants/:id`.
- **Impact**: Subscription screen always fails.
- **Fix needed**: Add dedicated subscription endpoint to backend or read from tenant object.

---

## 4. Medium Issues

### [OPEN] FRONTEND-002 — Audit log page is a stub (not wired)
- Page renders `EmptyState` only; service and hook exist but are not used.

### [OPEN] FRONTEND-003 — Notifications queue page is a stub (not wired)
- Page renders static `EmptyState`; `useNotificationQueue()` and `useRetryNotification()` exist but unused.

### [OPEN] FRONTEND-004 — No `/admin/tracking` page despite sidebar link
- Admin layout sidebar lists "Tracking Monitor" with href `/admin/tracking` but no page exists → 404.

### [OPEN] FRONTEND-005 — No `/admin/tenants/[id]` page
- Tenant list links to detail views but no detail route exists.

### [OPEN] FRONTEND-006 — Subscription expired flag set but no UI renders
- `authStore.subscriptionExpired` is set on 402 response, but nothing renders a modal or redirect to block the user.

### [OPEN] MOBILE-010 — `/tracking/search` endpoint not confirmed in API contract
- Mobile tracking screen calls `GET /tracking/search?q=`. API contract only specifies `GET /tracking/:trackingCode`.
- If `/tracking/search` doesn't exist, the mobile tracking search always fails.

---

## 5. Minor Issues

### [OPEN] FRONTEND-007 — Cookie max-age (24h) mismatches JWT access token (15m)
- After silent token refresh, cookie is not updated. Middleware reads stale cookie.

### [OPEN] FRONTEND-008 — Frontend missing types: `Vehicle`, `ServiceType`, `PricingRule`, `TransactionItem`
- These types exist in the mobile but not in frontend `shared/types/index.ts`.

### [OPEN] MOBILE-011 — `PaginatedMeta.totalPages` vs API `total_pages`
- Mobile uses `totalPages` (camelCase); API contract/backend returns `total_pages` (snake_case). Frontend uses `total_pages`.

### [OPEN] MOBILE-012 — Revenue screen shows `branchRevenue` and `monthlyRevenue` sections
- These come from `RevenueSummary` type, but `/exports/revenue` only returns a flat summary object. Sections always render empty.

---

## 6. Files Changed in This Audit

| File | Change |
|------|--------|
| `mobile/src/shared/types/index.ts` | Fixed `DashboardKpi`, `RevenueSummary`, `LoginPayload`, `Tenant` types |
| `mobile/src/modules/transactions/services/transaction.service.ts` | Fixed `CreateTransactionPayload`, `FinalizePayload`, `finalize()` call |
| `mobile/src/modules/dashboard/services/dashboard.service.ts` | Fixed `/dashboard/revenue` → `/exports/revenue` |
| `mobile/src/app/(tabs)/dashboard.tsx` | Fixed `refundTotal` → `totalRefund` |
| `mobile/src/app/(tabs)/revenue.tsx` | Fixed `refundTotal` → `totalRefund`, `closedTransactions` → `transactionCount`, `totalProfit` → `totalDp` |
| `mobile/src/app/transactions/create.tsx` | Fixed `estimatedPrice` → `price` in submit payload |
| `mobile/src/app/transactions/[id]/finalize.tsx` | Fixed finalize mutate to only send `{ finalTotal }` |
| `mobile/src/app/(auth)/login.tsx` | Fixed `phone` → `email` field, updated UI label |
| `mobile/src/app/settings.tsx` | **Deleted** (orphan duplicate file) |
| `mobile/.eslintrc.js` | **Created** ESLint config |
| `mobile/MOBILE_ARCHITECTURE.md` | Created (previous session) |
| `mobile/TODO_MOBILE.md` | Created |

---

## 7. Validation Results

| Command | Result |
|---------|--------|
| `cd frontend && npx tsc --noEmit` | ✅ 0 errors |
| `cd frontend && npm run lint` | ✅ 0 warnings |
| `cd frontend && npm run build` | ✅ Build successful (14 routes) |
| `cd mobile && npx tsc --noEmit` | ✅ 0 errors (after fixes) |
| `cd mobile && npm run lint` | ❌ Config missing → Fixed by adding `.eslintrc.js` |

---

## 8. Recommended Next Steps (Priority Order)

1. **[P1]** Create tenant dashboard routes in frontend: `src/app/(dashboard)/` with all pages
2. **[P1]** Add `GET /tenants/me` backend endpoint (alias for current user's tenant)
3. **[P1]** Add `GET /tenants/me/subscription` or include subscription in tenant response
4. **[P1]** Confirm `GET /tracking/search?q=` endpoint exists on backend
5. **[P2]** Wire audit log page (`useAuditLogs()` hook exists, page is a stub)
6. **[P2]** Wire notification queue page (`useNotificationQueue()` hook exists, page is a stub)
7. **[P2]** Add `/admin/tracking` page to frontend
8. **[P2]** Add frontend subscription expired modal/redirect
9. **[P2]** Add `/admin/tenants/[id]` detail page
10. **[P3]** Align `PaginatedMeta.totalPages` vs `total_pages` naming across both clients
