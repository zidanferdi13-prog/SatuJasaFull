# STNK Bureau SaaS — Frontend Architecture Master Document

## Overview

Enterprise-grade multi-tenant SaaS frontend architecture for Indonesian STNK Bureau Service Management Platform.

This document finalizes:

1. Frontend README Architecture
2. Frontend Folder Structure
3. Frontend Routing Structure
4. API Contract Standard

---

# 1. FRONTEND README ARCHITECTURE

# Frontend - Web Admin Dashboard

React/Next.js + TypeScript admin dashboard for STNK Bureau Service Management SaaS Platform.

---

## Tech Stack

### Core

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* Zustand
* TanStack Query
* Axios
* React Hook Form
* Zod
* Recharts
* ShadCN UI

### Architecture

* Feature-Based Modular Architecture
* Shared UI System
* Multi-Tenant SaaS Architecture
* JWT Authentication
* Role-Based Access Control

---

## Multi-Tenant Architecture

This system uses shared-database multi-tenant architecture.

Each tenant (bureau service) has:

* isolated data access
* custom subscription
* custom pricing
* custom branding
* branch management
* transaction ownership

All API requests are tenant-aware.

JWT payload contains:

* user_id
* tenant_id
* branch_id
* role

---

## Subscription Rules

If subscription expires:

* tenant login is blocked
* public tracking page remains accessible
* super admin can still impersonate tenant

Subscription monitoring available for:

* active subscriptions
* expired tenants
* upcoming expirations
* renewal history

---

## Tenant Branding

Each tenant can:

* upload logo
* customize WhatsApp templates
* customize invoice branding
* customize public tracking branding

---

## Transaction Workflow

Transaction statuses:

* DRAFT
* ON_PROCESS
* READY_TO_PICKUP
* COMPLETED
* CLOSED

Dashboard must support full transaction lifecycle monitoring.

---

## Public Tracking System

Customers can access tracking page without login.

Tracking page includes:

* transaction status
* timeline
* invoice information
* payment status
* estimated completion
* tenant branding

Tracking page remains active even if subscription expires.

---

## Notification Queue Monitoring

Admin dashboard supports:

* WhatsApp queue monitoring
* failed notification retry
* notification logs
* message status tracking

---

## Audit Logs

Track:

* transaction changes
* pricing changes
* subscription changes
* impersonation activities
* user activities

---

## Revenue Aggregation

Revenue available for:

* branch level
* tenant level
* platform level

---

## Security

Security features:

* JWT authentication
* protected routes
* role-based access
* tenant isolation
* secure impersonation
* refresh token flow
* API interceptor handling

---

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Dashboard:

```bash
http://localhost:3001
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=STNK Bureau Admin
```

---

## Available Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
```

---

# Main Dashboard Features

## Dashboard

* System-wide statistics
* Revenue summary
* Active transactions
* Subscription monitoring
* Recent activities
* Queue status

## Tenant Management

* Tenant list
* Create tenant
* Edit tenant
* Activate/Suspend tenant
* Manage subscription
* View tenant branches
* View tenant staff
* Tenant impersonation

## Transactions

* View all transactions
* Filter by bureau/status/date
* View transaction detail
* Export transactions
* View audit logs

## Analytics

* Revenue analytics
* Branch performance
* Service popularity
* Subscription analytics
* Customer statistics

## Promotions

* Create promotions
* Percentage discount
* Fixed discount
* Expiry rules
* Tenant-targeted promotions

## Notification Monitoring

* Pending queue
* Failed queue
* Retry actions
* Delivery logs

## Tracking Monitoring

* Tracking page access
* Tracking analytics
* Active public tracking links

## Audit Monitoring

* Transaction audit trail
* User activity logs
* System logs

---

# 2. FRONTEND FOLDER STRUCTURE

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
│
├── modules/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── dashboard/
│   ├── tenants/
│   ├── subscriptions/
│   ├── branches/
│   ├── transactions/
│   ├── customers/
│   ├── vehicles/
│   ├── analytics/
│   ├── promotions/
│   ├── notifications/
│   ├── tracking/
│   ├── monitoring/
│   ├── audit/
│   └── settings/
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── modals/
│   │   ├── cards/
│   │   └── charts/
│   │
│   ├── ui/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── utils/
│   ├── validators/
│   ├── constants/
│   └── types/
│
├── styles/
├── assets/
└── middleware.ts
```

---

# Folder Principles

## modules/

Feature-based isolation.

Each module owns:

* API
* components
* hooks
* pages
* schemas
* types
* logic

Avoid cross-module coupling.

---

## shared/

Global reusable resources.

Contains:

* UI components
* tables
* modal system
* API utilities
* interceptors
* validators
* constants

---

## app/

Next.js App Router layer.

Contains:

* route grouping
* layouts
* providers
* middleware integration

---

# 3. FRONTEND ROUTING STRUCTURE

# Public Routes

```text
/login
/forgot-password
/tracking/[trackingCode]
```

---

# Protected Dashboard Routes

```text
/dashboard
/dashboard/transactions
/dashboard/transactions/[id]
/dashboard/customers
/dashboard/vehicles
/dashboard/branches
/dashboard/revenue
/dashboard/settings
/dashboard/subscription
```

---

# Super Admin Routes

```text
/admin
/admin/tenants
/admin/tenants/[id]
/admin/subscriptions
/admin/analytics
/admin/promotions
/admin/notifications
/admin/tracking
/admin/audit
/admin/system-monitoring
```

---

# Route Grouping Structure

```text
app/
├── (auth)/
│   ├── login/
│   └── forgot-password/
│
├── (public)/
│   └── tracking/
│       └── [trackingCode]/
│
├── (dashboard)/
│   ├── dashboard/
│   ├── transactions/
│   ├── customers/
│   ├── vehicles/
│   ├── revenue/
│   ├── branches/
│   ├── settings/
│   └── subscription/
│
└── (admin)/
    ├── tenants/
    ├── analytics/
    ├── subscriptions/
    ├── promotions/
    ├── notifications/
    ├── audit/
    └── monitoring/
```

---

# Routing Rules

## Public Routes

No authentication required.

Examples:

* tracking page
* login page

---

## Protected Routes

Require:

* valid JWT
* active subscription
* tenant access

---

## Super Admin Routes

Require:

* SUPER_ADMIN role

Features:

* impersonation
* tenant management
* platform analytics
* queue monitoring

---

# 4. API CONTRACT STANDARD

# API Base URL

```text
/api/v1
```

---

# Response Standard

## Success Response

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {},
  "meta": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

---

# Authentication API

## Login

```http
POST /auth/login
```

Request:

```json
{
  "phone": "08123456789",
  "password": "password"
}
```

Response:

```json
{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "user": {}
}
```

---

## Refresh Token

```http
POST /auth/refresh
```

---

## Logout

```http
POST /auth/logout
```

---

# Tenant APIs

```http
GET /tenants
POST /tenants
GET /tenants/:id
PUT /tenants/:id
PATCH /tenants/:id/status
```

---

# Subscription APIs

```http
GET /subscriptions
POST /subscriptions
PATCH /subscriptions/:id
```

---

# Transaction APIs

## List Transactions

```http
GET /transactions
```

Query:

```text
?page=1
&limit=20
&status=ON_PROCESS
&branch_id=xxx
&search=plate
```

---

## Create Transaction

```http
POST /transactions
```

Payload:

```json
{
  "customer": {},
  "vehicles": [],
  "services": [],
  "estimated_total": 0,
  "dp_amount": 0,
  "estimated_finish_date": "2026-05-12"
}
```

---

## Update Status

```http
PATCH /transactions/:id/status
```

---

## Transaction Detail

```http
GET /transactions/:id
```

---

# Customer APIs

```http
GET /customers
POST /customers
GET /customers/:id
PUT /customers/:id
```

---

# Vehicle APIs

```http
GET /vehicles
POST /vehicles
```

---

# Revenue APIs

```http
GET /analytics/revenue
GET /analytics/profit
GET /analytics/branches
```

---

# Notification APIs

```http
GET /notifications/queue
POST /notifications/retry/:id
```

---

# Tracking APIs

## Public Tracking

```http
GET /tracking/:trackingCode
```

No authentication required.

---

# Audit APIs

```http
GET /audit-logs
```

---

# Promotion APIs

```http
GET /promotions
POST /promotions
PATCH /promotions/:id
```

---

# API Security Rules

## JWT Interceptor

Automatically inject:

```http
Authorization: Bearer TOKEN
```

---

## Tenant Isolation

Backend MUST validate:

* tenant_id from JWT
* branch ownership
* role access

Frontend MUST NEVER send tenant_id manually.

---

## Token Refresh

Automatic refresh flow:

```text
401 response
↓
refresh token request
↓
retry original request
```

---

# Query Standards

## Pagination

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

## Filtering

Supported:

* status
* branch
* date range
* search

---

## Sorting

```text
?sort=created_at:desc
```

---

# Frontend Service Layer Standard

Example:

```typescript
transactionService.getAll()
transactionService.getById()
transactionService.create()
transactionService.updateStatus()
```

---

# Zustand Store Structure

```text
store/
├── auth.store.ts
├── ui.store.ts
├── filter.store.ts
└── session.store.ts
```

---

# Query Key Standards

```typescript
['transactions']
['transactions', id]
['tenants']
['subscriptions']
```

---

# Final Architecture Principles

This frontend architecture prioritizes:

* operational speed
* scalability
* modularity
* tenant isolation
* maintainability
* enterprise SaaS standards
* simple operational UX
* low learning curve

The system is optimized for Indonesian bureau operational workflows and designed for future scaling.
