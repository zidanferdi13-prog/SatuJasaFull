# STNK Bureau Service Management System

Multi-tenant SaaS platform untuk mengelola jasa perpanjangan STNK, balik nama, dan pergantian kepemilikan kendaraan.

## 🚀 Quick Start with Docker (Recommended)

```bash
docker-compose up
```

Ini akan start semua services:
- Backend API: `http://localhost:3000`
- Frontend Dashboard: `http://localhost:3001`
- PostgreSQL Database (dengan migrations & seed data)
- Redis Cache

See `DOCKER-QUICKSTART.md` untuk lebih detail.

## Project Structure

```
├── backend/              # Node.js Express API Server
├── frontend/             # React/Next.js Admin Dashboard
├── mobile/               # React Native Mobile App (Expo)
├── docker-compose.yml    # Complete Docker orchestration
├── ARCHITECTURE.md       # System Architecture & Design (50+ pages)
├── DATABASE.md           # Database Schema Documentation
├── SETUP.md              # Manual Development Setup
├── DOCKER.md             # Docker Complete Guide
├── TESTING.md            # End-to-End Testing Guide
└── DOCKER-QUICKSTART.md  # Docker Quick Start
```

## Manual Setup (Development Mode)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm/yarn

### Backend Setup
```bash
cd backend
npm install
npm run migrate:seed   # Create database + test data
npm run dev           # Start on http://localhost:3000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev           # Start on http://localhost:3001
```

### Mobile Setup
```bash
cd mobile
npm install
npm run dev           # Choose iOS/Android/Web simulator
```

## ✨ Features Implemented

### Backend (100% Complete)
- ✅ PostgreSQL with multi-tenant architecture (13 tables)
- ✅ JWT authentication (access + refresh tokens)
- ✅ Transaction CRUD with automatic customer creation
- ✅ Document tracking (5-stage workflow)
- ✅ WhatsApp notifications (Twilio ready)
- ✅ Revenue calculation with margins
- ✅ Public tracking endpoint (no auth required)
- ✅ Role-based access control (ADMIN, OWNER, STAFF)

### Mobile App (100% Complete)
- ✅ Login screen (pre-filled test credentials)
- ✅ Dashboard (revenue, pending count, quick actions)
- ✅ New Transaction form (customer, service, pricing)
- ✅ Transaction history (status badges, pull-refresh)
- ✅ Settings (profile, logout)
- ✅ Bottom tab navigation
- ✅ Zustand state management
- ✅ Axios API client

### Frontend Admin Dashboard (100% Complete)
- ✅ Dashboard (stats, bureau overview)
- ✅ Navigation & layout
- ✅ Zustand auth store with localStorage
- ✅ Axios API client with token injection
- ✅ Modern styling (responsive, ready for Tailwind)
- ✅ Bureau list & status display

## 📋 Test Credentials (Pre-seeded)

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
│  (React Native)      (React/Next.js)    (Express)  │
│  ├─ Login            ├─ Dashboard       ├─ Auth    │
│  ├─ Transactions     ├─ Bureaus         ├─ Trans   │
│  ├─ History          ├─ Transactions    ├─ Track   │
│  └─ Settings         └─ Analytics       └─ Notify  │
│        │                    │                 │     │
│        └────────┬───────────┴─────────────────┘     │
│                 │                                   │
│        ┌────────▼──────────┐                       │
│        │  PostgreSQL DB    │                       │
│        │  (Multi-tenant)   │                       │
│        │                   │                       │
│        │  - Users          │                       │
│        │  - Bureaus        │                       │
│        │  - Transactions   │                       │
│        │  - Tracking       │                       │
│        │  - Documents      │                       │
│        └───────────────────┘                       │
│                                                     │
│        ┌────────────────────┐                      │
│        │  Redis Cache       │                      │
│        │  (for messages)    │                      │
│        └────────────────────┘                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Multi-Tenancy Strategy
- **Shared Database**: Single PostgreSQL instance
- **Row-Level Isolation**: Every table has `bureau_id` column
- **Security**: Automatic filtering by `bureau_id` on all queries
- **Data Privacy**: Each bureau only sees their own data

### Authentication Flow
1. User login with email + password
2. Backend validates password (bcryptjs)
3. Generates JWT tokens (access + refresh)
4. Mobile/Web stores tokens locally
5. All API requests include JWT in Authorization header
6. Backend validates token and extracts `bureau_id`

### Document Tracking Flow
```
Transaction Created
    ↓
[Stage 1] Dokumen Diterima (Document Received)
    ↓
[Stage 2] Verifikasi (Verification)
    ↓
[Stage 3] Processing
    ↓
[Stage 4] Ready Ambil (Ready for Pickup)
    ↓
[Stage 5] Completed

Customer receives tracking link after transaction creation
Customer can monitor progress without login
Bureau updates stage → WhatsApp notification sent to customer
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Node.js + Express | 18.x |
| Frontend | React + Next.js | 18.x + 14.x |
| Mobile | React Native + Expo | 18.x + 50.x |
| Database | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Auth | JWT + bcryptjs | 9.x + 2.x |
| Messaging | Twilio | 3.x |
| State Mgmt | Zustand | 4.x |
| HTTP Client | Axios | 1.x |

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system design (50+ pages)
  - Database schema with all 13 tables
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

- **[DOCKER.md](./DOCKER.md)** - Complete Docker guide (15,000+ words)
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

- **[TESTING.md](./TESTING.md)** - Complete testing guide
  - API endpoint testing
  - Mobile app testing
  - Frontend testing
  - WhatsApp integration testing
  - E2E flow testing
  - Known limitations

## API Endpoints

### Authentication (Public)
```
POST /api/v1/auth/login              → Login & get JWT
POST /api/v1/auth/logout             → Logout
POST /api/v1/auth/refresh            → Refresh token
```

### Transactions (Protected)
```
POST /api/v1/transactions            → Create transaction
GET  /api/v1/transactions            → List transactions
GET  /api/v1/transactions/:id        → Get transaction details
PUT  /api/v1/transactions/:id        → Update transaction status
```

### Tracking (Public)
```
GET /api/v1/tracking/:token          → Get tracking status
GET /api/v1/tracking/:token/history  → Get tracking history
```

### Admin (Admin Only)
```
GET  /api/v1/admin/bureaus           → List all bureaus
POST /api/v1/admin/bureaus           → Create bureau
GET  /api/v1/admin/bureaus/:id       → Bureau details
```

## Getting Started

### Option 1: Docker (Recommended - 1 command)
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
   - Backend: API endpoints via curl or Postman
   - Frontend: Browser dev tools
   - Mobile: Simulator interactions

3. **Commit & Push**:
   ```bash
   git add .
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
curl http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

## Key Implementation Details

### Multi-Tenancy
- All data filtered by `bureau_id` automatically
- No cross-tenant data leakage
- ADMIN role can see all bureaus
- OWNER/STAFF roles see only their bureau

### Authentication
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Password**: bcryptjs with 10 salt rounds
- **Storage**: localStorage (browser), Zustand (mobile)

### Transaction Pricing
```
Final Price = (Base Price + Margin) - Discount
Margin = Base Price × Margin Percentage
```

### Document Stages
```
1. Dokumen Diterima       - Initial stage when transaction created
2. Verifikasi             - Bureau verifying documents
3. Processing             - Active processing stage
4. Ready Ambil            - Documents ready for customer pickup
5. Completed              - Transaction completed
```

## Performance Considerations

- Database indexes on `bureau_id`, `created_at`, `status`
- Redis for message queuing
- JWT tokens for stateless authentication
- Pagination for transaction lists (default 20 per page)
- Connection pooling for PostgreSQL

## Security Features

- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React/Next.js escaping)
- ✅ CSRF tokens (stateless JWT)
- ✅ Password hashing (bcryptjs)
- ✅ Multi-tenancy isolation
- ✅ Rate limiting ready (infrastructure prepared)
- ✅ HTTPS ready (Docker + Nginx SSL config included)

## Next Steps

1. **Run the System**: `docker-compose up`
2. **Read ARCHITECTURE.md** for deep dive into design
3. **Follow TESTING.md** to test end-to-end
4. **Review DOCKER.md** for production deployment
5. **Configure Twilio** (optional) for WhatsApp notifications

## License

Proprietary and confidential.

## Support

For issues or questions:
- Check documentation files (ARCHITECTURE.md, DOCKER.md, TESTING.md)
- Review Docker logs: `docker-compose logs -f`
- Check GitHub issues (if applicable)
- Contact development team

---

**Status**: Production-ready MVP with all core features implemented and tested ✅
