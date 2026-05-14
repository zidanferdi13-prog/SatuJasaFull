# TODO Integration — STNK Bureau SaaS

> Remaining gaps between frontend and backend after initial audit (2026-05-12).
> Items are ordered by priority.

---

## 🔴 P1 — Blocking / Critical

### 1. Branch "list by tenant" endpoint missing
- **File**: `frontend/src/modules/branches/services/branch.service.ts` → `listByTenant(tenantId)`
- **Problem**: Calls `GET /admin/tenants/:id/branches` — this endpoint does not exist in the backend.
- **Fix**: Either (a) add `GET /tenants/:id/branches` to the backend tenant router, or (b) for SUPER_ADMIN context, fetch the tenant detail (`GET /tenants/:id`) which already includes `branches[]`.
- **Backend change needed**: Add `router.get('/:id/branches', TenantController.listBranches)` in `tenant.routes.ts`.

### 2. Payments UI not implemented
- **Files**: Transaction detail page (`app/(dashboard)/transactions/[id]/page.tsx`)
- **Problem**: No UI to display or add payments. `GET /transactions/:id/payments` and `POST /transactions/:id/payments` exist but have no frontend hooks or components.
- **Fix**: Add `usePayments(transactionId)` and `useCreatePayment()` hooks; add payment list + form to transaction detail page.

### 3. Notification queue page not wired
- **File**: `app/(admin)/notifications/page.tsx`
- **Problem**: No service/hook for notification queue. No frontend module exists for notifications.
- **Fix**: Create `modules/notifications/services/notification.service.ts` calling `GET /notifications/queue` and `POST /notifications/:id/retry`. Add `useNotificationQueue()` hook.

### 4. Audit log page not wired
- **File**: `app/(admin)/audit/page.tsx`
- **Problem**: No service/hook for audit logs.
- **Fix**: Create `modules/audit/services/audit.service.ts` calling `GET /audit-logs`. Add `useAuditLogs()` hook with filter support.

---

## 🟡 P2 — Important but not blocking login/core flow

### 5. Service types and pricing not implemented in frontend
- **Files**: `app/(dashboard)/settings/page.tsx`
- **Problem**: No service layer for `GET/POST /service-types` or `GET/POST/PUT /pricing-rules`.
- **Fix**: Create `modules/settings/services/` with `serviceTypeService` and `pricingService`.

### 6. Vehicle service has no CRUD hooks
- **Problem**: `GET/POST/PUT /vehicles` backend routes exist but frontend has no service file under `modules/vehicles/`.
- **Fix**: Create `modules/vehicles/services/vehicle.service.ts` + `useVehicles()` hook.

### 7. Revenue / analytics charts are stubs
- **File**: `modules/analytics/services/analytics.service.ts`
- **Problem**: `getRevenueSummary` maps to `GET /exports/revenue` which returns a flat summary, not a time-series. The old `getRevenue()` / `getBranchRevenue()` returning `RevenueData[]` had no backing endpoint. Time-series revenue charts cannot be rendered with current backend data.
- **Fix**: Either (a) add a `GET /analytics/revenue?group_by=month` endpoint to the backend, or (b) use the Excel export + parse client-side (impractical). Recommend option (a).

### 8. Impersonation token not handled in frontend
- **File**: `modules/tenants/services/tenant.service.ts` → `impersonate()`
- **Problem**: `POST /tenants/:id/impersonate` returns `{ accessToken, refreshToken }` but the frontend does nothing with it after the API call.
- **Fix**: After calling `impersonate()`, store the new tokens in authStore with a flag `isImpersonating: true`, redirect to `/dashboard`. On logout, restore the original super admin token.

### 9. Tenant logo upload not implemented
- **Problem**: `POST /tenants/:id/logo` (multipart/form-data) has no frontend form.
- **Fix**: Add a logo upload input in the tenant edit form (settings page or tenant detail).

### 10. Forgot password page is a stub
- **File**: `app/(auth)/forgot-password/page.tsx`
- **Problem**: No backend password reset endpoint exists (`POST /auth/forgot-password` / `POST /auth/reset-password`).
- **Fix**: Implement backend endpoints + frontend form. Out of scope for MVP.

---

## 🟢 P3 — Nice to have / Polish

### 11. Subscription expired modal not rendered
- **File**: `store/authStore.ts` → `subscriptionExpired` flag is set on 402
- **Problem**: The Zustand flag is set but no UI component reads it to show a modal.
- **Fix**: In `app/providers.tsx` or a shared layout, watch `subscriptionExpired` and render a full-screen `<SubscriptionExpiredModal>` that offers logout.

### 12. Token cookie max-age is 1 day (mismatches JWT 15m access token)
- **File**: `store/authStore.ts` → `setToken()`
- **Problem**: Cookie `max-age=86400` (24h) but access token expires in 15m. Silent refresh via `refreshSession()` updates localStorage but does not rotate the cookie.
- **Fix**: After `refreshSession()` succeeds, call `document.cookie = 'token=<newToken>; ...'` to keep cookie and middleware in sync. This is already done in the updated `refreshSession()` but should also be done via `setToken()` call.

### 13. No loading/skeleton state for dashboard pages
- **Problem**: `useAdminDashboard()` / `useTenantDashboard()` return `isLoading` but pages likely don't render skeletons.
- **Fix**: Wrap KPI cards with skeleton loader while `isLoading === true`.

### 14. Admin monitoring page not mapped
- **File**: `app/(admin)/monitoring/page.tsx`
- **Problem**: No backend endpoint exists for system health monitoring. Dashboard admin KPIs include `whatsappQueuePending` which is a partial proxy.
- **Fix**: Either use `GET /dashboard/admin` data for a simple monitoring view, or add a `GET /admin/health` endpoint.

### 15. Export transaction button in frontend
- **Problem**: `GET /exports/transactions` returns an XLSX file. The frontend needs to trigger a file download (not use Axios — use a direct anchor link or `window.open`).
- **Fix**: In the transactions page export button: `window.open(API_URL + '/exports/transactions?' + queryString)` — the browser will trigger the download since the response has `Content-Disposition: attachment`.
  > Note: This requires the Authorization header. Use a pre-signed URL approach or pass token as a query param (not recommended for security) or implement a server-side download route in Next.js that proxies with auth.

### 16. WhatsApp worker and invoice worker not started in dev
- **Files**: `backend/src/workers/` (referenced in README but implementation status unknown)
- **Problem**: Queue processing workers are not started by `npm run dev`. Notifications remain PENDING forever.
- **Fix**: Run workers separately with `npm run worker:whatsapp` and `npm run worker:invoice`, or add them to the dev startup script.

---

## Backend Endpoints Still Missing (need implementation)

| Endpoint | Purpose | Priority |
|---|---|---|
| `GET /tenants/:id/branches` | Super admin view of a tenant's branches | P1 |
| `GET /analytics/revenue?group_by=month` | Time-series revenue for charts | P2 |
| `POST /auth/forgot-password` | Password reset request | P3 |
| `POST /auth/reset-password` | Password reset with token | P3 |
| `GET /admin/health` | System health / monitoring page | P3 |

---

## Type Safety Gaps

| File | Gap |
|---|---|
| `modules/branches/services/branch.service.ts` | `listByTenant()` points to non-existent endpoint — see P1#1 |
| `app/(dashboard)/**` | Pages reference `Tenant.status` — renamed to `subscriptionStatus` |
| Any page using `LoginResponse.token` | Renamed to `accessToken` |
| Any page using `AdminKpis.totalTenants` only | Now also has `platformMonthlyRevenue`, `whatsappQueuePending` |
| Any page using `DashboardKpis.activeTransactions` only | Now also has `totalRefund`, `closedToday`, `overdueTransactions` |
