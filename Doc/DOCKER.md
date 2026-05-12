# Docker Setup for STNK Bureau System

## Overview

Complete Docker setup untuk running seluruh STNK Bureau system dengan satu command. Includes:
- Backend API (Node.js + Express)
- Frontend Dashboard (React/Next.js)
- PostgreSQL Database
- Redis Cache
- Nginx Reverse Proxy (optional, untuk production)

## Quick Start

### Development Mode (Database + Backend + Frontend)

```bash
# Build dan start semua services
docker-compose up

# Or dengan detached mode
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services akan tersedia di:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Production Mode (with Nginx)

```bash
# Build dan start dengan Nginx
docker-compose --profile production up

# Services tersedia di:
# - Backend API: http://localhost/api
# - Frontend: http://localhost/
# - Nginx: http://localhost:80
```

## Services Details

### PostgreSQL (postgres)
```yaml
Image: postgres:15-alpine
Port: 5432
Database: stnk_bureau
User: stnk_user
Password: stnk_password_dev
Volume: postgres_data (persistent storage)
```

**Health Check**: Memastikan database ready sebelum backend start

### Redis (redis)
```yaml
Image: redis:7-alpine
Port: 6379
Volume: None (dalam-memory cache)
```

**Health Check**: PING command untuk verify connectivity

### Backend (backend)
```yaml
Build: ./backend/Dockerfile
Port: 3000
Environment: Database, Redis, JWT, Twilio credentials
Depends On: postgres, redis
Command: migrate → seed → npm start
```

**Features:**
- Automatic database migration on startup
- Automatic seed data creation (admin user + test bureaus)
- Health check readiness

### Frontend (frontend)
```yaml
Build: ./frontend/Dockerfile
Port: 3001
Environment: API URL, App name
Depends On: backend
```

**Build Process:**
- Multi-stage build (builder → production)
- Next.js optimization
- Production-ready output

### Nginx (nginx) - Production Only
```yaml
Image: nginx:alpine
Port: 80, 443
Config: ./nginx.conf
Profile: production
```

**Features:**
- Reverse proxy untuk backend dan frontend
- SSL/TLS ready
- Gzip compression
- Health check endpoint (/health)

## File Structure

```
project-root/
├── docker-compose.yml          # Main Docker Compose config
├── .env.docker                 # Environment variables template
├── nginx.conf                  # Nginx configuration
├── backend/
│   ├── Dockerfile              # Backend image definition
│   ├── .dockerignore           # Files to exclude from build
│   └── src/
└── frontend/
    ├── Dockerfile              # Frontend image definition
    ├── .dockerignore           # Files to exclude from build
    └── src/
```

## Environment Variables

### Backend (.env atau .env.docker)
```
DATABASE_URL=postgresql://user:password@postgres:5432/db
REDIS_URL=redis://redis:6379
JWT_SECRET=your_secret_key
TWILIO_ACCOUNT_SID=optional
TWILIO_AUTH_TOKEN=optional
TWILIO_WHATSAPP_NUMBER=optional
NODE_ENV=production
PORT=3000
APP_URL=http://localhost:3000
TRACKING_BASE_URL=http://localhost:3000
```

### Frontend (.env.local atau dalam compose)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=STNK Bureau Admin
```

## Building Custom Images

### Build hanya Backend
```bash
docker-compose build backend
```

### Build hanya Frontend
```bash
docker-compose build frontend
```

### Build semua services
```bash
docker-compose build
```

### Build dengan no-cache (untuk fresh build)
```bash
docker-compose build --no-cache
```

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail 100
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U stnk_user -d stnk_bureau
```

### Check Container Status
```bash
docker-compose ps
```

### Restart Services
```bash
# All
docker-compose restart

# Specific
docker-compose restart backend
```

### Remove Everything (including data)
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Or remove only containers/networks (keep data)
docker-compose down
```

## Database Management

### Connect to PostgreSQL
```bash
# From host machine
psql -h localhost -U stnk_user -d stnk_bureau
# Password: stnk_password_dev

# From Docker
docker-compose exec postgres psql -U stnk_user -d stnk_bureau
```

### Run Migrations Manually
```bash
docker-compose exec backend npm run migrate
```

### Seed Test Data
```bash
docker-compose exec backend npm run seed
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U stnk_user stnk_bureau > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U stnk_user stnk_bureau < backup.sql
```

## Debugging

### Check Service Health
```bash
# View Docker events
docker-compose events

# Check network
docker network inspect <network-name>

# View resource usage
docker stats

# View container details
docker-compose inspect postgres
```

### Common Issues

**Port Already in Use**
```bash
# Change ports in docker-compose.yml
# Or kill existing process
lsof -i :3000
kill -9 <PID>
```

**Database Connection Failed**
```bash
# Ensure postgres is healthy
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

**Frontend Can't Connect to Backend**
```bash
# Verify backend is running
docker-compose logs backend

# Check network connectivity
docker-compose exec frontend ping backend

# Verify NEXT_PUBLIC_API_URL is correct
```

**Out of Disk Space**
```bash
# Clean up unused images/volumes
docker system prune -a --volumes
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Update JWT_SECRET to a strong random value
- [ ] Configure Twilio credentials if using WhatsApp
- [ ] Update POSTGRES_PASSWORD to a strong password
- [ ] Set NODE_ENV=production
- [ ] Configure SSL/TLS certificates
- [ ] Setup backup strategy for postgres_data volume
- [ ] Configure logging and monitoring
- [ ] Test database backup/restore

### Deploy with Nginx

```bash
# Build production images
docker-compose build

# Start with production profile (includes Nginx)
docker-compose --profile production up -d

# Services accessible at:
# - http://your-domain/api/* (backend)
# - http://your-domain/* (frontend)
```

### Setup SSL/TLS

Edit nginx.conf to add SSL configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
    # ... rest of config
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Monitoring and Logging

```bash
# View container metrics
docker stats

# Save logs to file
docker-compose logs > logs.txt

# Use Docker logging drivers for centralized logging
# Configure in docker-compose.yml logging section
```

## Scaling and Performance

### Increase Resource Limits

Edit docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Multiple Backend Instances

```yaml
backend:
  deploy:
    replicas: 3
```

Then configure Nginx to load balance.

## Testing in Docker

```bash
# Run backend tests in container
docker-compose exec backend npm test

# Run linting
docker-compose exec backend npm run lint
docker-compose exec frontend npm run lint
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Build and Push to Docker Registry

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: docker/setup-buildx-action@v1
      - uses: docker/build-push-action@v2
        with:
          context: ./backend
          push: true
          tags: myregistry/stnk-backend:latest
      # Repeat for frontend
```

## Support & Troubleshooting

For issues:
1. Check logs: `docker-compose logs`
2. Verify services are running: `docker-compose ps`
3. Check network: `docker network ls`
4. Test connectivity: `docker-compose exec backend ping postgres`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
