# STNK Bureau Service Management System

Multi-tenant SaaS platform untuk mengelola jasa perpanjangan STNK, balik nama, dan pergantian kepemilikan kendaraan.

## Project Structure

```
├── backend/        # Node.js Express API Server
├── frontend/       # React/Next.js Admin Dashboard
├── mobile/         # React Native Mobile App (Expo)
└── ARCHITECTURE.md # System Architecture & Design
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Twilio Account (for WhatsApp integration)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

Server akan running di `http://localhost:3000`

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend akan running di `http://localhost:3001`

### Mobile Setup
```bash
cd mobile
npm install
cp .env.example .env
npm run dev
```

Pilih opsi untuk Android, iOS, atau Web simulator.

## Architecture Overview

### Three Core Components

1. **Mobile App** (Bureau/Agent)
   - Input transactions (STNK renewal, name changes, ownership transfers)
   - View daily revenue
   - Manage service pricing
   - Send WhatsApp receipts to customers

2. **Web Admin Dashboard** (Business Owner)
   - Manage all bureaus
   - Monitor transactions
   - View analytics & revenue
   - Manage subscriptions
   - Create promotional pricing

3. **Backend API** (Node.js)
   - RESTful API with JWT authentication
   - Multi-tenant isolation (shared database)
   - WhatsApp notification service
   - Document tracking system

### Database Schema

- **Multi-tenancy**: Shared PostgreSQL database with `bureau_id` field isolation
- **Key tables**: users, bureaus, services, transactions, document_tracking, customers
- **Authentication**: JWT tokens with role-based access (OWNER, STAFF, ADMIN)

### API Endpoints

#### Mobile & Web Authenticated Routes
```
POST   /api/v1/auth/login
POST   /api/v1/transactions
GET    /api/v1/transactions
GET    /api/v1/dashboard/revenue
```

#### Admin Only Routes
```
GET    /api/v1/admin/bureaus
POST   /api/v1/admin/bureaus
PUT    /api/v1/admin/bureaus/:id/subscription
POST   /api/v1/admin/promotions
```

#### Public Tracking (No Auth)
```
GET    /api/v1/tracking/:tracking_token
GET    /api/v1/tracking/:tracking_token/history
```

## Implementation Phases

### Phase 1: MVP (Core)
- [x] Project scaffolding
- [ ] Database schema & setup
- [ ] Authentication system
- [ ] Transaction creation
- [ ] WhatsApp e-receipt integration
- [ ] Basic mobile UI
- [ ] Basic web admin UI

### Phase 2: Enhancement
- [ ] Dynamic tracking stages
- [ ] Revenue dashboard
- [ ] Service pricing management
- [ ] Staff management

### Phase 3: Scale
- [ ] Analytics & reporting
- [ ] Subscription management
- [ ] Advanced permissions

## Environment Variables

See `.env.example` in each folder for required variables.

Key vars:
- `DATABASE_URL`: PostgreSQL connection
- `JWT_SECRET`: JWT signing key
- `TWILIO_*`: WhatsApp integration credentials
- `APP_URL`: Base URL for tracking links

## Development

### Running All Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Mobile
cd mobile && npm run dev
```

### Database Migrations
```bash
# To be implemented with migration tool
```

### Testing
```bash
# Each project has npm scripts for testing
npm run test
```

## Deployment

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
npm start
```

### Mobile
```bash
eas build --platform android
eas build --platform ios
```

## Support

- 📖 [Architecture Documentation](./ARCHITECTURE.md)
- 🐛 [Issue Tracker](https://github.com/yourrepo/issues)
- 💬 [Discussions](https://github.com/yourrepo/discussions)
