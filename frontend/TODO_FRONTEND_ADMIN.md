# TODO — Frontend Admin
> Last updated: 2026-05-14 (Audit pass)

---

## P1 — Blockers (Must Fix Before Launch)

### 1. Build tenant dashboard route group (CRITICAL)

Currently every non-SUPER_ADMIN user gets a 404 after login. Create a `(dashboard)` route group.

**Files to create:**
```
src/app/(dashboard)/
  layout.tsx            ← Sidebar/navbar for tenant roles
  dashboard/
    page.tsx            ← GET /dashboard/tenant or /dashboard/branch/:branchId
  transactions/
    page.tsx            ← GET /transactions
    [id]/
      page.tsx          ← GET /transactions/:id
  customers/
    page.tsx            ← GET /customers
  vehicles/
    page.tsx            ← GET /vehicles
  branches/
    page.tsx            ← GET /branches
  revenue/
    page.tsx            ← GET /exports/revenue
  settings/
    page.tsx            ← GET /tenants/:id + PUT /tenants/:id
  subscription/
    page.tsx            ← GET /tenants/:id (subscription field)
```

**API calls needed:**
- Dashboard KPI: `GET /dashboard/tenant` (OWNER) or `GET /dashboard/branch/:branchId` (ADMIN)
- Transactions: Reuse hooks from `modules/transactions/`
- Customer/vehicle/branch CRUD: Reuse module hooks
- Revenue: `GET /exports/revenue`
- Settings: `GET /tenants/:id`, `PUT /tenants/:id`, `POST /tenants/:id/logo`
- Subscription: Read from tenant object `subscriptionStatus` field

**Hooks that already exist (reuse these):**
- `modules/transactions/hooks/useTransactions.ts`
- `modules/customers/hooks/useCustomers.ts`
- `modules/dashboard/hooks/useDashboard.ts`

---

### 2. Fix login redirect for tenant roles

In `(auth)/login/page.tsx` and `(admin)/layout.tsx`, redirects to `/dashboard` which doesn't exist yet.  
Will be resolved automatically once task #1 is done.

---

## P2 — Medium Priority

### 3. Wire audit log page

**File**: `src/app/(admin)/admin/audit/page.tsx`  
**Hook**: `modules/audit/hooks/useAuditLogs.ts`  
**Action**: Replace `EmptyState` with actual table using `useAuditLogs()` hook. Add filters for date range and action type.

### 4. Wire notifications queue page

**File**: `src/app/(admin)/admin/notifications/page.tsx`  
**Hook**: `modules/notifications/hooks/useNotificationQueue.ts`, `useRetryNotification.ts`  
**Action**: Replace `EmptyState` with notification queue table. Add retry button per item.

### 5. Add /admin/tracking page

**File**: Create `src/app/(admin)/admin/tracking/page.tsx`  
**API**: `GET /transactions?status=...` or `GET /tracking` (admin)  
Sidebar already links to this route — currently a 404.

### 6. Add /admin/tenants/[id] detail page

**File**: Create `src/app/(admin)/admin/tenants/[id]/page.tsx`  
**APIs**: `GET /tenants/:id`, `PUT /tenants/:id`, `PATCH /tenants/:id/subscription`  
**Include**: Tenant info, subscription status, branches list, transaction count.

### 7. Add subscription expired UI

**When**: `authStore.subscriptionExpired === true` (set on 402 response)  
**Where**: Global in `providers.tsx` or root layout  
**Action**: Show a full-screen modal or banner blocking usage with message "Langganan Anda telah kedaluwarsa" and a link to `/dashboard/subscription`.

---

## P3 — Minor / Polish

### 8. Fix cookie update after token refresh

**File**: `src/store/authStore.ts` `refreshSession()`  
**Issue**: After silent refresh, `localStorage` is updated but the cookie `auth_token` is not.  
**Fix**: After calling `/auth/refresh`, update the cookie:
```ts
// After getting new tokens
document.cookie = `auth_token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
```

### 9. Add concurrent-401 queue to API client

**File**: `src/shared/services/api.ts`  
**Issue**: Multiple simultaneous 401 responses each trigger `refreshSession()` independently.  
**Fix**: Port the queue-based pattern from `mobile/src/shared/services/api-client.ts`.

### 10. Add missing types to shared/types/index.ts

Missing types used by hooks/services but not defined:
- `Vehicle`
- `ServiceType`
- `PricingRule`
- `TransactionItem`
- `TransactionLog`
- `NotificationQueue`
- `AuditLog`

### 11. Add /admin/promotions page

**File**: `src/app/(admin)/admin/promotions/page.tsx`  
Currently stub. Build if promotions feature is in scope.

---

## Completed (Previous)

- [x] SUPER_ADMIN login and tenant management ✅
- [x] Subscription plan assignment ✅
- [x] Admin dashboard KPIs ✅
- [x] Tenant list (no detail) ✅
