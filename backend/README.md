# Backend API Server

Node.js + Express + TypeScript API for STNK Bureau Service Management System.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

API Server: `http://localhost:3000`

## Project Structure

```
src/
├── config/       # Database, Redis, configuration
├── middleware/   # Auth, error handling, tenant isolation
├── routes/       # API route definitions
├── controllers/  # Request handlers
├── services/     # Business logic
├── models/       # Database queries
├── types/        # TypeScript types & interfaces
└── utils/        # Helper functions
```

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/stnk_bureau
JWT_SECRET=your_secret_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=+1234567890
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## API Routes

### Authentication
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
```

### Transactions
```
POST   /api/v1/transactions
GET    /api/v1/transactions
GET    /api/v1/transactions/:id
PUT    /api/v1/transactions/:id
```

### Tracking (Public)
```
GET    /api/v1/tracking/:tracking_token
GET    /api/v1/tracking/:tracking_token/history
```

### Admin
```
GET    /api/v1/admin/bureaus
POST   /api/v1/admin/bureaus
PUT    /api/v1/admin/bureaus/:id/subscription
POST   /api/v1/admin/promotions
```

## Database

PostgreSQL with multi-tenant architecture (shared database, `bureau_id` row-level isolation).

## Authentication

JWT-based authentication with role-based access control (OWNER, STAFF, ADMIN).

## To Implement Next

- [ ] Database schema creation ✅ DONE
  - Full PostgreSQL schema with all tables
  - Migration system
  - Test data seeding
- [ ] Auth service (login, JWT generation)
- [ ] Transaction CRUD operations
- [ ] WhatsApp notification service
- [ ] Document tracking service
- [ ] Admin bureau management
- [ ] Subscription management
- [ ] Analytics endpoints

## Database Setup

See [DATABASE.md](../DATABASE.md) for complete schema documentation.

### Quick Start

```bash
# Run migrations to create all tables
npm run migrate

# Seed test data (creates admin, bureaus, services)
npm run seed

# Or both at once
npm run migrate:seed
```

**Test Users:**
- Admin: `admin@stnkbureau.local` / `admin123456`
- Bureau Owners: Created automatically with test bureaus
