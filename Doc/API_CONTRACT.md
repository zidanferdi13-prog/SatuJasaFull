# API Contract — STNK Bureau SaaS

> Base URL: `/api/v1`  
> All protected endpoints require: `Authorization: Bearer <accessToken>`  
> Standard envelope: `{ "success": bool, "message": str, "data": any, "meta": any }`

---

## Authentication

### POST /auth/login
Login for tenant users and super admin.

**Request**
```json
{ "email": "string", "password": "string (min 6)" }
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "string (JWT, 15m)",
    "refreshToken": "string (JWT, 7d)",
    "expiresIn": "15m",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "SUPER_ADMIN | OWNER | ADMIN",
      "tenantId": "uuid",
      "tenantCode": "string",
      "tenantName": "string",
      "branchId": "uuid | null"
    }
  }
}
```

**Errors**
- `401` — Invalid credentials or inactive user
- `402` — Tenant subscription expired or suspended (not returned for SUPER_ADMIN)

---

### POST /auth/refresh
Silent token refresh.

**Request**
```json
{ "refreshToken": "string" }
```

**Response 200** — same shape as login response

**Errors**
- `401` — Invalid or expired refresh token

---

### POST /auth/logout
**Auth required.** Client-side token discard (MVP — no Redis blocklist).

**Response 200**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

---

### GET /auth/me
**Auth required.** Returns current user profile.

**Response 200** — `data` contains the user object (same shape as login)

---

### POST /auth/register-tenant
**Auth required. SUPER_ADMIN only.** Creates a new tenant + OWNER user.

**Request**
```json
{
  "name": "string (min 2)",
  "code": "string (2-10, alphanumeric)",
  "ownerName": "string (min 2)",
  "ownerEmail": "string (email)",
  "ownerPassword": "string (min 8)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "subscriptionMonths": "integer 1-24 (default 12)",
  "planName": "string (default 'Standard')",
  "planPrice": "number >= 0 (default 0)"
}
```

**Response 201** — `data` contains created tenant object

---

## Tenants (SUPER_ADMIN only)

### GET /tenants
Paginated tenant list.

**Query params:** `page`, `limit`, `search`

**Response 200**
```json
{
  "data": [{ "id", "code", "name", "logoUrl", "phone", "address", "isActive", "subscriptionStart", "subscriptionEnd", "subscriptionStatus", "createdAt", "_count": { "branches", "users", "transactions" } }],
  "meta": { "page", "limit", "total", "total_pages" }
}
```

---

### GET /tenants/:id
Full tenant detail with branches and recent subscriptions.

---

### PUT /tenants/:id
Update tenant name/phone/address.

---

### PATCH /tenants/:id/status
Update subscription or active status.

**Request**
```json
{
  "subscriptionStatus": "ACTIVE | EXPIRED | SUSPENDED (optional)",
  "subscriptionEnd": "ISO date string (optional)",
  "isActive": "boolean (optional)"
}
```

---

### POST /tenants/:id/impersonate
Returns a short-lived access token for the tenant's OWNER account.

**Response 200** — `data: { accessToken, refreshToken }`

---

### POST /tenants/:id/logo
`multipart/form-data` with field `logo` (JPG only, max 2MB).

---

## Branches

All branch routes require auth + subscription check.

### GET /branches
Returns branches for the authenticated user's tenant.

### POST /branches
### GET /branches/:id
### PUT /branches/:id
### DELETE /branches/:id

---

## Customers

All customer routes require auth + subscription check.

**Query params for list:** `page`, `limit`, `search` (name or phone)

### GET /customers
### POST /customers
### GET /customers/:id  (includes vehicles + recent transactions)
### PUT /customers/:id

---

## Vehicles

All vehicle routes require auth + subscription check.

### GET /vehicles
**Query params:** `page`, `limit`, `search` (plate number, brand, model), `customerId`

### POST /vehicles
### GET /vehicles/:id
### PUT /vehicles/:id

---

## Service Types

### GET /service-types
### POST /service-types
### PUT /service-types/:id
### PATCH /service-types/:id/status

---

## Pricing Rules

### GET /pricing-rules
### POST /pricing-rules
### PUT /pricing-rules/:id

---

## Transactions

All transaction routes require auth + subscription check.

### GET /transactions
**Query params:** `page`, `limit`, `search` (invoice number, plate, customer name), `status`, `branchId`, `start_date`, `end_date`, `sort` (e.g. `created_at:desc`)

### GET /transactions/requirements
Returns master fee and document checklist templates for the selected service, vehicle type, and province.

**Query params:** `serviceTypeId` (required), `vehicleTypeCode` (default `MOTOR`), `provinceCode` (default `JABAR`), `cityCode` (optional)

**Response 200**
```json
{
  "provinceCode": "JABAR",
  "vehicleType": { "code": "MOTOR", "name": "Motor", "priceGroup": "R2_R3" },
  "feeRules": [{ "componentCode": "PKB_POKOK", "componentName": "PKB Pokok", "defaultAmount": 0, "isEditable": true }],
  "documentRequirements": [{ "documentCode": "STNK_ASLI", "documentName": "STNK Asli", "isRequired": true }],
  "totalDefaultAmount": 310000
}
```

### POST /transactions
**Request**
```json
{
  "customerId": "uuid",
  "branchId": "uuid (optional, defaults to user's branch)",
  "estimatedFinishDate": "ISO date string (optional)",
  "notes": "string (optional)",
  "items": [
    {
      "vehicleId": "uuid",
      "serviceTypeId": "uuid",
      "vehicleTypeCode": "MOTOR | MOBIL | PICKUP | TRUK | BUS | LAINNYA",
      "provinceCode": "JABAR",
      "feeDetails": [
        { "componentCode": "PKB_POKOK", "amount": 152800 },
        { "componentCode": "JASA_BIRO", "amount": 150000 }
      ]
    }
  ]
}
```

Backend copies `m_fee_rules` into `transaction_item_fee_details` and `m_service_document_requirements` into `transaction_item_document_checklists`. `defaultAmount` is copied from master, while submitted `feeDetails.amount` becomes the transaction `amount`. `JASA_BIRO` default is sourced from tenant `pricing_rules`. Transaction totals are calculated from copied fee detail `amount`, not from master rules.

### GET /transactions/:id
Full transaction with items, fee detail snapshots, document checklist snapshots, payments, logs.

### PATCH /transactions/:id/status
**Request** `{ "status": "TransactionStatus", "notes": "string (optional)" }`

Valid transitions:
```
DRAFT → ON_PROCESS → READY_TO_PICKUP → COMPLETED → CLOSED
```

### POST /transactions/:id/finalize
Set the final price.

**Request** `{ "finalTotal": number, "notes": "string (optional)" }`

### POST /transactions/:id/close
Close transaction (validates full payment).

### GET /transactions/:id/invoice
Returns PDF invoice file.

**Response** `Content-Type: application/pdf`

---

## Payments (nested under transactions)

### GET /transactions/:id/payments
### POST /transactions/:id/payments
**Request**
```json
{ "type": "DP | FINAL_PAYMENT | REFUND", "method": "CASH", "amount": number, "notes": "string (optional)" }
```

Rules:
- Append-only — no update/delete
- CASH only in MVP (no payment gateway)
- CLOSED requires remaining balance = 0

---

## Tracking (Public — no auth)

### GET /tracking/:trackingCode

**Response 200**
```json
{
  "data": {
    "invoiceNumber": "string",
    "trackingCode": "string",
    "status": "TransactionStatus",
    "estimatedFinishDate": "ISO date | null",
    "estimatedTotal": number,
    "dpAmount": number,
    "remainingAmount": number,
    "refundAmount": number,
    "finalTotal": number,
    "tenant": { "name", "logoUrl", "code" },
    "branch": { "name", "address", "phone" },
    "customer": { "name" },
    "items": [{ "vehicle": { "plateNumber", "model", "brand" }, "serviceType": { "name" }, "price": number }],
    "payments": [{ "amount", "type", "method", "createdAt" }],
    "timeline": [{ "fromStatus", "toStatus", "notes", "createdAt" }]
  }
}
```

Note: `tenant_id` is never exposed in this response.

---

## Dashboard

### GET /dashboard/tenant
**Auth + subscription required. OWNER / ADMIN.**

**Response**
```json
{
  "data": {
    "revenueToday": number,
    "monthlyRevenue": number,
    "totalRefund": number,
    "activeTransactions": number,
    "readyPickupCount": number,
    "closedToday": number,
    "overdueTransactions": number
  }
}
```

### GET /dashboard/admin
**Auth required. SUPER_ADMIN only.**

**Response**
```json
{
  "data": {
    "totalTenants": number,
    "activeTenants": number,
    "expiredSubscriptions": number,
    "totalTransactions": number,
    "platformMonthlyRevenue": number,
    "whatsappQueuePending": number
  }
}
```

### GET /dashboard/branch/:branchId
**Auth + subscription required.** Returns same shape as `/dashboard/tenant` but filtered to branch.

---

## Notifications

Auth + subscription required.

### GET /notifications/queue
**Query params:** `status` (PENDING|SENT|FAILED), `page`, `limit`

SUPER_ADMIN sees all. Others see their tenant only.

### POST /notifications/:id/retry
Reset a FAILED or PENDING item for reprocessing.

---

## Audit Logs

Auth required. SUPER_ADMIN or OWNER only.

### GET /audit-logs
**Query params:** `entity`, `action`, `page`, `limit`

SUPER_ADMIN sees all. OWNER sees their tenant's logs.

**Response item**
```json
{
  "id", "tenantId", "action", "entity", "entityId",
  "before": {}, "after": {}, "createdBy", "createdAt",
  "user": { "id", "name", "email" }
}
```

---

## Export

Auth + subscription required.

### GET /exports/transactions
**Query params:** `start_date`, `end_date`, `status`, `branch_id`, `tenant_id` (SUPER_ADMIN only)

**Response** Excel file download (`.xlsx`)

### GET /exports/revenue
**Query params:** `start_date`, `end_date`

**Response**
```json
{
  "data": {
    "totalRevenue": number,
    "totalDp": number,
    "totalRefund": number,
    "transactionCount": number
  }
}
```

---

## Error Codes Reference

| HTTP Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthenticated (no/invalid/expired token) |
| 402 | Subscription expired or suspended |
| 403 | Forbidden (wrong role or tenant inactive) |
| 404 | Resource not found |
| 409 | Duplicate entry (Prisma P2002) |
| 422 | Zod validation error |
| 500 | Internal server error |

---

## Pagination Query Standard

```
?page=1&limit=20
```

Meta in response:
```json
{ "page": 1, "limit": 20, "total": 100, "total_pages": 5 }
```

## Search / Filter / Sort Standard

```
?search=B1234ABC         # full-text on supported fields
?status=ON_PROCESS       # exact status match
?start_date=2026-01-01   # ISO date
?end_date=2026-12-31
?sort=created_at:desc    # field:direction
```
