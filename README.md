# STNK Bureau Service Management System

Multi-tenant SaaS platform untuk mengelola jasa perpanjangan STNK, balik nama, dan pergantian kepemilikan kendaraan.

## Quick Start with Docker (Recommended)

```bash
docker-compose up
```

Ini akan start semua services:
- Backend API: `http://localhost:3000`
- Frontend Dashboard: `http://localhost:3001`
- PostgreSQL Database
- Redis Cache / Queue

See `DOCKER-QUICKSTART.md` untuk lebih detail.

## Project Structure

```
├── backend/              # Node.js Express API Server
├── frontend/             # Next.js Admin Dashboard
├── mobile/               # React Native Mobile App (Expo)
├── docker-compose.yml    # Docker orchestration
├── ARCHITECTURE.md       # System Architecture & Design
├── DATABASE.md           # Database Schema Documentation
├── SETUP.md              # Manual Development Setup
├── DOCKER.md             # Docker Guide
├── TESTING.md            # Testing Guide
└── DOCKER-QUICKSTART.md  # Docker Quick Start
```

## Manual Setup (Development Mode)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- npm/yarn

### Backend Setup
```bash
cd backend
npm install
npm run migrate:seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
npm run dev
```

## Features Implemented

### Backend
- PostgreSQL with multi-tenant architecture (24 Prisma models)
- Role-based access control: `SUPER_ADMIN`, `OWNER`, `ADMIN`
- JWT authentication with HttpOnly cookie support for web clients
- Refresh token rotation with hashed token sessions and reuse detection
- Redis-backed token revocation blocklist
- Global, auth, register tenant, refresh token, and public tracking rate limiters
- Tenant isolation through Prisma extension and AsyncLocalStorage context
- Soft delete support for core business models
- Transaction CRUD with automatic customer creation
- Transaction pricing, fee details, payment, refund, and status workflow
- Public tracking endpoint without authentication
- WhatsApp notifications with provider modes: `none`, `fonnte`, `wablas`
- Transaction document upload endpoints for JPEG, PNG, and PDF files up to 5MB
- STNK expiry reminder job for H-30, H-14, H-7, and H-1
- BullMQ repeatable scheduler for daily backend jobs
- Expo push notification service and device token registration endpoint
- Vitest + Supertest critical backend tests

### Mobile App
- Login screen
- Dashboard with revenue, pending count, and quick actions
- New transaction form
- Transaction history with status badges and pull-refresh
- Settings pages
- Bottom tab navigation
- Zustand state management
- Axios API client
- Push notification registration through Expo Notifications

### Frontend Admin Dashboard
- Dashboard and bureau overview
- Navigation and layout
- Zustand auth store
- Axios API client with credentials/cookie support
- Responsive styling using the current CSS approach
- Bureau list and status display

## Test Credentials (Pre-seeded)

**Admin User:**
- Email: `admin@stnkbureau.local`
- Password: `admin123456`

**Bureau Owner (for mobile app):**
- Email: `owner-biro-jasa-stnk-jakarta-pusat@stnkbureau.local`
- Password: `password123456`

**Other Test Bureaus:**
- Biro Jasa STNK Bandung
- Biro Jasa STNK Surabaya

## System Architecture

### Three Core Components

```
┌─────────────────────────────────────────────────────┐
│                  STNK Bureau System                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Mobile App          Web Admin          Backend API │
│  (React Native)      (Next.js)         (Express)   │
│  ├─ Login            ├─ Dashboard      ├─ Auth     │
│  ├─ Transactions     ├─ Bureaus        ├─ Trans    │
│  ├─ History          ├─ Transactions   ├─ Track    │
│  ├─ Push Token       └─ Settings       └─ Notify   │
│  └─ Settings                                      │
│        │                    │                 │     │
│        └────────┬───────────┴─────────────────┘     │
│                 │                                   │
│        ┌────────▼──────────┐                       │
│        │  PostgreSQL DB    │                       │
│        │  (Multi-tenant)   │                       │
│        │                   │                       │
│        │  - Tenants        │                       │
│        │  - Users          │                       │
│        │  - Vehicles       │                       │
│        │  - Transactions   │                       │
│        │  - Documents      │                       │
│        │  - Device Tokens  │                       │
│        └───────────────────┘                       │
│                                                     │
│        ┌────────────────────┐                      │
│        │  Redis             │                      │
│        │  (queues/blocklist)│                      │
│        └────────────────────┘                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Multi-Tenancy Strategy
- **Shared Database**: Single PostgreSQL instance
- **Row-Level Isolation**: Tenant-owned models use `tenantId`
- **Security**: Prisma extension injects tenant filtering from request context
- **Data Privacy**: Each tenant only sees their own data unless explicitly handled as `SUPER_ADMIN`

### Authentication Flow
1. User login with email + password
2. Backend validates password with bcryptjs
3. Backend issues JWT access and refresh tokens
4. Web clients receive HttpOnly cookies; mobile/API clients can use bearer tokens
5. Refresh tokens are stored server-side as SHA-256 hashes and rotated on refresh
6. Logout revokes the current access token through Redis blocklist
7. Backend validates token and extracts `tenant_id`, `user_id`, and role

### Document and Notification Flow
```
Transaction Created
    ↓
Document checklist / upload can be managed per transaction item
    ↓
Status updates are logged and visible through public tracking
    ↓
Customer notifications are queued through WhatsApp provider
    ↓
Staff/owner push notifications can be sent through Expo Push API
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Node.js + Express | 18.x |
| Frontend | React + Next.js | 18.x + 14.x |
| Mobile | React Native + Expo | 18.x + 50.x |
| Database | PostgreSQL | 15 |
| Cache / Queue | Redis + BullMQ | 7.x |
| Auth | JWT + bcryptjs | 9.x + 2.x |
| Messaging | WhatsApp provider (`none`, `fonnte`, `wablas`) | configurable |
| Push Notification | Expo Push API | configurable |
| State Mgmt | Zustand | 4.x |
| HTTP Client | Axios | 1.x |
| Testing | Vitest + Supertest | configured |

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
  - Database schema
  - API routes and endpoints
  - Multi-tenancy strategy
  - Data flow diagrams
  - Query examples

- **[DATABASE.md](./DATABASE.md)** - Database detailed documentation
  - Table descriptions and relationships
  - Field definitions and constraints
  - Indexes and performance tips
  - Query examples
  - SQL patterns

- **[SETUP.md](./SETUP.md)** - Manual development setup
  - Prerequisites
  - Environment variables
  - Troubleshooting
  - Database verification

- **[DOCKER.md](./DOCKER.md)** - Docker guide
  - Service setup and configuration
  - Building custom images
  - Environment variables
  - Database management
  - Production deployment
  - SSL/TLS setup
  - Monitoring and scaling

- **[DOCKER-QUICKSTART.md](./DOCKER-QUICKSTART.md)** - Quick reference
  - One-command startup
  - Essential commands
  - Test credentials
  - Common issues

- **[TESTING.md](./TESTING.md)** - Testing guide
  - API endpoint testing
  - Mobile app testing
  - Frontend testing
  - WhatsApp integration testing
  - E2E flow testing
  - Known limitations

## API Endpoints

### Authentication (Public)
```
POST /api/v1/auth/login              → Login and set auth cookies
POST /api/v1/auth/logout             → Logout and revoke current token
POST /api/v1/auth/refresh            → Rotate refresh token
```

### Notifications (Protected)
```
POST /api/v1/notifications/devices   → Register device push token
```

### Transactions (Protected)
```
POST /api/v1/transactions                                → Create transaction
GET  /api/v1/transactions                                → List transactions
GET  /api/v1/transactions/:id                            → Get transaction details
PUT  /api/v1/transactions/:id                            → Update transaction status
GET  /api/v1/transactions/:id/documents                  → List transaction documents
POST /api/v1/transactions/:id/items/:itemId/documents    → Upload item document
DELETE /api/v1/transactions/:id/documents/:documentId    → Delete transaction document
```

### Tracking (Public)
```
GET /api/v1/tracking/:token          → Get tracking status
GET /api/v1/tracking/:token/history  → Get tracking history
```

### Admin / Tenant Management
```
GET  /api/v1/admin/bureaus           → List all bureaus
POST /api/v1/admin/bureaus           → Create bureau
GET  /api/v1/admin/bureaus/:id       → Bureau details
```

## Getting Started

### Option 1: Docker (Recommended)
```bash
docker-compose up
```

### Option 2: Manual Setup
```bash
# Backend
cd backend && npm install && npm run migrate:seed && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev

# Mobile (new terminal)
cd mobile && npm install && npm run dev
```

## Development Workflow

1. **Make Changes**: Edit code in respective folders
2. **Test Changes**:
   - Backend: API endpoints via curl/Postman and `npm run test`
   - Frontend: Browser dev tools and `npm run typecheck`
   - Mobile: Simulator/device interactions and `npm run typecheck`

3. **Commit & Push**:
   ```bash
   git add <files>
   git commit -m "your message"
   git push origin branch-name
   ```

## Common Commands

### Docker
```bash
docker-compose up                    # Start all services
docker-compose up -d                 # Start in background
docker-compose down                  # Stop all services
docker-compose logs -f               # View logs
docker-compose ps                    # Check status
```

### Backend
```bash
npm install                          # Install dependencies
npm run migrate                      # Run database migrations
npm run seed                         # Seed test data
npm run dev                          # Start development server
npm run build                        # Build for production
npm start                            # Run production server
npm run lint                         # Run ESLint
npm run typecheck                    # Run TypeScript check
npm run test                         # Run backend tests
```

### Frontend
```bash
npm install                          # Install dependencies
npm run dev                          # Start dev server
npm run build                        # Build for production
npm start                            # Run production server
npm run lint                         # Run ESLint
npm run typecheck                    # Run TypeScript check
```

### Mobile
```bash
npm install                          # Install dependencies
npm run dev                          # Start Expo dev server
npm run android                      # Open Android emulator
npm run ios                          # Open iOS simulator
npm run web                          # Start web version
npm run typecheck                    # Run TypeScript check
```

## Troubleshooting

### Docker Issues
```bash
# Clean start
docker-compose down -v
docker-compose build --no-cache
docker-compose up

# Check logs
docker-compose logs -f service-name
```

### Database Issues
```bash
# Connect to database
docker-compose exec postgres psql -U stnk_user -d stnk_bureau

# Run migrations
docker-compose exec backend npm run migrate

# Seed data
docker-compose exec backend npm run seed
```

### API Connection Issues
```bash
# Test backend health
curl http://localhost:3000/health
```

## Key Implementation Details

### Multi-Tenancy
- Tenant-owned data is filtered by `tenantId` automatically in Prisma queries
- Prisma extension and AsyncLocalStorage provide request-scoped tenant context
- `SUPER_ADMIN` operations can be handled separately from tenant-scoped operations
- `OWNER` and `ADMIN` operate within their tenant context

### Authentication
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Password**: bcryptjs with 10 salt rounds
- **Web Storage**: HttpOnly cookies set by backend
- **Mobile/API Auth**: bearer token compatible
- **Revocation**: Redis blocklist for logged-out access tokens
- **Refresh Rotation**: server-side hashed refresh token sessions

### Transaction Pricing
```
Remaining Amount = Final Total - DP Amount
Refund Amount = max(DP Amount - Final Total, 0)
```

### Documents and STNK Reminder
- Transaction item documents support JPEG, PNG, and PDF uploads up to 5MB
- Document records are soft-deletable
- Vehicle records can store `stnkExpiryDate`
- Daily STNK reminder job targets H-30, H-14, H-7, and H-1

## Performance Considerations

- Database indexes on tenant, status, tracking, invoice, expiry, and soft-delete fields
- Redis for queueing, scheduled jobs, and token blocklist
- Pagination for list endpoints
- Connection pooling for PostgreSQL

## Security Features

- SQL injection prevention through Prisma parameterized queries
- Password hashing with bcryptjs
- JWT secrets validated at startup with no fallback secret
- HttpOnly cookie support for web authentication
- Refresh token rotation and reuse detection
- Redis-backed token revocation
- Multi-tenancy isolation
- Rate limiting for global API, auth, refresh, register tenant, and tracking routes
- Soft delete support for audit-sensitive data
- Docker Compose database/cache credentials sourced from environment variables

## Next Steps

1. Complete remaining Phase B hardening tasks from `Doc/IMPLEMENTATION_PROGRESS_1905.md`
2. Add minimal CI pipeline
3. Configure Sentry for backend and mobile
4. Add privacy policy and account deletion endpoint
5. Add Android adaptive icon
6. Harden backend Dockerfile and CORS/CSP settings

## License

Proprietary and confidential.

## Support

For issues or questions:
- Check documentation files (ARCHITECTURE.md, DOCKER.md, TESTING.md)
- Review Docker logs: `docker-compose logs -f`
- Check GitHub issues (if applicable)
- Contact development team

---

**Status**: Phase B hardening in progress. See `Doc/IMPLEMENTATION_PROGRESS_1905.md` for the current audit roadmap status.
