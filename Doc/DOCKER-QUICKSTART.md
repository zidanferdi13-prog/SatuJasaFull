# Docker Quick Start

## One-Command Setup

```bash
# 1. Clone/navigate to project
cd d:/Project\ Lain/Jasaku-Dev1

# 2. Start everything
docker-compose up

# 3. Done! Access at:
#    Backend: http://localhost:3000
#    Frontend: http://localhost:3001
#    Database: localhost:5432
#    Cache: localhost:6379
```

## Wait for Startup

On first run, backend will:
1. Migrate database schema (create tables)
2. Seed test data (admin user + test bureaus)
3. Start API server

This takes ~30-60 seconds. Watch logs:
```bash
docker-compose logs -f backend
```

When you see:
```
✓ Database connected
✓ Server running on port 3000
```

Backend is ready!

## Test Everything Works

### Backend Health Check
```bash
curl http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner-biro-jasa-stnk-jakarta-pusat@stnkbureau.local","password":"password123456"}'
```

### Frontend Access
Open browser: http://localhost:3001

### Database Access
```bash
docker-compose exec postgres psql -U stnk_user -d stnk_bureau
# Password: stnk_password_dev
```

## Stop Everything
```bash
docker-compose down
```

## Useful Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up` | Start all services |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View all logs |
| `docker-compose logs -f backend` | View backend logs only |
| `docker-compose ps` | List running services |
| `docker-compose exec backend sh` | Access backend shell |
| `docker-compose restart backend` | Restart backend |
| `docker-compose build` | Rebuild images |

## First Time Setup Credentials

**Admin:**
- Email: `admin@stnkbureau.local`
- Password: `admin123456`

**Bureau Owner (for mobile app):**
- Email: `owner-biro-jasa-stnk-jakarta-pusat@stnkbureau.local`
- Password: `password123456`

## Full Documentation
See `DOCKER.md` for detailed documentation.
