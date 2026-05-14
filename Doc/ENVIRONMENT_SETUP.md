# Environment Setup — STNK Bureau SaaS

> Copy these to `.env` (backend) and `.env.local` (frontend) before running.

---

## Backend — `backend/.env`

```env
# ── Server ────────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── Database ──────────────────────────────────────────────────────────────────
# Local dev (Docker):
DATABASE_URL=postgresql://postgres:password@localhost:5432/stnk_bureau
# Docker Compose (container-to-container):
# DATABASE_URL=postgresql://postgres:password@postgres:5432/stnk_bureau

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
# Docker Compose: REDIS_URL=redis://redis:6379

# ── JWT ───────────────────────────────────────────────────────────────────────
# IMPORTANT: Use strong random secrets in production (e.g. openssl rand -hex 64)
JWT_ACCESS_SECRET=change_this_access_secret_min_32_chars
JWT_REFRESH_SECRET=change_this_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Storage ───────────────────────────────────────────────────────────────────
INVOICE_STORAGE_PATH=./storage/invoices
TENANT_LOGO_STORAGE_PATH=./uploads/tenant-logos

# ── App URLs ──────────────────────────────────────────────────────────────────
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
TRACKING_URL=http://localhost:3001/tracking

# ── CORS ──────────────────────────────────────────────────────────────────────
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000

# ── WhatsApp (optional — leave blank for MVP manual mode) ────────────────────
WHATSAPP_PROVIDER=manual
WHATSAPP_API_URL=
WHATSAPP_API_KEY=
```

---

## Frontend — `frontend/.env.local`

```env
# ── API ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME=STNK Bureau Admin
```

---

## Docker Compose — override for containers

When running via `docker compose up`, use the Docker-internal hostnames:

```env
# backend container
DATABASE_URL=postgresql://postgres:password@postgres:5432/stnk_bureau
REDIS_URL=redis://redis:6379
ALLOWED_ORIGINS=http://localhost:3001

# frontend container
NEXT_PUBLIC_API_URL=http://localhost/api/v1
```

The `nginx.conf` proxies:
- `http://localhost/api/v1/*` → `http://backend:3000/api/v1/*`
- `http://localhost/*` → `http://frontend:3001/*`

---

## Variable Reference

### Backend

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` / `production` |
| `PORT` | Yes | HTTP port (default 3000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string (used by BullMQ) |
| `JWT_ACCESS_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | Yes | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Refresh token TTL (default `7d`) |
| `INVOICE_STORAGE_PATH` | Yes | Filesystem path for generated PDFs |
| `TENANT_LOGO_STORAGE_PATH` | Yes | Filesystem path for uploaded logos |
| `APP_URL` | Yes | Backend public URL |
| `FRONTEND_URL` | Yes | Frontend public URL |
| `TRACKING_URL` | Yes | Public tracking page base URL (`FRONTEND_URL/tracking`) |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS allowed origins |
| `WHATSAPP_PROVIDER` | No | `manual` (default MVP) or provider name |
| `WHATSAPP_API_URL` | No | External WhatsApp API endpoint |
| `WHATSAPP_API_KEY` | No | External WhatsApp API key |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (must be `NEXT_PUBLIC_` prefix for browser) |
| `NEXT_PUBLIC_APP_NAME` | No | Display name in browser tab / header |

---

## Quick Start (local dev without Docker)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT secrets
npm install
npm run migrate       # npx prisma migrate dev
npm run seed          # seed super admin
npm run dev           # starts on :3000
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev           # starts on :3001
```

### With Docker
```bash
# From project root
docker compose up -d
# API:      http://localhost/api/v1
# Frontend: http://localhost
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong random secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Use TLS/HTTPS in `FRONTEND_URL` and `TRACKING_URL`
- [ ] Set `ALLOWED_ORIGINS` to production frontend domain only
- [ ] Configure `WHATSAPP_API_URL` + `WHATSAPP_API_KEY` for actual sending
- [ ] Ensure `INVOICE_STORAGE_PATH` is writable and persistent (volume mount in Docker)
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL in frontend build
