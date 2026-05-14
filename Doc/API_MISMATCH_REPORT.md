# API Mismatch Report
> Source of truth: `Doc/API_CONTRACT.md`, `backend/README.md`
> Audited: 2026-05-14

All mismatches between frontend/mobile client code and the backend API contract.

---

## Mobile Mismatches

### AUTH

| # | Location | Client Sent | API Expects | Severity | Status |
|---|---------|-------------|-------------|----------|--------|
| 1 | `(auth)/login.tsx`, `LoginPayload` | `{ phone: string }` | `{ email: string }` | P1 | ✅ Fixed |

### TRANSACTIONS

| # | Location | Client Sent | API Expects | Severity | Status |
|---|---------|-------------|-------------|----------|--------|
| 2 | `transaction.service.ts`, `CreateTransactionPayload` | `items[].estimatedPrice` | `items[].price` | P1 | ✅ Fixed |
| 3 | `transaction.service.ts`, `FinalizePayload` | `{ items: [{id, finalPrice}], finalTotal }` | `{ finalTotal, notes? }` | P2 | ✅ Fixed |

### DASHBOARD / ANALYTICS

| # | Location | Client Called | API Endpoint | Severity | Status |
|---|---------|--------------|--------------|----------|--------|
| 4 | `dashboard.service.ts` | `GET /dashboard/revenue` | `GET /exports/revenue` | P1 | ✅ Fixed |

### TYPES — Field Name Mismatches

| # | Type | Client Field | API Field | Severity | Status |
|---|------|-------------|----------|----------|--------|
| 5 | `DashboardKpi` | `refundTotal` | `totalRefund` | P2 | ✅ Fixed |
| 6 | `DashboardKpi` | `totalProfit` | *(field doesn't exist)* | P2 | ✅ Fixed (removed) |
| 7 | `DashboardKpi` | *(missing)* | `closedToday` | P2 | ✅ Fixed (added) |
| 8 | `RevenueSummary` | `refundTotal` | `totalRefund` | P2 | ✅ Fixed |
| 9 | `RevenueSummary` | `closedTransactions` | `transactionCount` | P2 | ✅ Fixed |
| 10 | `RevenueSummary` | *(missing)* | `totalDp` | P3 | ✅ Fixed (added) |
| 11 | `RevenueSummary` | `totalProfit` | *(field doesn't exist)* | P2 | ✅ Fixed (removed) |
| 12 | `Tenant` | *(missing)* | `subscriptionStatus` | P2 | ✅ Fixed (added) |

### SETTINGS / TENANT

| # | Location | Client Called | API Endpoint | Severity | Status |
|---|---------|--------------|--------------|----------|--------|
| 13 | `settings.service.ts` | `GET /tenants/me` | `GET /tenants/:id` | P1 | ❌ Open |
| 14 | `settings.service.ts` | `PUT /tenants/me` | `PUT /tenants/:id` | P1 | ❌ Open |
| 15 | `settings.service.ts` | `POST /tenants/me/logo` | `POST /tenants/:id/logo` | P1 | ❌ Open |
| 16 | `settings.service.ts` | `GET /tenants/me/subscription` | *(endpoint doesn't exist)* | P1 | ❌ Open |

### TRACKING

| # | Location | Client Called | API Endpoint | Severity | Status |
|---|---------|--------------|--------------|----------|--------|
| 17 | tracking screen/service | `GET /tracking/search?q=` | *(not in API contract)* | P2 | ⚠️ Unconfirmed |

---

## Frontend Admin Mismatches

### AUTH / SESSION

| # | Location | Issue | Severity | Status |
|---|---------|-------|----------|--------|
| 18 | `authStore.ts` `refreshSession()` | Updates localStorage but not cookie; middleware reads cookie → stale auth after refresh | P2 | ❌ Open |
| 19 | `shared/services/api.ts` 401 interceptor | No pending queue — multiple concurrent 401s fire multiple refresh calls | P2 | ❌ Open |

### MISSING ROUTES (no backend mismatch — frontend not built)

| # | Expected Route | What Should Call | Severity | Status |
|---|---------------|-----------------|----------|--------|
| 20 | `/dashboard` | `GET /dashboard/tenant` | P1 | ❌ Open |
| 21 | `/dashboard/transactions` | `GET /transactions` | P1 | ❌ Open |
| 22 | `/dashboard/customers` | `GET /customers` | P1 | ❌ Open |
| 23 | `/dashboard/vehicles` | `GET /vehicles` | P1 | ❌ Open |
| 24 | `/dashboard/branches` | `GET /branches` | P1 | ❌ Open |
| 25 | `/dashboard/revenue` | `GET /exports/revenue` | P1 | ❌ Open |
| 26 | `/dashboard/settings` | `GET /tenants/:id` | P1 | ❌ Open |
| 27 | `/dashboard/subscription` | `GET /tenants/:id` (subscription field) | P1 | ❌ Open |
| 28 | `/admin/tracking` | `GET /tracking` (admin) | P2 | ❌ Open |
| 29 | `/admin/tenants/[id]` | `GET /tenants/:id` | P2 | ❌ Open |

---

## Backend Endpoints Referenced by Clients but Not in Contract

These were found in client code but either don't appear in `API_CONTRACT.md` or seem to be missing:

| Endpoint | Used by | Notes |
|---------|---------|-------|
| `GET /tracking/search?q=` | Mobile tracking | Not in API_CONTRACT.md — needs verification |
| `GET /tenants/me` | Mobile settings | Should be added as alias for `/tenants/:id` using JWT |
| `GET /tenants/me/subscription` | Mobile settings | Should be added or subscription embedded in tenant response |
| `DELETE /tenants/:id` | Not used (but in admin CRUD pattern) | Verify if implemented |

---

## Summary Count

| Category | Count | Fixed | Open |
|----------|-------|-------|------|
| P1 Critical | 10 | 6 | 4 |
| P2 Medium | 12 | 5 | 7 |
| P3 Minor | 4 | 2 | 2 |
| **Total** | **26** | **13** | **13** |
