# STNK Bureau - Development Setup Guide

## Project Overview

This is a monorepo containing three independent applications:
- **Backend**: Node.js Express API (port 3000)
- **Frontend**: React/Next.js Admin Dashboard (port 3001)
- **Mobile**: React Native Expo App

## Prerequisites

### System Requirements
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn
- PostgreSQL 14+
- Docker & Docker Compose (optional, for database)

### External Services
- Twilio Account (for WhatsApp integration)

## Step 1: Database Setup

### Option A: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker-compose ps
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### Option B: Manual Setup

```bash
# Create database
createdb stnk_bureau

# Create user with password
createuser stnk_user -P
# When prompted, enter: stnk_password_dev

# Grant privileges
psql stnk_bureau
GRANT ALL PRIVILEGES ON DATABASE stnk_bureau TO stnk_user;
\q
```

## Step 1b: Run Database Migrations

After database is ready:

```bash
cd backend

# Install dependencies
npm install

# Run migrations (creates all tables)
npm run migrate
```

Expected output:
```
🔄 Running migrations...
⏳ Running: 001_create_initial_tables.sql
✓ Completed: 001_create_initial_tables.sql
✓ All migrations completed successfully
```

### Seed Test Data (Optional)

```bash
npm run seed
```

This creates:
- **Admin User**: 
  - Email: `admin@stnkbureau.local`
  - Password: `admin123456`
- **3 Test Bureaus** with owner accounts:
  - Biro Jasa STNK Jakarta Pusat
  - Biro Jasa STNK Bandung
  - Biro Jasa STNK Surabaya
- **Sample Services** for each bureau
- **Subscription Plans** (BASIC, PRO, ENTERPRISE)

### One-Command Setup

```bash
npm run migrate:seed
```

This runs both migrations and seeds in order.

## Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your editor
```

### .env Configuration

```
DATABASE_URL=postgresql://stnk_user:stnk_password_dev@localhost:5432/stnk_bureau
JWT_SECRET=your_very_secret_key_change_this
NODE_ENV=development
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=+1234567890
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3000
TRACKING_BASE_URL=http://localhost:3000
```

### Start Backend

```bash
npm run dev
```

Expected output:
```
✓ Database connected
✓ Server running on port 3000
```

## Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### .env Configuration

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=STNK Bureau Admin
```

### Start Frontend

```bash
npm run dev
```

Open `http://localhost:3000` (Next.js default)

## Step 4: Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### .env Configuration

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_TRACKING_BASE_URL=http://localhost:3000
```

### Start Mobile App

```bash
npm run dev
```

Choose your preferred platform:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

## Recommended Development Workflow

### Terminal Setup

Open 4 terminals:

**Terminal 1 - Backend**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend && npm run dev
```

**Terminal 3 - Mobile**
```bash
cd mobile && npm run dev
```

**Terminal 4 - Database (Optional)**
```bash
docker-compose up
# or skip if using local PostgreSQL
```

## Database Initialization

### Create Database Schema

To be implemented in `backend/src/migrations/`

Initial tables needed:
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  bureau_id UUID,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('OWNER', 'STAFF', 'ADMIN')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bureaus (Tenants)
CREATE TABLE bureaus (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  owner_id UUID REFERENCES users(id),
  phone VARCHAR,
  subscription_plan VARCHAR,
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY,
  bureau_id UUID REFERENCES bureaus(id),
  name VARCHAR NOT NULL,
  base_price DECIMAL,
  margin_percentage DECIMAL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  bureau_id UUID REFERENCES bureaus(id),
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  bureau_id UUID REFERENCES bureaus(id),
  customer_id UUID REFERENCES customers(id),
  service_id UUID REFERENCES services(id),
  amount DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Tracking
CREATE TABLE document_tracking (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  bureau_id UUID REFERENCES bureaus(id),
  current_stage INT DEFAULT 1,
  tracking_token UUID UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Connectivity

### Test Backend

```bash
curl http://localhost:3000/api/v1/tracking/test
# Should return 404 (not found) - that's expected
```

### Test Frontend

Visit `http://localhost:3000` in browser

### Test Mobile

Select your platform in Expo dev menu

## Environment Checklist

- [ ] PostgreSQL running and accessible
- [ ] Redis running (if using docker-compose)
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Mobile .env configured
- [ ] Migrations ran successfully
- [ ] Backend successfully connects to database
- [ ] All three apps start without errors

## Verifying Database Connection

### Test PostgreSQL directly

```bash
psql -U stnk_user -d stnk_bureau -h localhost

# If connected, verify tables exist:
\dt

# Should show all tables we created:
# audit_logs
# bureaus
# bureau_subscriptions
# customers
# document_stage_history
# document_tracking
# promotional_pricing
# revenue_summary
# services
# subscription_plans
# transactions
# users

# Exit
\q
```

### Test from Backend

Start the backend server:

```bash
cd backend
npm run dev
```

Look for:
```
✓ Database connected
✓ Server running on port 3000
```

This means backend successfully connected to the database!

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: password authentication failed for user "stnk_user"
```

**Solution**: 
1. Ensure PostgreSQL is running:
```bash
# Check PostgreSQL status
psql -U postgres -c "SELECT version();"

# If using docker-compose
docker-compose ps
```

2. Verify credentials in `.env`:
```bash
DATABASE_URL=postgresql://stnk_user:stnk_password_dev@localhost:5432/stnk_bureau
```

3. Test connection directly:
```bash
psql -U stnk_user -d stnk_bureau -h localhost -W
# Enter password: stnk_password_dev
```

### Migration Errors

```
Error: relation "users" already exists
```

**Solution**: Database was already migrated. Skip migration:
```bash
# Just seed with existing schema
npm run seed
```

Or reset and migrate again:
```bash
# Drop and recreate database (caution - deletes all data)
dropdb stnk_bureau
createdb stnk_bureau
npm run migrate:seed
```

### Tables Not Created

```
Error: table "users" does not exist
```

**Solution**: Migrations didn't run. Check for errors:
```bash
npm run migrate
# Look for error messages

# If migration runner not found:
npm install
npm run migrate
```

### Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solution**: Kill the process or change PORT in .env
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Token Errors in Frontend/Mobile

```
Error: Invalid token
```

**Solution**: Ensure JWT_SECRET matches between backend and clients

### CORS Error

```
Access to XMLHttpRequest blocked by CORS
```

**Solution**: Ensure backend CORS is configured for your frontend URL

## Next Steps

1. Implement database schema in backend
2. Implement authentication system
3. Create transaction endpoints
4. Build mobile UI screens
5. Build admin dashboard UI
6. Integrate WhatsApp API
7. Test end-to-end flow

## Useful Commands

```bash
# Install dependencies for all projects
npm install --workspace

# Run type checking for all
npm run typecheck --workspace

# Run linting for all
npm run lint --workspace
```

## Documentation

- [Project Architecture](./ARCHITECTURE.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Mobile README](./mobile/README.md)

## Support

Check individual project READMEs for specific setup issues.
