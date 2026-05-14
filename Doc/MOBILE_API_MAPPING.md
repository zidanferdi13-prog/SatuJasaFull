# Mobile API Mapping
> Mobile: Expo SDK ~50 + expo-router v3  
> Backend base URL: `/api/v1`  
> Last updated: 2026-05-14

---

## Auth

| Screen | Method | Endpoint | Request Body | Notes |
|--------|--------|----------|-------------|-------|
| `(auth)/login` | POST | `/auth/login` | `{ email, password }` | Returns `{ accessToken, refreshToken, user }` |
| *(any screen)* | POST | `/auth/refresh` | `{ refreshToken }` | Auto-called by api-client on 401 |
| *(settings)* | POST | `/auth/logout` | `{ refreshToken }` | Called on logout button |

---

## Dashboard

| Screen | Method | Endpoint | Query Params | Notes |
|--------|--------|----------|-------------|-------|
| `(tabs)/dashboard` | GET | `/dashboard/tenant` | — | For OWNER role |
| `(tabs)/dashboard` | GET | `/dashboard/branch/:branchId` | — | For ADMIN/STAFF with branchId |
| `(tabs)/revenue` | GET | `/exports/revenue` | `branchId?, start_date?, end_date?` | Returns `RevenueSummary` |

---

## Transactions

| Screen | Method | Endpoint | Body/Params | Notes |
|--------|--------|----------|-------------|-------|
| `(tabs)/transactions` | GET | `/transactions` | `?page, limit, status, branchId, search` | Paginated list |
| `transactions/[id]` | GET | `/transactions/:id` | — | Full detail with items, payments, logs |
| `transactions/create` | POST | `/transactions` | `{ branchId, customerId, items: [{vehicleId, serviceTypeId, price}] }` | `price` not `estimatedPrice` |
| `transactions/[id]/status` | PATCH | `/transactions/:id/status` | `{ status, notes? }` | Valid statuses per API contract |
| `transactions/[id]/finalize` | POST | `/transactions/:id/finalize` | `{ finalTotal, notes? }` | No `items` array — total only |
| `transactions/[id]/close` | POST | `/transactions/:id/close` | `{ notes? }` | Close/complete transaction |
| `transactions/[id]/payments` | GET | `/transactions/:id/payments` | — | Payment history |
| `transactions/[id]/payments` | POST | `/transactions/:id/payments` | `{ amount, method, notes? }` | Add payment |
| `transactions/[id]` (PDF) | GET | `/transactions/:id/invoice` | — | PDF download |

---

## Customers

| Screen | Method | Endpoint | Body/Params | Notes |
|--------|--------|----------|-------------|-------|
| `customers/index` | GET | `/customers` | `?page, limit, search` | |
| `customers/create` | POST | `/customers` | `{ name, phone, email?, address? }` | |
| `customers/[id]` | GET | `/customers/:id` | — | |
| `customers/[id]/edit` | PUT | `/customers/:id` | `{ name, phone, email?, address? }` | |

---

## Vehicles

| Screen | Method | Endpoint | Body/Params | Notes |
|--------|--------|----------|-------------|-------|
| `vehicles/index` | GET | `/vehicles` | `?page, limit, customerId, search` | |
| `vehicles/create` | POST | `/vehicles` | `{ customerId, plateNumber, brand, model, year, color? }` | |
| `vehicles/[id]` | GET | `/vehicles/:id` | — | |
| `vehicles/[id]/edit` | PUT | `/vehicles/:id` | `{ plateNumber, brand, model, year, color? }` | |

---

## Branches

| Screen | Method | Endpoint | Body/Params | Notes |
|--------|--------|----------|-------------|-------|
| `branches/index` | GET | `/branches` | — | Only branches for user's tenant |
| `branches/create` | POST | `/branches` | `{ name, address, phone? }` | OWNER only |
| `branches/[id]` | GET | `/branches/:id` | — | |
| `branches/[id]/edit` | PUT | `/branches/:id` | `{ name, address, phone? }` | |

---

## Service Types & Pricing

| Screen | Method | Endpoint | Body/Params | Notes |
|--------|--------|----------|-------------|-------|
| Transaction create (picker) | GET | `/service-types` | — | List available service types |
| *(settings)* pricing rules | GET | `/pricing-rules` | `?branchId?, serviceTypeId?` | |
| *(settings)* pricing create | POST | `/pricing-rules` | `{ serviceTypeId, branchId?, price, unit? }` | |
| *(settings)* pricing edit | PUT | `/pricing-rules/:id` | `{ price, unit? }` | |

---

## Tenant Settings

> ⚠️ **Current mobile code calls `/tenants/me` which does NOT exist in the API.**
> Correct approach: use `/tenants/:id` with `user.tenantId` from auth store.

| Screen | Method | Correct Endpoint | Current Endpoint | Status |
|--------|--------|-----------------|-----------------|--------|
| Settings → Profile | GET | `/tenants/:id` | `/tenants/me` | ❌ Wrong |
| Settings → Update | PUT | `/tenants/:id` | `/tenants/me` | ❌ Wrong |
| Settings → Logo | POST | `/tenants/:id/logo` | `/tenants/me/logo` | ❌ Wrong |
| Settings → Subscription | GET | *(no endpoint — use tenant object)* | `/tenants/me/subscription` | ❌ Missing |

---

## Notifications

| Screen | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| Notification list | GET | `/notifications` | In-app notifications |
| Mark read | PATCH | `/notifications/:id/read` | |
| Mark all read | PATCH | `/notifications/read-all` | |

---

## Tracking (Public)

| Screen | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| Public tracking | GET | `/tracking/:trackingCode` | No auth required |
| ⚠️ Search tracking | GET | `/tracking/search?q=` | **NOT in API contract** — verify with backend |

---

## Export

| Screen | Method | Endpoint | Query Params | Notes |
|--------|--------|----------|-------------|-------|
| Revenue analytics | GET | `/exports/revenue` | `branchId?, start_date?, end_date?` | |
| Transactions export | GET | `/exports/transactions` | `branchId?, start_date?, end_date?, status?` | |
