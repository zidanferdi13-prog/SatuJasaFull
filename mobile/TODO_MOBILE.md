# TODO — Mobile App
> Last updated: 2026-05-14 (Audit pass)

---

## P1 — Blockers

### 1. Fix settings service to use `/tenants/:id` instead of `/tenants/me`

**File**: `src/modules/settings/services/settings.service.ts`  
**Problem**: All calls use `/tenants/me` which does not exist in the API contract.

**Recommended Fix:**
```ts
// Read tenantId from auth store
const tenantId = authStore.getState().user?.tenantId;
getTenantProfile: () => api.get(`/tenants/${tenantId}`),
updateTenantProfile: (data) => api.put(`/tenants/${tenantId}`, data),
uploadLogo: (file) => api.post(`/tenants/${tenantId}/logo`, file),
```

### 2. Fix subscription screen — no dedicated endpoint

**Problem**: `GET /tenants/me/subscription` does not exist.  
**Fix**: Read `subscriptionStatus` and `subscriptionExpiresAt` from the tenant object returned by `GET /tenants/:id`.

---

## P2 — Medium Priority

### 3. Confirm `/tracking/search` endpoint with backend
API contract only specifies `GET /tracking/:trackingCode`. Verify `GET /tracking/search?q=` exists, or use `GET /transactions?search=` as workaround.

### 4. Align `PaginatedMeta` snake_case vs camelCase
API returns `total_pages` but mobile type uses `totalPages`. Align one way consistently.

### 5. Fix revenue screen branch/monthly chart sections
`branchRevenue` and `monthlyRevenue` arrays do not exist in the `/exports/revenue` response. Remove or request new backend endpoint.

---

## P3 — Minor

### 6. Add subscription expired 402 handling
Detect 402 in `api-client.ts`, set `subscriptionExpired` flag in authStore, and render a blocking screen or modal.

---

## Fixed in 2026-05-14 Audit ✅

- [x] Fixed `LoginPayload.phone` → `email`; updated login screen UI
- [x] Fixed `CreateTransactionPayload.items[].estimatedPrice` → `price`
- [x] Fixed `FinalizePayload` — removed extra `items` array; API only accepts `{ finalTotal, notes? }`
- [x] Fixed `DashboardKpi` field names — `refundTotal` → `totalRefund`, added `closedToday`, removed `totalProfit`
- [x] Fixed `RevenueSummary` — `refundTotal` → `totalRefund`, `closedTransactions` → `transactionCount`, added `totalDp`
- [x] Fixed dashboard service endpoint `/dashboard/revenue` → `/exports/revenue`
- [x] Deleted orphan `src/app/settings.tsx` (conflicted with `(tabs)/settings.tsx`)
- [x] Created `mobile/.eslintrc.js` ESLint config
- [x] TypeScript: ✅ 0 errors

---

## Completed in Initial Development ✅

- [x] Expo project structure with expo-router v3
- [x] TypeScript strict mode with `@/` path alias
- [x] Theme system (Colors, Spacing, Typography, BorderRadius, Shadow)
- [x] Shared types (all domain models)
- [x] Shared constants (STATUS_LABELS, STATUS_COLORS, STATUS_TRANSITION, ROLES)
- [x] AsyncStorage wrapper (storage.ts)
- [x] API error class + getErrorMessage helper
- [x] Axios client with refresh token interceptor
- [x] Zustand auth store with AsyncStorage persistence
- [x] QueryClient + AppProvider (TanStack Query)
- [x] Root layout with AuthGuard (route protection)
- [x] Login screen (phone + password)
- [x] Subscription expired screen
- [x] 5-tab bottom navigator (Dashboard, Transactions, Tracking, Revenue, Settings)
- [x] Dashboard screen (7 KPI cards + branch selector + quick actions)
- [x] Transactions list screen (search + status filter)
- [x] Tracking search screen (search + share)
- [x] Revenue analytics screen
- [x] Settings hub screen
- [x] All module services (auth, dashboard, customer, vehicle, transaction, branch, settings)
- [x] All TanStack Query hooks
- [x] Customer list, detail, create, edit screens
- [x] Vehicle list, detail, create, edit screens
- [x] Transaction detail screen (payments, logs, action buttons)
- [x] Create transaction multi-step flow
- [x] Update transaction status screen
- [x] Finalize transaction (set final prices per item)
- [x] Close transaction (add final payment + close)
- [x] Branch list + create modal
- [x] Settings: Profile, Branding (logo upload), WhatsApp template, Pricing rules, Subscription status

## Pending / Nice to Have 📋
- [ ] Branch edit screen (`/branches/[id]/edit`)
- [ ] Customer detail → show vehicles list
- [ ] Invoice PDF viewer (open in-app browser or download)
- [ ] Push notifications (Expo Notifications)
- [ ] Biometric lock (expo-local-authentication)
- [ ] Dark mode support
- [ ] Offline mode / optimistic updates
- [ ] Unit tests (Jest + React Native Testing Library)
- [ ] E2E tests (Maestro or Detox)
- [ ] EAS Build configuration for staging + production
- [ ] OTA updates with EAS Update

## Known Issues
- `src/app/settings.tsx` (old root-level file) — check if it conflicts with `(tabs)/settings.tsx` and `settings/` folder
- Old `src/app/home.tsx`, `history.tsx`, `transaction.tsx` were deleted in cleanup pass
