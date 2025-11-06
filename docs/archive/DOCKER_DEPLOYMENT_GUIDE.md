# 🐳 DOCKER DEPLOYMENT - Complete Guide

**Created**: 2025-11-06
**Branch**: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`
**Works with**: Docker Desktop + Railway

---

## 🎯 OVERVIEW

This project now supports **TWO deployment methods**:

1. **Local Development** - Docker Desktop (any OS)
2. **Production** - Railway with Docker

**Both use the same Docker images** = consistency guaranteed!

---

## 📦 WHAT'S INCLUDED

**Docker Images**:
- ✅ Backend (Next.js 14 + Prisma)
- ✅ Frontend (Next.js 14 + React)
- ✅ AI Tools (FastAPI + Python)
- ✅ PostgreSQL (local dev only)

**Docker Compose Files**:
- `docker-compose.yml` - Local development (includes PostgreSQL)
- `docker-compose.railway.yml` - Railway production (uses Railway PostgreSQL)

**Dockerfiles**:
- `backend/Dockerfile` - Multi-stage optimized
- `frontend/Dockerfile` - Multi-stage optimized
- `ai_tools/Dockerfile` - Python FastAPI

---

## 🚀 METHOD 1: LOCAL DEVELOPMENT (Docker Desktop)

### Prerequisites

- Docker Desktop installed (Windows/Mac/Linux)
- Git
- Google API Key (get from https://aistudio.google.com/app/apikey)

### Step 1: Clone & Configure (5 min)

```bash
# Clone repository
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# Checkout correct branch
git checkout claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4

# Create .env file
cat > .env << 'EOF'
# Google API Key (REQUIRED)
GOOGLE_API_KEY=your_actual_google_api_key_here

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your_random_secret_here
EOF
```

### Step 2: Start All Services (10 min first time, 2 min later)

```bash
# Build and start all services
docker-compose up -d

# This will:
# - Build backend image (~5 min)
# - Build frontend image (~5 min)
# - Build AI tools image (~3 min)
# - Start PostgreSQL database
# - Start all services
```

### Step 3: Initialize Database (2 min)

```bash
# Run Prisma migration to create tables
docker-compose exec backend npx prisma db push --schema=./database/prisma/schema.prisma

# (Optional) Seed with fake data
docker-compose exec backend npx tsx database/prisma/seed.ts
```

### Step 4: Access Application

**Services Running**:
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:3001
- 🤖 AI Tools: http://localhost:8000
- 🗄️ PostgreSQL: localhost:5432

**Test Health**:
```bash
# Backend health
curl http://localhost:3001/api/health

# AI Tools health
curl http://localhost:8000/health
```

### Useful Commands

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai-tools

# Stop all services
docker-compose down

# Stop and remove volumes (DELETES DATABASE!)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# Restart a service
docker-compose restart backend

# Access service shell
docker-compose exec backend sh
docker-compose exec ai-tools bash
```

---

## 🚂 METHOD 2: RAILWAY DEPLOYMENT (Production)

### Prerequisites

- Railway account (https://railway.app)
- GitHub repository
- Google API Key

### Option A: Automatic Railway Deployment (EASIEST)

**Railway will automatically detect Docker setup!**

1. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project"
   - Click "Deploy from GitHub repo"
   - Select: `cookkie03/cookkie-real-estate-agent`
   - Select branch: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`

2. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway provisions database automatically
   - `DATABASE_URL` is auto-set

3. **Set Environment Variables**

   Go to your service → "Variables" tab:

   ```bash
   # Required
   DATABASE_URL=<auto-provided by Railway>
   GOOGLE_API_KEY=your_actual_key_here
   NODE_ENV=production
   SESSION_SECRET=<generate random>
   CORS_ORIGINS=https://your-app.railway.app

   # Optional
   PORT=3001
   ```

4. **Deploy**
   - Railway detects `backend/Dockerfile`
   - Builds Docker image
   - Deploys automatically
   - Done! 🎉

### Option B: Manual Docker Compose on Railway

**Use `docker-compose.railway.yml`** for multi-service deployment:

1. **Create railway.toml** in root:
   ```toml
   [build]
   builder = "DOCKERFILE"
   dockerfilePath = "backend/Dockerfile"

   [deploy]
   startCommand = "node server.js"
   healthcheckPath = "/api/health"
   healthcheckTimeout = 100
   restartPolicyType = "ON_FAILURE"
   ```

2. **Deploy via Railway CLI**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Link project
   railway link

   # Deploy
   railway up
   ```

### Post-Deployment: Initialize Database

```bash
# Via Railway CLI
railway run npx prisma db push

# Or via Railway dashboard
# Go to service → "Deploy" → Add "Build Command"
# Add: npx prisma db push --schema=./database/prisma/schema.prisma
```

---

## 🔧 DOCKER ARCHITECTURE

### Multi-Stage Builds

**Backend Dockerfile** (3 stages):
1. **deps**: Install dependencies only
2. **builder**: Build application
3. **runner**: Minimal production image

**Benefits**:
- Small image size (~200MB vs ~1GB)
- Fast builds (layer caching)
- Security (non-root user)

### Health Checks

All services have health checks:
- Backend: `/api/health`
- Frontend: `/` (homepage)
- AI Tools: `/health`

**Railway will**:
- Wait for health check before routing traffic
- Restart if health check fails
- Show service status in dashboard

### Networking

**Local** (docker-compose.yml):
```
database:5432 → PostgreSQL
backend:3001 → Backend API
frontend:3000 → Frontend UI
ai-tools:8000 → AI FastAPI
```

**Railway**:
```
<railway-db> → PostgreSQL (Railway service)
<backend-service> → Backend API
<frontend-service> → Frontend UI
<ai-tools-service> → AI FastAPI
```

---

## 📝 ENVIRONMENT VARIABLES REFERENCE

### Backend Service

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | ✅ YES | `postgresql://...` | Auto from Railway PostgreSQL |
| `GOOGLE_API_KEY` | ✅ YES | `AIza...` | From Google AI Studio |
| `NODE_ENV` | ✅ YES | `production` | |
| `PORT` | ⚠️ Recommended | `3001` | Railway sets automatically |
| `SESSION_SECRET` | ✅ YES | `random_32_chars` | Generate: `openssl rand -base64 32` |
| `CORS_ORIGINS` | ⚠️ Recommended | `https://app.railway.app` | Your Railway domain |

### Frontend Service

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | ✅ YES | `https://backend.railway.app` | Backend service URL |
| `NODE_ENV` | ✅ YES | `production` | |
| `PORT` | ⚠️ Recommended | `3000` | |

### AI Tools Service

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | ✅ YES | `postgresql://...` | Same as backend |
| `GOOGLE_API_KEY` | ✅ YES | `AIza...` | Same as backend |
| `PORT` | ⚠️ Recommended | `8000` | |

---

## 🛠️ DEVELOPMENT WORKFLOW

### Making Changes

1. **Edit code** in your IDE

2. **Rebuild affected service**:
   ```bash
   # Rebuild specific service
   docker-compose up -d --build backend

   # Or rebuild all
   docker-compose up -d --build
   ```

3. **Test locally**:
   ```bash
   # Check logs
   docker-compose logs -f backend

   # Test endpoint
   curl http://localhost:3001/api/health
   ```

4. **Commit & push**:
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4
   ```

5. **Railway auto-deploys** from GitHub push!

### Database Changes

If you modify Prisma schema:

```bash
# Local
docker-compose exec backend npx prisma generate
docker-compose exec backend npx prisma db push
docker-compose restart backend

# Railway (via CLI)
railway run npx prisma generate
railway run npx prisma db push
```

---

## 🐛 TROUBLESHOOTING

### Local Development Issues

**Problem**: Service won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Port already in use
docker-compose down
lsof -ti:3001 | xargs kill  # Kill process on port 3001

# 2. Database not ready
docker-compose restart database
docker-compose up -d backend

# 3. Build cache issues
docker-compose build --no-cache backend
```

**Problem**: Database connection fails

```bash
# Check database is running
docker-compose ps database

# Check database logs
docker-compose logs database

# Recreate database
docker-compose down -v
docker-compose up -d database
```

**Problem**: Image build fails

```bash
# Check Docker is running
docker info

# Check disk space
docker system df

# Clean up unused images
docker system prune -a
```

### Railway Deployment Issues

**Problem**: Build fails on Railway

**Solution**:
- Check Railway build logs
- Verify Dockerfile path is correct
- Ensure all dependencies in package.json
- Check .dockerignore isn't excluding needed files

**Problem**: Service crashes after deploy

**Solution**:
- Check Railway logs
- Verify all environment variables are set
- Check DATABASE_URL is correct
- Verify health check endpoint works

**Problem**: Database connection fails on Railway

**Solution**:
- Ensure PostgreSQL service is running
- Check DATABASE_URL is set correctly
- Verify both services are in same project
- Check service is using correct DATABASE_URL variable

---

## 📊 PERFORMANCE TIPS

### Build Optimization

1. **Layer Caching**
   - Put `COPY package*.json` before `COPY . .`
   - Dependencies cached separately from code
   - Rebuilds are faster (seconds vs minutes)

2. **Multi-Stage Builds**
   - Final image only contains runtime files
   - Development dependencies excluded
   - Smaller image = faster deploy

3. **.dockerignore**
   - Excludes unnecessary files
   - Faster context upload
   - Smaller images

### Runtime Optimization

1. **Health Checks**
   - Railway uses them for routing
   - Prevents traffic to unhealthy services
   - Auto-restarts on failure

2. **Non-Root User**
   - Security best practice
   - Required by Railway
   - Included in all Dockerfiles

3. **Resource Limits** (Railway)
   - Set in Railway dashboard
   - Prevents OOM kills
   - Adjust based on usage

---

## 🔐 SECURITY CHECKLIST

- [ ] ✅ All services run as non-root user
- [ ] ✅ No secrets in Dockerfile or docker-compose
- [ ] ✅ Environment variables used for all sensitive data
- [ ] ✅ .dockerignore excludes .env files
- [ ] ✅ .dockerignore excludes sensitive files
- [ ] ✅ Health checks configured
- [ ] ✅ PostgreSQL password is strong (Railway generates)
- [ ] ✅ SESSION_SECRET is random and long
- [ ] ✅ CORS_ORIGINS set to your domain only

---

## 🎯 QUICK REFERENCE

### Local Development Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Database reset
docker-compose down -v
docker-compose up -d
docker-compose exec backend npx prisma db push
```

### Railway Deployment Commands

```bash
# Install CLI
npm install -g @railway/cli

# Deploy
railway login
railway link
railway up

# Logs
railway logs

# Database migration
railway run npx prisma db push
```

### Docker Commands

```bash
# List containers
docker ps

# List images
docker images

# Remove unused
docker system prune -a

# Build image
docker build -t crm-backend -f backend/Dockerfile .

# Run image
docker run -p 3001:3001 crm-backend
```

---

## 🎉 SUCCESS CRITERIA

### Local Development

- [ ] ✅ `docker-compose up -d` starts all services
- [ ] ✅ Frontend accessible at http://localhost:3000
- [ ] ✅ Backend API at http://localhost:3001/api/health returns 200
- [ ] ✅ AI Tools at http://localhost:8000/health returns 200
- [ ] ✅ PostgreSQL accepting connections
- [ ] ✅ No errors in `docker-compose logs`

### Railway Deployment

- [ ] ✅ Build succeeds without errors
- [ ] ✅ All services show "Active" (green)
- [ ] ✅ Health checks passing
- [ ] ✅ Backend API accessible via Railway URL
- [ ] ✅ Database connected
- [ ] ✅ No errors in Railway logs

---

## 📚 ADDITIONAL RESOURCES

**Docker**:
- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/

**Railway**:
- Railway Docs: https://docs.railway.app/
- Docker on Railway: https://docs.railway.app/deploy/dockerfiles
- Railway CLI: https://docs.railway.app/develop/cli

**Project**:
- Master Plan: `docs/RAILWAY_DEPLOYMENT_MASTER_PLAN.md`
- Next Session Guide: `docs/NEXT_SESSION_GUIDE.md`
- Session Summary: `docs/SESSION_1_SUMMARY.md`

---

## 💬 SUPPORT

**Issues**:
- Check logs first: `docker-compose logs -f`
- Check troubleshooting section above
- Verify environment variables are set
- Ensure Docker Desktop is running

**Questions**:
- Read this guide completely
- Check Railway documentation
- Review Docker logs
- Verify all prerequisites met

---

**Version**: 1.0
**Created**: 2025-11-06
**Branch**: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`
**Status**: Production Ready 🎉
