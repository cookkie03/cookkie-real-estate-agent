# 🚀 CRM Immobiliare - Quick Reference Guide

## What to Know First

### Repository Status
- **Type**: Modular real estate CRM with AI
- **Version**: 3.0.0
- **Architecture**: 7 independent modules
- **Overall Readiness**: 70% (infrastructure ready, implementations in progress)

### Critical Issue
⚠️ **`database/prisma/schema.prisma` file DOES NOT EXIST**
- This blocks Next.js builds and Prisma operations
- Must be created first (convert from SQLAlchemy models)

---

## Quick Module Lookup

| Module | Port | Status | Key Files |
|--------|------|--------|-----------|
| **Frontend** | 3000 | ✅ Ready | `frontend/src/app/` |
| **Backend API** | 3001 | ✅ Ready | `backend/src/app/api/` |
| **AI Tools** | 8000 | 70% | `ai_tools/app/agents/` |
| **Scraping** | CLI | 40% | `scraping/portals/base_scraper.py` |
| **Database** | - | 80% | `database/python/models.py` |
| **Docker** | - | ✅ Ready | `docker/docker-compose.yml` |

---

## Most Important Files

### Absolutely Critical
1. **`CLAUDE.md`** - Read this first! All development guidelines
2. **`database/python/models.py`** - Complete SQLAlchemy schema (417 lines)
3. **`ai_tools/requirements.txt`** - All Python dependencies

### Infrastructure
4. **`docker/docker-compose.yml`** - Docker orchestration (works!)
5. **`config/*.env.example`** - All configuration templates
6. **`ai_tools/main.py`** - FastAPI entry point

### Missing/Incomplete
7. **`database/prisma/schema.prisma`** - ❌ MISSING (create this!)
8. **`scraping/portals/immobiliare_it.py`** - ❌ NOT IMPLEMENTED
9. **`railway.json`** - ❌ MISSING (for Railway.com deployment)

---

## Quick Facts

### What Already Works
✅ Docker Compose setup (local dev fully functional)  
✅ Frontend framework (Next.js 14 + shadcn/ui)  
✅ Backend API routes (Next.js 14)  
✅ AI Tools infrastructure (FastAPI + DataPizza)  
✅ Database models (SQLAlchemy, all 10 models defined)  
✅ Configuration management (centralized .env templates)  
✅ Logging & tracing (OpenTelemetry)  
✅ Documentation (excellent CLAUDE.md)  

### What's Missing
❌ Prisma schema file (blocking TypeScript/Next.js)  
❌ Portal scraper implementations (3 expected)  
❌ Scraping database integration  
❌ Railway.com deployment config  
❌ Portal scheduler/CLI  
❌ Some AI tools (7 mentioned, 3-4 implemented)  

### What's Partial
⚠️ Frontend pages (routes exist, may be stubs)  
⚠️ AI agents (framework ready, implementation ~70%)  
⚠️ Testing (infrastructure exists, limited tests)  

---

## Technology Stack

**Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui  
**Backend**: Next.js 14 API Routes + TypeScript + Zod  
**AI Backend**: FastAPI + Python 3.11+ + DataPizza AI + Google Gemini  
**Scraping**: Python 3.11+ + BeautifulSoup4 + httpx  
**Database**: SQLite (dev) + SQLAlchemy (Python) + Prisma (TypeScript, schema missing)  
**Deployment**: Docker Compose (local) + Railway.com (planned)  

---

## File Paths to Remember

```
/home/user/cookkie-real-estate-agent/

Frontend:           frontend/src/app/
Backend:            backend/src/app/api/
AI Tools:           ai_tools/app/agents/
Database Models:    database/python/models.py
Docker:             docker/docker-compose.yml
Config:             config/backend.env.example
Documentation:      docs/ARCHITECTURE.md
This Analysis:      docs/analysis/COMPREHENSIVE_EXPLORATION.md
```

---

## Getting Started Commands

### View Documentation
```bash
cat /home/user/cookkie-real-estate-agent/CLAUDE.md
cat /home/user/cookkie-real-estate-agent/docs/ARCHITECTURE.md
cat /home/user/cookkie-real-estate-agent/docs/analysis/COMPREHENSIVE_EXPLORATION.md
```

### Setup Development Environment
```bash
cd /home/user/cookkie-real-estate-agent

# Setup environment files
cp config/backend.env.example backend/.env
cp config/frontend.env.example frontend/.env.local
cp config/ai_tools.env.example ai_tools/.env

# Install dependencies
npm run install:all

# Start services (requires Prisma schema first!)
npm run dev:all
```

### Start AI Tools Only
```bash
cd ai_tools
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python main.py
```

### Docker
```bash
docker-compose -f docker/docker-compose.yml up
```

---

## Priority Action Items

### IMMEDIATE (Day 1)
1. Create `database/prisma/schema.prisma` from SQLAlchemy models
2. Generate Prisma Client: `npm run prisma:generate`
3. Test Next.js build

### SHORT TERM (This Week)
1. Implement Immobiliare.it scraper
2. Implement database integration for scraping
3. Complete missing AI tools

### MEDIUM TERM (This Month)
1. Setup Railway.com deployment config
2. Migrate database to PostgreSQL
3. Complete test suite

### LONG TERM (Production)
1. Enhanced error handling
2. Performance optimization
3. Security hardening

---

## Key Architecture Concepts

### Module Boundaries
Each module communicates via defined APIs:
- **Frontend** ↔ **Backend** via REST API (port 3001)
- **Backend** ↔ **AI Tools** via REST API (port 8000)
- **Both** ↔ **Database** (SQLite shared file)

### Database Access
- **TypeScript/Node.js**: Uses Prisma ORM (schema missing)
- **Python**: Uses SQLAlchemy ORM (complete)
- **Both point to**: `database/prisma/dev.db`

### Configuration
- **All templates** in `config/*.env.example`
- **Each module** has its own `.env` file
- **Centralized settings** via Pydantic BaseSettings

---

## Development Guidelines

Read **CLAUDE.md** carefully! It includes:
- Surgical, modular code changes required
- Module boundary protection
- Protected files (don't modify without reason)
- Security rules (never commit secrets)
- Report organization rules (use `/docs` directory)

---

## Common Issues & Fixes

### "Next.js build fails"
→ Missing `database/prisma/schema.prisma`  
→ Run `npx prisma init` and create schema from models

### "Prisma Client not found"
→ Run `npm run prisma:generate`

### "Port 3000 already in use"
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Database locked"
→ Close Prisma Studio and other connections
→ For production: Use PostgreSQL instead of SQLite

### "AI tools won't connect"
→ Ensure `GOOGLE_API_KEY` is set in `ai_tools/.env`
→ Check `PYTHON_AI_URL` in `backend/.env`

---

## Resources

- **CLAUDE.md**: `/home/user/cookkie-real-estate-agent/CLAUDE.md`
- **Architecture**: `/home/user/cookkie-real-estate-agent/docs/ARCHITECTURE.md`
- **Database Guide**: `/home/user/cookkie-real-estate-agent/database/README.md`
- **AI Tools README**: `/home/user/cookkie-real-estate-agent/ai_tools/README.md`
- **Scraping README**: `/home/user/cookkie-real-estate-agent/scraping/README.md`
- **Docker Guide**: `/home/user/cookkie-real-estate-agent/docker/README_DOCKER.md`
- **Full Analysis**: `/home/user/cookkie-real-estate-agent/docs/analysis/COMPREHENSIVE_EXPLORATION.md`

---

## TL;DR Summary

✅ **What Works**: Docker, frontend framework, backend framework, AI infrastructure, database models  
❌ **What's Broken**: No Prisma schema file (critical!)  
⚠️ **What's Missing**: Portal scrapers, Railway.com config, some AI tools  
🚀 **Next Step**: Create `database/prisma/schema.prisma` file

**Current Readiness**: 70% (infrastructure ready, implementations in progress)

---

**Generated**: November 5, 2025  
**Location**: `/home/user/cookkie-real-estate-agent/docs/analysis/QUICK_REFERENCE.md`
