# Mobile App - STNK Bureau Service Management SaaS

React Native + TypeScript mobile application for STNK Bureau Service Management SaaS Platform.

This mobile app is used by tenant users, mainly bureau owners/admins, to manage daily STNK bureau operations quickly and simply.

---

## 1. System Overview

This mobile application is part of a 3-system SaaS ecosystem:

1. Mobile App - Tenant Operational App
2. Web Admin Dashboard - Platform Owner / Super Admin Control
3. Backend API - Express + PostgreSQL + Redis + Queue Services

The mobile app is designed for Indonesian STNK bureau service operations.

Main use cases:

* Input customer transactions
* Manage customer data
* Manage vehicle data
* Add multiple vehicles in one transaction
* Input estimated price and DP
* Monitor transaction workflow
* Update transaction status
* Share invoice PDF and tracking link via WhatsApp
* Monitor revenue KPI
* Manage branch selection
* View subscription status
* Manage tenant settings

---

## 2. Business Context

Target users:

* Small STNK bureau services
* Medium/large STNK bureau services
* Bureau owners
* Bureau operational admins

The mobile app must prioritize:

* speed
* simplicity
* minimal clicks
* easy input flow
* low learning curve
* operational usability

Users are expected to operate the app while serving customers directly, so transaction creation must be fast and clear.

Target transaction creation time:

```text
Under 1 minute
```

---

## 3. Tech Stack

Recommended stack:

* React Native
* TypeScript
* React Navigation
* TanStack Query / React Query
* Zustand
* Axios
* React Hook Form
* Zod
* NativeWind or Tailwind RN
* MMKV or AsyncStorage

Optional:

* Expo, if faster MVP setup is preferred

---

## 4. Core Architecture

Use Feature-Based Modular Architecture.

Each module owns:

* screens
* components
* hooks
* API functions
* schemas
* types
* business helpers

Avoid putting all logic inside screens.

Use this separation:

```text
Screen
  ↓
Hook
  ↓
API Service
  ↓
Backend API
```

---

## 5. Project Structure

```text
mobile/
├── src/
│   ├── app/
│   │   ├── AppProvider.tsx
│   │   └── queryClient.ts
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── types.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   ├── schemas/
│   │   │   ├── store/
│   │   │   └── types/
│   │   │
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── customers/
│   │   ├── vehicles/
│   │   ├── payments/
│   │   ├── tracking/
│   │   ├── revenue/
│   │   ├── branches/
│   │   ├── settings/
│   │   └── subscription/
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── buttons/
│   │   │   ├── cards/
│   │   │   ├── forms/
│   │   │   ├── inputs/
│   │   │   ├── layout/
│   │   │   ├── loading/
│   │   │   ├── modals/
│   │   │   └── feedback/
│   │   │
│   │   ├── services/
│   │   │   ├── api-client.ts
│   │   │   ├── api-error.ts
│   │   │   └── storage.ts
│   │   │
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── validators/
│   │   └── types/
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
├── .env.example
├── package.json
└── README.md
```

---

## 6. Navigation Structure

### Root Navigation

```text
RootNavigator
├── AuthNavigator
└── MainTabNavigator
```

---

### Auth Routes

```text
/login
```

For MVP:

* login only
* forgot password can be prepared later

---

### Main Bottom Tabs

```text
Dashboard
Transactions
Tracking
Revenue
Settings
```

---

## 7. Main Screens

### Auth Module

Screens:

```text
LoginScreen
SubscriptionExpiredScreen
```

Responsibilities:

* login with phone and password
* store token securely
* refresh token automatically
* redirect based on auth state
* handle expired subscription response

---

### Dashboard Module

Screen:

```text
DashboardScreen
```

Show KPI cards only:

* revenue today
* monthly revenue
* active transactions
* ready pickup count
* overdue transactions
* total profit
* total refund

No complex chart required for MVP.

---

### Transactions Module

Screens:

```text
TransactionListScreen
TransactionDetailScreen
CreateTransactionScreen
UpdateTransactionStatusScreen
FinalizeTransactionScreen
CloseTransactionScreen
```

Core features:

* list transactions
* search transactions
* create transaction
* view transaction detail
* update status
* finalize final price
* record final payment
* close transaction
* open invoice PDF
* share invoice/tracking link to WhatsApp

Search by:

* plate number
* invoice number
* customer name

Filters:

* status
* branch
* date range

---

### Create Transaction Flow

The transaction creation flow must be simple:

```text
1. Select or create customer
2. Add one or more vehicles
3. Select service type for each vehicle
4. Input estimated price per item
5. Input DP amount
6. Set estimated finish date
7. Submit transaction
8. Show invoice/tracking share option
```

Important business rule:

```text
One transaction can contain multiple vehicles.
```

---

### Transaction Status Flow

```text
DRAFT
  ↓
ON_PROCESS
  ↓
READY_TO_PICKUP
  ↓
COMPLETED
  ↓
CLOSED
```

Rules:

* Do not allow random status transition
* Final payment is required before CLOSED
* No debt allowed
* No installment allowed
* Refund allowed if final total is lower than estimated total

---

### Customers Module

Screens:

```text
CustomerListScreen
CustomerDetailScreen
CustomerFormScreen
```

Features:

* search customer
* create customer
* edit customer
* view customer transaction history

---

### Vehicles Module

Screens:

```text
VehicleListScreen
VehicleFormScreen
VehicleDetailScreen
```

Features:

* create vehicle
* edit vehicle
* search by plate number
* connect vehicle to customer

---

### Payments Module

Payment types:

```text
DP
FINAL_PAYMENT
REFUND
```

Payment method for MVP:

```text
CASH
```

Rules:

* no installment UI
* no payment gateway
* no debt
* payment logs are append-only

---

### Tracking Module

Screen:

```text
TrackingSearchScreen
```

Tenant user can search transaction tracking by:

* invoice number
* tracking code
* plate number

Customer public tracking is handled by web frontend, not mobile app.

Mobile app only helps tenant users share tracking link.

---

### Revenue Module

Screen:

```text
RevenueScreen
```

Show KPI only:

* total revenue
* total profit
* refund total
* closed transactions
* branch revenue
* monthly revenue

No complex charts for MVP.

---

### Branches Module

Screens:

```text
BranchListScreen
BranchSelectorScreen
```

Rules:

* tenant may have multiple branches
* user can view branch-level revenue
* owner can view all branches
* selected branch can be stored locally

---

### Settings Module

Screens:

```text
SettingsScreen
ProfileScreen
TenantBrandingScreen
WhatsAppTemplateScreen
PricingRulesScreen
SubscriptionScreen
```

Features:

* view tenant profile
* upload tenant logo JPG
* manage WhatsApp template
* manage pricing rules
* view subscription status

For MVP:

* fixed app theme
* no dark mode
* no custom theme color

---

## 8. API Integration

Base URL from environment:

```env
API_URL=http://localhost:3000/api/v1
APP_NAME=STNK Bureau Mobile
```

Use centralized Axios instance:

```text
src/shared/services/api-client.ts
```

Must support:

* base URL config
* JWT access token injection
* refresh token handling
* standardized error handling
* logout on refresh failure
* subscription expired handling

---

## 9. API Response Standard

Backend response format:

### Success

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

Mobile app must normalize this response format.

---

## 10. Required API Endpoints

### Auth

```http
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

### Dashboard

```http
GET /dashboard/tenant
GET /dashboard/branch/:branchId
```

### Branches

```http
GET /branches
POST /branches
GET /branches/:id
PUT /branches/:id
DELETE /branches/:id
```

### Customers

```http
GET /customers
POST /customers
GET /customers/:id
PUT /customers/:id
```

### Vehicles

```http
GET /vehicles
POST /vehicles
GET /vehicles/:id
PUT /vehicles/:id
```

### Service Types

```http
GET /service-types
```

Tenant cannot create service types.

Service types are controlled by Super Admin from Web Admin Dashboard.

### Pricing Rules

```http
GET /pricing-rules
POST /pricing-rules
PUT /pricing-rules/:id
```

### Transactions

```http
GET    /transactions
POST   /transactions
GET    /transactions/:id
PATCH  /transactions/:id/status
POST   /transactions/:id/finalize
POST   /transactions/:id/close
GET    /transactions/:id/invoice
```

### Payments

```http
GET  /transactions/:id/payments
POST /transactions/:id/payments
```

### Export

Mobile export optional for MVP.

Primary Excel export can be handled on web dashboard first.

---

## 11. State Management

Use Zustand for local/client state:

* auth state
* user session
* selected branch
* UI state
* temporary transaction draft if needed

Use TanStack Query for server state:

* transactions
* customers
* vehicles
* dashboard data
* pricing rules
* branches
* payments

Do not store server response lists permanently in Zustand unless necessary.

---

## 12. TypeScript Types

Required shared types:

```text
ApiResponse<T>
PaginatedMeta
User
Tenant
Branch
Customer
Vehicle
ServiceType
PricingRule
Transaction
TransactionItem
Payment
DashboardKpi
Subscription
```

Types must match backend DTO/API contract.

---

## 13. Form System

Use:

* React Hook Form
* Zod validation

Forms required:

* Login form
* Customer form
* Vehicle form
* Transaction form
* Final payment form
* Pricing rule form
* WhatsApp template form
* Tenant logo upload form

Validation must be user-friendly and operational.

Avoid long complicated forms.

---

## 14. UX Rules

The mobile app must be optimized for field operations.

Rules:

* large touch targets
* simple labels
* minimal typing
* fast search
* clear status badge
* clear CTA buttons
* short forms
* no complex chart
* no dark mode initially
* no offline mode for MVP

Internet connection is required.

No offline sync required.

---

## 15. Error Handling

Mobile app must handle:

* validation error
* unauthorized error
* forbidden error
* subscription expired
* server error
* network error
* failed refresh token

Use global error helper:

```text
src/shared/services/api-error.ts
```

Show user-friendly Indonesian messages.

---

## 16. Security

Security requirements:

* store tokens securely
* never hardcode API keys
* never send tenant_id manually
* tenant_id must come from JWT on backend
* logout if refresh token fails
* block access if subscription expired
* do not expose sensitive data

---

## 17. File Upload

Tenant logo upload:

* JPG only
* use multipart/form-data
* endpoint handled by backend

Document upload is not required for MVP.

Document requirements are checklist only.

---

## 18. WhatsApp Integration

Mobile app must not send WhatsApp directly through provider API.

Mobile app only triggers backend actions.

Backend handles:

* PDF invoice generation
* WhatsApp queue
* retry mechanism
* message sending

Mobile app may open native WhatsApp share if backend returns a tracking link or invoice URL.

---

## 19. Subscription Behavior

If subscription is expired:

* login should be blocked by backend
* app should show a clear expired subscription message
* user should be directed to contact platform owner

Public customer tracking remains active but is not handled inside mobile app.

---

## 20. Environment Variables

`.env.example`:

```env
API_URL=http://localhost:3000/api/v1
APP_NAME=STNK Bureau Mobile
TRACKING_URL=http://localhost:3001/tracking
```

---

## 21. Available Scripts

Example:

```bash
npm install
npm run start
npm run android
npm run ios
npm run lint
npm run typecheck
```

If using Expo:

```bash
npm install
npx expo start
```

---

## 22. MVP Development Priority

Build in this order:

1. Project setup
2. Navigation setup
3. Auth flow
4. API client + token handling
5. Dashboard KPI
6. Branch selector
7. Customer CRUD
8. Vehicle CRUD
9. Transaction list
10. Transaction detail
11. Create transaction flow
12. Status update flow
13. Payment/finalization flow
14. Invoice/tracking share
15. Revenue KPI
16. Settings
17. Subscription expired handling
18. Final polish

---

## 23. Documentation Required

Create or update:

* README.md
* MOBILE_ARCHITECTURE.md
* API_MAPPING_MOBILE.md
* ENVIRONMENT_SETUP.md
* TODO_MOBILE.md

---

## 24. Final Goal

This mobile app must be:

* fast
* simple
* production-ready
* easy for bureau users
* integrated with backend API
* compatible with multi-tenant SaaS architecture
* ready for Android deployment

---

# SUPER PROMPT FOR CLAUDE SONNET - MOBILE APP INITIALIZATION

Use this prompt in Claude Code or any coding agent with access to the mobile project folder.

```text
You are a Senior React Native Engineer, Mobile System Architect, and TypeScript Engineer.

Your task is to initialize and build the Mobile App for the STNK Bureau Service Management SaaS Platform.

Before writing code, read the mobile README.md and understand the full architecture.

The mobile app is the tenant operational app used by Indonesian STNK bureau service owners/admins.

The app must connect to an existing backend API built with Node.js + Express + PostgreSQL.

━━━━━━━━━━━━━━━━━━━━━━
# MAIN OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━

Initialize a production-ready React Native + TypeScript mobile application following the README.md architecture.

The app must support:

- login
- JWT token storage
- refresh token handling
- subscription expired handling
- dashboard KPI
- branch selection
- customer management
- vehicle management
- transaction management
- multiple vehicles per transaction
- transaction status workflow
- DP/final/refund payment display
- invoice PDF access
- tracking link sharing
- revenue KPI
- tenant settings

Do not implement features outside README.md unless requested.

━━━━━━━━━━━━━━━━━━━━━━
# TECH STACK
━━━━━━━━━━━━━━━━━━━━━━

Use:

- React Native
- TypeScript
- React Navigation
- TanStack Query
- Zustand
- Axios
- React Hook Form
- Zod
- NativeWind or clean StyleSheet-based UI
- MMKV or AsyncStorage for token storage

If the project is not initialized yet, initialize it using the most practical React Native setup available in this repository.

If Expo is already used, continue with Expo.
If bare React Native is already used, continue with bare React Native.
Do not migrate frameworks unless necessary.

━━━━━━━━━━━━━━━━━━━━━━
# REQUIRED PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━

Create or maintain this structure:

src/
├── app/
│   ├── AppProvider.tsx
│   └── queryClient.ts
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── types.ts
│
├── modules/
│   ├── auth/
│   ├── dashboard/
│   ├── transactions/
│   ├── customers/
│   ├── vehicles/
│   ├── payments/
│   ├── tracking/
│   ├── revenue/
│   ├── branches/
│   ├── settings/
│   └── subscription/
│
├── shared/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   ├── constants/
│   ├── validators/
│   └── types/
│
├── theme/
└── assets/

Each module should contain:

api/
components/
hooks/
screens/
schemas/
types/

━━━━━━━━━━━━━━━━━━━━━━
# API INTEGRATION RULES
━━━━━━━━━━━━━━━━━━━━━━

Create centralized API client:

src/shared/services/api-client.ts

Requirements:

- base URL from environment
- inject JWT access token
- handle 401 unauthorized
- refresh token automatically
- retry original request after refresh
- logout if refresh fails
- normalize API response
- handle subscription expired response

Backend base URL:

/api/v1

Backend response standard:

Success:
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}

Error:
{
  "success": false,
  "message": "Validation error",
  "errors": []
}

━━━━━━━━━━━━━━━━━━━━━━
# AUTH FLOW
━━━━━━━━━━━━━━━━━━━━━━

Implement auth endpoints:

POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /auth/me

Login payload:

{
  "phone": "08123456789",
  "password": "password"
}

JWT payload includes:

{
  "user_id": "uuid",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "role": "OWNER"
}

Roles in mobile:

OWNER
ADMIN

If backend returns subscription expired, show SubscriptionExpiredScreen.

━━━━━━━━━━━━━━━━━━━━━━
# NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━

Create RootNavigator:

- if not authenticated → AuthNavigator
- if authenticated → MainTabNavigator
- if subscription expired → SubscriptionExpiredScreen

Main tabs:

1. Dashboard
2. Transactions
3. Tracking
4. Revenue
5. Settings

━━━━━━━━━━━━━━━━━━━━━━
# DASHBOARD MODULE
━━━━━━━━━━━━━━━━━━━━━━

Use endpoint:

GET /dashboard/tenant
GET /dashboard/branch/:branchId

Display KPI cards only:

- revenue today
- monthly revenue
- total profit
- refund total
- active transactions
- ready pickup count
- overdue transactions

No charts for MVP.

━━━━━━━━━━━━━━━━━━━━━━
# BRANCH MODULE
━━━━━━━━━━━━━━━━━━━━━━

Use endpoints:

GET /branches
POST /branches
GET /branches/:id
PUT /branches/:id
DELETE /branches/:id

Mobile must support:

- list branches
- selected branch state
- filter dashboard/revenue by branch

━━━━━━━━━━━━━━━━━━━━━━
# CUSTOMER MODULE
━━━━━━━━━━━━━━━━━━━━━━

Use endpoints:

GET /customers
POST /customers
GET /customers/:id
PUT /customers/:id

Build:

- CustomerListScreen
- CustomerDetailScreen
- CustomerFormScreen

Support search.

━━━━━━━━━━━━━━━━━━━━━━
# VEHICLE MODULE
━━━━━━━━━━━━━━━━━━━━━━

Use endpoints:

GET /vehicles
POST /vehicles
GET /vehicles/:id
PUT /vehicles/:id

Build:

- VehicleListScreen
- VehicleFormScreen
- VehicleDetailScreen

Support plate number search.

━━━━━━━━━━━━━━━━━━━━━━
# TRANSACTION MODULE
━━━━━━━━━━━━━━━━━━━━━━

Use endpoints:

GET    /transactions
POST   /transactions
GET    /transactions/:id
PATCH  /transactions/:id/status
POST   /transactions/:id/finalize
POST   /transactions/:id/close
GET    /transactions/:id/invoice

Build:

- TransactionListScreen
- TransactionDetailScreen
- CreateTransactionScreen
- UpdateTransactionStatusScreen
- FinalizeTransactionScreen
- CloseTransactionScreen

Transaction status flow:

DRAFT
→ ON_PROCESS
→ READY_TO_PICKUP
→ COMPLETED
→ CLOSED

Rules:

- one transaction can contain multiple vehicles
- do not create installment UI
- final payment required before close
- no debt allowed
- show refund if final price is lower than estimated price
- show timeline/status logs if backend provides them

Transaction list must support search by:

- plate number
- invoice number
- customer name

Filters:

- status
- branch
- date range

━━━━━━━━━━━━━━━━━━━━━━
# PAYMENT MODULE
━━━━━━━━━━━━━━━━━━━━━━

Use endpoints:

GET  /transactions/:id/payments
POST /transactions/:id/payments

Allowed payment types:

DP
FINAL_PAYMENT
REFUND

Payment method:

CASH

Rules:

- no installment
- no payment gateway
- payment logs are append-only

━━━━━━━━━━━━━━━━━━━━━━
# TRACKING MODULE
━━━━━━━━━━━━━━━━━━━━━━

Mobile app does not host public customer tracking.

Mobile app helps tenant user search and share tracking link.

Build:

- TrackingSearchScreen

Allow search by:

- tracking code
- invoice number
- plate number

Share tracking link using native share functionality if possible.

━━━━━━━━━━━━━━━━━━━━━━
# REVENUE MODULE
━━━━━━━━━━━━━━━━━━━━━━

Build RevenueScreen.

Show KPI:

- total revenue
- total profit
- refund total
- closed transactions
- branch revenue
- monthly revenue

No charts for MVP.

━━━━━━━━━━━━━━━━━━━━━━
# SETTINGS MODULE
━━━━━━━━━━━━━━━━━━━━━━

Build:

- SettingsScreen
- ProfileScreen
- TenantBrandingScreen
- WhatsAppTemplateScreen
- PricingRulesScreen
- SubscriptionScreen

Features:

- upload tenant logo JPG
- view subscription status
- manage pricing rules
- manage WhatsApp template

Do not implement custom theme color.
Do not implement dark mode.

━━━━━━━━━━━━━━━━━━━━━━
# STATE MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━

Use Zustand for:

- auth state
- user session
- selected branch
- UI state
- temporary transaction draft if needed

Use TanStack Query for:

- server state
- API caching
- mutations
- refetching

Do not use Zustand as replacement for server cache.

━━━━━━━━━━━━━━━━━━━━━━
# TYPES
━━━━━━━━━━━━━━━━━━━━━━

Create shared TypeScript types:

ApiResponse<T>
PaginatedMeta
User
Tenant
Branch
Customer
Vehicle
ServiceType
PricingRule
Transaction
TransactionItem
Payment
DashboardKpi
Subscription

Types must match backend API contract.

━━━━━━━━━━━━━━━━━━━━━━
# UI/UX RULES
━━━━━━━━━━━━━━━━━━━━━━

The app must be optimized for operational field use.

Rules:

- simple layout
- fast input
- large touch targets
- clear labels
- minimal steps
- clear status badges
- no complex charts
- no dark mode
- no offline mode
- no complicated animations

Use Indonesian-friendly labels where appropriate.

━━━━━━━━━━━━━━━━━━━━━━
# SECURITY RULES
━━━━━━━━━━━━━━━━━━━━━━

- store tokens securely
- never hardcode API URL except through env
- never send tenant_id manually
- never expose sensitive token in logs
- logout on refresh token failure
- handle subscription expired clearly

━━━━━━━━━━━━━━━━━━━━━━
# DOCUMENTATION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━

Create or update:

README.md
MOBILE_ARCHITECTURE.md
API_MAPPING_MOBILE.md
ENVIRONMENT_SETUP.md
TODO_MOBILE.md

API_MAPPING_MOBILE.md must map screens to backend endpoints.

Example:

| Screen | Endpoint | Auth | Status |
|---|---|---|---|
| LoginScreen | POST /auth/login | No | Connected |
| DashboardScreen | GET /dashboard/tenant | Yes | Connected |

━━━━━━━━━━━━━━━━━━━━━━
# VALIDATION
━━━━━━━━━━━━━━━━━━━━━━

After implementation, run:

npm run typecheck
npm run lint
npm run build if available

If a command is not configured, document it in TODO_MOBILE.md.

Do not claim the app works if typecheck/build fails.

━━━━━━━━━━━━━━━━━━━━━━
# IMPLEMENTATION ORDER
━━━━━━━━━━━━━━━━━━━━━━

Build in this order:

1. Project dependencies
2. Folder structure
3. Theme and shared UI foundation
4. API client
5. Auth store
6. Navigation
7. Login screen
8. Subscription expired screen
9. Dashboard screen
10. Branch selector
11. Customer module
12. Vehicle module
13. Transaction list/detail
14. Create transaction flow
15. Payment/finalize/close flow
16. Tracking share
17. Revenue screen
18. Settings screen
19. Documentation
20. Typecheck/lint report

━━━━━━━━━━━━━━━━━━━━━━
# FINAL REPORT
━━━━━━━━━━━━━━━━━━━━━━

At the end, report:

1. Summary
2. Files created
3. Files changed
4. Screens implemented
5. API services implemented
6. Documentation created
7. Commands run
8. Build/typecheck result
9. Remaining TODO

Keep the project modular, clean, simple, and consistent with README.md.
```
