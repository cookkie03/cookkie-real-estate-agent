# CRM Immobiliare - Deployment Guide

**Version**: 4.0.0 (Phase 1-4 Complete)
**Last Updated**: 2025-11-14

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 8.15.0 or higher
- **PostgreSQL** 16 (production) or SQLite (development)
- **Redis** 7.x (for cache & queue)
- **Docker** & **Docker Compose** (optional, recommended)

## 🚀 Quick Start (Docker)

**Recommended for production deployment**:

```bash
# 1. Clone repository
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# 2. Create environment files
cp .env.example .env
# Edit .env with your configuration

# 3. Start services with Docker Compose
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

# 4. Check health
curl http://localhost:3001/api/health
```

**Services started:**
- API: http://localhost:3001
- Web: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 🛠️ Manual Deployment

### 1. Install Dependencies

```bash
# Install pnpm globally
npm install -g pnpm@8.15.0

# Install project dependencies
pnpm install
```

### 2. Configure Environment

```bash
# Backend API (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/crm_immobiliare"
JWT_SECRET="your-super-secret-jwt-key-change-this"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google/callback"
WHATSAPP_ACCESS_TOKEN="your-whatsapp-access-token"
WHATSAPP_PHONE_NUMBER_ID="your-whatsapp-phone-number-id"
REDIS_URL="redis://localhost:6379"
PORT=3001
```

### 3. Database Setup

```bash
# Generate Prisma Client
pnpm prisma:generate

# Push schema to database
pnpm prisma:push

# (Optional) Seed database with sample data
pnpm prisma:seed
```

### 4. Build Applications

```bash
# Build all packages
pnpm build

# Or build specific apps
pnpm --filter @crm-immobiliare/api build
pnpm --filter @crm-immobiliare/web build
```

### 5. Run Services

```bash
# Development mode (with hot reload)
pnpm dev

# Production mode
pnpm start
```

---

## 📦 Docker Deployment

### Build Images

```bash
# Build API image
docker build -t crm-immobiliare-api:latest -f apps/api/Dockerfile .

# Build Web image
docker build -t crm-immobiliare-web:latest -f apps/web/Dockerfile .
```

### Run with Docker Compose

```bash
# Production stack
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

# View logs
docker-compose -f infrastructure/docker/docker-compose.prod.yml logs -f

# Stop services
docker-compose -f infrastructure/docker/docker-compose.prod.yml down
```

---

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key-min-32-chars` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT` | API port | `3001` |

### Optional Integration Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Business API token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID |
| `GOOGLE_API_KEY` | Google AI/Gemini API key |

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value (min 32 characters)
- [ ] Use HTTPS (configure reverse proxy like Nginx)
- [ ] Set up firewall rules (only expose ports 80, 443)
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Enable logging aggregation
- [ ] Review CORS settings
- [ ] Scan dependencies for vulnerabilities (`pnpm audit`)

---

## 📊 Monitoring

### Health Checks

```bash
# API health
curl http://localhost:3001/api/health

# Database connection
curl http://localhost:3001/api/health/db

# Redis connection
curl http://localhost:3001/api/health/redis
```

### Logs

```bash
# View API logs
docker logs -f crm-api

# View all logs
docker-compose logs -f
```

### Metrics

Access Prometheus metrics at:
```
http://localhost:3001/metrics
```

---

## 🗄️ Database Migrations

### Development

```bash
# Create migration
pnpm prisma:migrate dev --name your_migration_name

# Apply migrations
pnpm prisma:migrate deploy
```

### Production

```bash
# ALWAYS backup database first!
pg_dump -U user -d crm_immobiliare > backup.sql

# Apply migrations
pnpm prisma:migrate deploy

# Verify
pnpm prisma:studio
```

---

## 🔄 Updates & Rollbacks

### Update to Latest

```bash
# Pull latest code
git pull origin main

# Rebuild
pnpm install
pnpm build

# Restart services
pm2 restart all
# OR with Docker:
docker-compose up -d --build
```

### Rollback

```bash
# Git rollback
git checkout <previous-commit-hash>

# Rebuild
pnpm install
pnpm build

# Restart
pm2 restart all
```

---

## 🚨 Troubleshooting

### API won't start

```bash
# Check database connection
psql -U user -d crm_immobiliare -c "SELECT 1"

# Check Redis
redis-cli ping

# Check logs
docker logs crm-api
```

### Database migration failed

```bash
# Reset database (DEVELOPMENT ONLY!)
pnpm prisma:reset

# For production, manually fix migration
pnpm prisma:studio
```

### Out of memory

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm start
```

---

## 📈 Performance Tuning

### Database

```sql
-- Create indexes (already in schema)
-- Monitor slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;
```

### Redis Cache

```bash
# Monitor cache hit rate
redis-cli info stats
```

### Node.js

```bash
# Use PM2 for clustering
pm2 start ecosystem.config.js --env production
```

---

## 📞 Support

- **Documentation**: `/docs/README.md`
- **GitHub Issues**: https://github.com/cookkie03/cookkie-real-estate-agent/issues
- **API Docs**: http://localhost:3001/api/docs (Swagger)

---

## 📝 Next Steps After Deployment

1. ✅ Verify all health checks pass
2. ✅ Test authentication (JWT + Google OAuth)
3. ✅ Create first admin user
4. ✅ Configure integrations (Gmail, WhatsApp, Calendar)
5. ✅ Set up monitoring alerts
6. ✅ Configure automated backups
7. ✅ Test WebSocket connections
8. ✅ Review API documentation at `/api/docs`

---

**Deployment Complete!** 🎉

Your CRM Immobiliare instance is now ready for production use.
