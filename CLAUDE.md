# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Last Updated**: 2025-11-06
**Version**: 3.1.0 (PostgreSQL Migration Complete)

---

## Project Overview

CRM Immobiliare is a comprehensive, single-user real estate management system for Italian real estate agents. The application provides complete property and client lifecycle management with AI-powered features including intelligent matching, RAG-based assistant, web scraping, interactive maps, and daily briefings.

**Tech Stack**: Next.js 14 (App Router) + TypeScript + Python (FastAPI) + Prisma + PostgreSQL

**Current Phase**: Production-Ready - Complete modular architecture with 7 independent modules

**Interface Language**: Italian

**Architecture**: Modular monorepo with clear separation of concerns

---

## ⚡ AI INTERVENTION MANDATE: SURGICAL & MODULAR

**YOUR PRIMARY DIRECTIVE: You must act with surgical precision and leverage the project's modularity.** This is a non-negotiable rule to maximize efficiency and minimize side effects.

### 1. IDENTIFY THE TARGET MODULE

Before writing any code, precisely identify the target module and file(s):
- **Frontend**: `frontend/src/app/`, `frontend/src/components/`
- **Backend**: `backend/src/app/api/`
- **AI Tools**: `ai_tools/app/agents/`, `ai_tools/app/tools/`
- **Database**: `database/prisma/schema.prisma`, `database/python/models.py`
- **Scraping**: `scraping/portals/`

### 2. ISOLATE THE CHANGE

Your changes **must** be confined *only* to the identified target. Do not refactor, format, or alter any code outside the direct scope of the request.

### 3. RESPECT MODULE BOUNDARIES

All interactions between modules must go through established APIs:
- **Frontend ↔ Backend**: REST API (`/api/*`)
- **Backend ↔ AI Tools**: HTTP requests to FastAPI (port 8000)
- **Backend ↔ Database**: Prisma Client
- **AI Tools ↔ Database**: SQLAlchemy
- **Scraping → Database**: SQLAlchemy

4.  **PROTECT CRITICAL INFRASTRUCTURE**: Core foundational files are considered **off-limits** for modification unless the task is *specifically* about changing them. Your primary responsibility is to preserve the stability of the application. Accidental modifications to these files are a critical failure. Protected files include, but are not limited to:
    -   **Database Schema (`prisma/schema.prisma`)**
    -   **Global Configuration (`next.config.js`, `tsconfig.json`, `tailwind.config.ts`)**
    -   **Root Application Files (`src/app/layout.tsx`, `src/app/providers.tsx`)**
    -   **Package Definitions (`package.json`)**

5.  **MAINTAIN ROOT FILES**: The instruction files `CLAUDE.md` and `GEMINI.md` **must** always remain in the project root directory. Do not move, rename, or delete them.

---

## 🏗️ MODULAR ARCHITECTURE

### Repository Structure (v3.0.0)

```
crm-immobiliare/
├── frontend/              # Next.js 14 UI (port 3000)
│   ├── src/app/           # Pages & routes (18 routes)
│   ├── src/components/    # React components
│   ├── src/hooks/         # Custom hooks
│   └── src/lib/           # Utilities
│
├── backend/               # Next.js 14 API (port 3001)
│   ├── src/app/api/       # API routes (9 endpoints)
│   └── src/lib/           # DB & utilities
│
├── ai_tools/              # Python AI (port 8000)
│   ├── app/agents/        # AI agents (3)
│   ├── app/tools/         # Custom tools (7)
│   └── app/routers/       # FastAPI routes
│
├── database/              # Database centralizzato
│   ├── prisma/            # Prisma schema + migrations
│   └── python/            # SQLAlchemy models
│
├── scraping/              # Web scraping
│   ├── portals/           # Portal scrapers (3)
│   └── common/            # Shared utilities
│
├── config/                # Configurazioni centralizzate
├── scripts/               # Automation (22 scripts)
├── tests/                 # Test suite (unit, integration, e2e)
├── logs/                  # Centralized logging
└── docs/                  # Documentation
```

### Module Independence

Each module can be developed, tested, and deployed independently:
- **Frontend**: `cd frontend && npm run dev`
- **Backend**: `cd backend && npm run dev`
- **AI Tools**: `cd ai_tools && python main.py`
- **Database**: Self-contained with Prisma + SQLAlchemy

---

## 🔒 CRITICAL SECURITY RULES

**MANDATORY - ALWAYS ENFORCE THESE RULES**:

### 1. Never Commit Sensitive Data
- ❌ **NEVER** commit `.env`, `.env.local`, `.env.production`
- ❌ **NEVER** commit database files (`*.db`, `*.db-journal`)
- ❌ **NEVER** hardcode API keys, passwords, or secrets
- ❌ **NEVER** commit populated databases with real data
- ✅ **ALWAYS** use `.env.example` templates in `/config`
- ✅ **ALWAYS** verify `git status` before commits

### 2. Data Privacy
- 🔒 **Seed data MUST be fictional** (names, emails, phones)
- 🔒 Use placeholders: `user@example.com`, `+39 XXX XXX XXXX`
- 🔒 No real addresses, personal information, or client data
- 🔒 Images must be public URLs (Unsplash, placeholder services)

### 3. Git Exclusions (via .gitignore)
**These MUST ALWAYS be git-ignored**:
- Environment: `.env*`, `.env.local`, `.env.production`
- Database: `*.sql`, `*.sql.gz`, `*.dump`, `*.pgdump`, `backups/` (PostgreSQL dumps)
- Cache: `.cache/`, `__pycache__/`, `.venv/`
- Build: `.next/`, `node_modules/`, `build/`, `dist/`
- Logs: `logs/`, `*.log`
- OS: `.DS_Store`, `Thumbs.db`, `Desktop.ini`
- Backup: `backup-*`, `.backup_*/`

### 4. Cache Management
- AI tools cache → `ai_tools/.cache/` (git-ignored)
- Scraping cache → `scraping/.cache/` (git-ignored)
- Never store sensitive data in cache

### 5. Component Organization (Frontend)
**MANDATORY structure**:
- `frontend/src/components/ui/` → shadcn/ui only (DO NOT EDIT MANUALLY)
- `frontend/src/components/features/` → Feature components
- `frontend/src/components/layouts/` → Layout components

### 6. Report e File Temporanei

**MANDATORY - Gestione Report e File di Lavoro**:

Quando generi report, analisi, o file di documentazione temporanei:

❌ **MAI nella root del progetto**
✅ **SEMPRE categorizzati in `/docs` nelle subdirectory appropriate**

**Categorizzazione Report**:

1. **Report di Riorganizzazione/Refactoring**:
   - Directory: `docs/reorganization/`
   - Esempio: `PHASE_X_COMPLETE.md`, `REFACTOR_REPORT.md`
   - **Archivia se non più necessario**: Sposta in `docs/reorganization/archive/`

2. **Report di Analisi/Debug**:
   - Directory: `docs/analysis/`
   - Esempio: `PERFORMANCE_ANALYSIS.md`, `BUG_REPORT.md`
   - **Archivia dopo risoluzione**: `docs/analysis/archive/`

3. **Guide Setup/Migration**:
   - Directory: `docs/setup/`
   - Esempio: `MIGRATION_GUIDE.md`, `SETUP_NOTES.md`
   - **Mantieni se ancora rilevanti**, archivia versioni obsolete

4. **Report AI Integration**:
   - Directory: `docs/ai-integration/`
   - Esempio: `AI_INTEGRATION_SUMMARY.md`
   - **Archivia versioni superate**

5. **Report Temporanei** (specifici di task/feature):
   - Directory: `docs/temp/` (git-ignored)
   - **Elimina dopo completamento task**
   - Oppure sposta in archive se potrebbe servire

**Esempio Workflow**:

```bash
# ❌ WRONG - Report nella root
CRITICITA_REPORT.md              # NO!
ANALYSIS_DATABASE.md             # NO!

# ✅ CORRECT - Report categorizzati
docs/analysis/CRITICITA_REPORT.md
docs/analysis/DATABASE_ANALYSIS.md

# ✅ CORRECT - Archiviati dopo uso
docs/analysis/archive/CRITICITA_REPORT_20251017.md
```

**Regola d'Oro**:
- Se il report è **permanente** (es: ARCHITECTURE.md) → `docs/` directory principale
- Se il report è **temporaneo/specifico** → `docs/[categoria]/`
- Se il report è **obsoleto** → `docs/[categoria]/archive/`
- **Mai** lasciare report nella root oltre il tempo strettamente necessario

### 7. Pre-Commit Checklist

Before EVERY commit:
- [ ] Run `git status` - no `.env*` files
- [ ] No database dumps tracked (`*.sql`, `*.sql.gz`, `*.dump`)
- [ ] No hardcoded secrets (`grep -r "API_KEY" .`)
- [ ] Seed data is fictional only
- [ ] Build succeeds: `npm run build`
- [ ] **No report files in root** - all in `docs/[category]/`

---

## 🚀 Development Commands

### Root Level (Orchestration)

```bash
# Install all dependencies
npm run install:all

# Development
npm run dev              # Start frontend
npm run dev:all          # Start all services (frontend + backend)
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Build
npm run build            # Build all modules
npm run build:backend    # Backend only
npm run build:frontend   # Frontend only

# Docker
npm run docker:up        # Start all containers
npm run docker:down      # Stop all containers
npm run docker:logs      # View logs

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to DB
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database
npm run prisma:migrate   # Run migrations

# AI & Scraping
npm run ai:start         # Start AI tools
npm run scraping:start   # Start scraping

# Testing
npm test                 # Run all tests
npm run test:backend     # Backend tests
npm run test:frontend    # Frontend tests

# Cleanup
npm run clean            # Remove node_modules and builds
```

### Module Level

```bash
# Frontend
cd frontend
npm install
npm run dev              # Port 3000
npm run build
npm test

# Backend
cd backend
npm install
npm run dev              # Port 3001
npm run build
npm test

# AI Tools (Python)
cd ai_tools
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
python main.py             # Port 8000

# Database
cd database/prisma
npx prisma generate
npx prisma db push
npx tsx seed.ts
```

---

## 💾 Database Architecture

### Unified Database Access

**Single Source of Truth**: `database/prisma/schema.prisma` (PostgreSQL)

**Multi-Language Access**:
- **TypeScript** (Frontend/Backend): Prisma Client
- **Python** (AI Tools/Scraping): SQLAlchemy (mirror models)

**Database**: PostgreSQL 16 (Docker: `postgres:16-alpine`)

**Connection String Format**:
```bash
DATABASE_URL="postgresql://crm_user:password@localhost:5432/crm_immobiliare"
```

### Database Models (9 core models + User Authentication)

1. **User** - Authentication (email/password) - NEW
2. **UserProfile** - Agent profile (single-user)
3. **Contact** - Unified contacts (clients, owners, leads)
4. **Building** - Building census
5. **Property** - Complete properties
6. **Request** - Client search requests
7. **Match** - AI-powered property-request matching
8. **Activity** - CRM timeline
9. **Tag** - Universal tagging system (optional)
10. **AuditLog** - Change tracking (optional)

### Database Commands

```bash
# From root
npm run prisma:generate  # Regenerate client after schema changes
npm run prisma:push      # Push schema to PostgreSQL
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed with fictional data

# From database directory
cd database
npm run generate         # Generate Prisma Client
npm run push            # Push schema
npm run studio          # Open GUI
npm run seed            # Run seed script

# From database/prisma directory
cd database/prisma
npx prisma generate
npx prisma db push
npx tsx seed.ts
```

### PostgreSQL Setup (Docker)

**Start PostgreSQL**:
```bash
cd docker
docker-compose up -d postgres
```

**Connect to PostgreSQL**:
```bash
docker exec -it crm-postgres psql -U crm_user -d crm_immobiliare
```

**Backup Database**:
```bash
docker exec crm-postgres pg_dump -U crm_user crm_immobiliare > backup.sql
```

**Restore Database**:
```bash
cat backup.sql | docker exec -i crm-postgres psql -U crm_user -d crm_immobiliare
```

### Accessing Database

**TypeScript (Frontend/Backend)**:
```typescript
import { prisma } from '@/lib/db';

const properties = await prisma.property.findMany({
  where: { status: 'available' },
  include: { owner: true }
});
```

**Python (AI Tools/Scraping)**:
```python
from database.python import Property, get_db_context

with get_db_context() as db:
    properties = db.query(Property).filter(
        Property.status == "available"
    ).all()
```

**Documentation**: See [database/README.md](database/README.md) (932 lines)

---

## 🎨 Frontend Architecture

**Location**: `frontend/`
**Framework**: Next.js 14 (App Router)
**Port**: 3000

### Structure

```
frontend/
├── src/
│   ├── app/                    # Pages & routes (18 routes)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage (dashboard)
│   │   ├── providers.tsx       # React Query + UI providers
│   │   ├── immobili/           # Properties pages
│   │   ├── clienti/            # Clients pages
│   │   ├── search/             # Search page
│   │   ├── agenda/             # Calendar
│   │   ├── actions/            # Suggested actions
│   │   ├── map/                # Interactive map
│   │   ├── settings/           # Settings
│   │   └── tool/               # Tool dashboard
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui (DO NOT EDIT)
│   │   ├── features/           # Feature components
│   │   └── layouts/            # Layouts
│   │
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Utilities
│
├── public/                     # Static assets
├── next.config.js
├── tailwind.config.ts
└── package.json
```

### Key Patterns

**Server Components** (default):
```typescript
// No "use client" directive
export default async function Page() {
  const data = await prisma.property.findMany();
  return <div>{/* render */}</div>;
}
```

**Client Components** (for hooks/events):
```typescript
"use client";
import { useState } from "react";

export default function Page() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Data Fetching with React Query**:
```typescript
"use client";
import { useQuery } from '@tanstack/react-query';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => fetch('/api/properties').then(r => r.json())
  });
}
```

### Adding shadcn/ui Component

```bash
cd frontend
npx shadcn@latest add <component-name>
```

Component will be added to `src/components/ui/` automatically.

**Documentation**: See [frontend/README.md](frontend/README.md)

---

## 🔌 Backend Architecture

**Location**: `backend/`
**Framework**: Next.js 14 (API Routes)
**Port**: 3001

### Structure

```
backend/
├── src/
│   ├── app/
│   │   └── api/               # API Routes (9 endpoints)
│   │       ├── health/        # Health check
│   │       ├── ai/
│   │       │   ├── briefing/  # Daily briefing
│   │       │   ├── chat/      # RAG chat
│   │       │   └── matching/  # AI matching
│   │       └── chat/          # Legacy chat
│   │
│   └── lib/                   # DB & utilities
│       ├── db/                # Prisma client
│       └── utils/
│
├── next.config.js
└── package.json
```

### Creating API Endpoint

```typescript
// backend/src/app/api/properties/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const properties = await prisma.property.findMany({
    where: { status: 'available' }
  });
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Validate with Zod
  const property = await prisma.property.create({ data: body });
  return NextResponse.json(property, { status: 201 });
}
```

**Documentation**: See [backend/README.md](backend/README.md)

---

## 🤖 AI Tools Architecture

**Location**: `ai_tools/`
**Framework**: FastAPI (Python 3.13)
**Port**: 8000

### Structure

```
ai_tools/
├── app/
│   ├── agents/                # 3 AI Agents
│   │   ├── briefing_agent.py  # Daily briefing
│   │   ├── matching_agent.py  # Property matching
│   │   └── rag_agent.py       # RAG chat assistant
│   │
│   ├── tools/                 # 7 Custom Tools
│   │   ├── database_tool.py
│   │   ├── property_tool.py
│   │   ├── contact_tool.py
│   │   ├── match_tool.py
│   │   ├── request_tool.py
│   │   ├── activity_tool.py
│   │   └── briefing_tool.py
│   │
│   └── routers/               # FastAPI routes
│
├── main.py                    # FastAPI app
├── requirements.txt
└── README.md
```

### Running AI Tools

```bash
cd ai_tools
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

**API Docs**: http://localhost:8000/docs (auto-generated by FastAPI)

**Documentation**: See [ai_tools/README.md](ai_tools/README.md)

---

## 🌐 Scraping Architecture

**Location**: `scraping/`
**Language**: Python 3.13

### Structure

```
scraping/
├── portals/                   # Portal scrapers
│   ├── immobiliare_it/        # Immobiliare.it
│   ├── casa_it/               # Casa.it
│   └── idealista/             # Idealista.it
│
├── common/                    # Shared utilities
├── cli.py                     # CLI interface
└── README.md
```

### Running Scraping

```bash
cd scraping
python cli.py scrape --portal immobiliare_it --city Milano
```

**Documentation**: See [scraping/README.md](scraping/README.md)

---

## ⚙️ Configuration Management

**Location**: `config/`

All configurations are centralized in `/config`:

```
config/
├── .env.example               # Global template
├── backend.env.example        # Backend template
├── frontend.env.example       # Frontend template
├── ai_tools.env.example       # AI tools template
├── database.env.example       # Database template
├── docker-compose.yml         # Docker orchestration
└── README.md
```

### Environment Variables

Each module uses environment variables to connect to PostgreSQL:

**Root** (`.env` for local development):
```bash
DATABASE_URL="postgresql://crm_user:password@localhost:5432/crm_immobiliare"
NEXTAUTH_SECRET="your-super-secure-secret-here"
NEXTAUTH_URL="http://localhost:3001"
GOOGLE_API_KEY="your-google-api-key"
```

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend** (`.env`):
```bash
DATABASE_URL="postgresql://crm_user:password@localhost:5432/crm_immobiliare"
NEXTAUTH_SECRET="your-super-secure-secret-here"
NEXTAUTH_URL="http://localhost:3001"
GOOGLE_API_KEY="your-google-api-key"
```

**AI Tools** (`.env`):
```bash
DATABASE_URL="postgresql://crm_user:password@localhost:5432/crm_immobiliare"
GOOGLE_API_KEY="your-google-api-key"
```

**Docker** (`docker/.env`):
```bash
# Database
DB_NAME=crm_immobiliare
DB_USER=crm_user
DB_PASSWORD=your_secure_password
DB_PORT=5432

# Auth
NEXTAUTH_SECRET=your-super-secure-secret-here
NEXTAUTH_URL=http://localhost:3001

# API Keys
GOOGLE_API_KEY=your-google-api-key

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=3001
AI_TOOLS_PORT=8000
```

**Setup**:
```bash
# Copy root .env for local development
cp .env.example .env

# Or copy module-specific .env files (if they exist)
# cp config/backend.env.example backend/.env
# cp config/frontend.env.example frontend/.env.local
# cp config/ai_tools.env.example ai_tools/.env

# For Docker deployment
cp docker/.env.example docker/.env

# Then edit and update all values (especially DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_API_KEY)
```

**Documentation**: See [config/README.md](config/README.md)

---

## 🧪 Testing Architecture

**Location**: `tests/`

### Structure

```
tests/
├── unit/                      # Unit tests
│   ├── backend/               # Backend tests (Jest)
│   ├── frontend/              # Frontend tests (Jest + RTL)
│   ├── ai_tools/              # AI tests (pytest)
│   └── scraping/              # Scraping tests (pytest)
│
├── integration/               # Integration tests
│   ├── api/                   # API integration
│   └── database/              # DB integration
│
├── e2e/                       # End-to-end tests
│   └── scenarios/             # User scenarios
│
├── conftest.py                # pytest config
└── jest.config.js             # Jest config
```

### Running Tests

```bash
# All tests
npm test

# Module-specific
npm run test:backend
npm run test:frontend

# Python tests
cd ai_tools && pytest
cd scraping && pytest
```

**Documentation**: See [tests/README.md](tests/README.md)

---

## 📊 Logging & Monitoring

**Location**: `logs/` (git-ignored)

### Structure

```
logs/
├── backend/
│   ├── app.log                # Application logs
│   ├── error.log              # Error logs
│   └── access.log             # Access logs
│
├── frontend/
│   └── build.log              # Build logs
│
├── ai_tools/
│   ├── agents.log             # Agent execution
│   └── tools.log              # Tool execution
│
└── scraping/
    └── scraper.log            # Scraping logs
```

### Log Format (JSON structured)

```json
{
  "timestamp": "2025-10-17T12:00:00Z",
  "level": "INFO",
  "module": "[Backend]",
  "message": "Property created",
  "data": { "propertyId": "prop_123" }
}
```

**Log Viewer**: Available at `/tool` in frontend

---

## 🐳 Docker Architecture

### Docker Compose

**Location**: `config/docker-compose.yml`

```bash
# Start all services
docker-compose -f config/docker-compose.yml up -d

# View logs
docker-compose -f config/docker-compose.yml logs -f

# Stop all
docker-compose -f config/docker-compose.yml down
```

### Individual Dockerfiles

- `frontend/Dockerfile`
- `backend/Dockerfile`
- `ai_tools/Dockerfile`

---

## 📚 Documentation

### Main Guides

- **[README.md](README.md)** - Project overview
- **[CHANGELOG.md](CHANGELOG.md)** - Version history (v1.0.0 → v3.0.0)
- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Quick start guide
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture

### Module Documentation

### 4. Modular Documentation (README.md)
Every top-level module (`/python_ai`, `/scraping`, etc.) must contain its own `README.md` file. This file must provide:
- A clear description of the module's purpose and responsibilities.
- The specific language, framework, and key dependencies.
- Standalone setup and execution instructions, including environment variables.
- Instructions for running tests specific to that module.

**General Documentation Rule**: All general project documentation and reports must be stored within the `/docs` directory. Before creating a new file, always check if an existing document can be updated. This keeps the documentation centralized and organized.

- [frontend/README.md](frontend/README.md) - Frontend guide
- [backend/README.md](backend/README.md) - Backend API guide
- [ai_tools/README.md](ai_tools/README.md) - AI tools guide (6129 chars)
- [database/README.md](database/README.md) - Database guide (932 lines)
- [scraping/README.md](scraping/README.md) - Scraping guide
- [config/README.md](config/README.md) - Configuration guide
- [tests/README.md](tests/README.md) - Testing guide

### Reorganization Reports

- [docs/reorganization/](docs/reorganization/) - All 9 phase reports
- [docs/reorganization/REORGANIZATION_FINAL_REPORT.md](docs/reorganization/REORGANIZATION_FINAL_REPORT.md) - Complete report

---

## 🎯 Development Workflow

### 1. Starting Development

```bash
# First time setup
npm run install:all
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Start development
npm run dev:all  # Frontend + Backend
```

### 2. Making Changes

1. Identify target module
2. Create feature branch: `git checkout -b feature/name`
3. Make changes in isolated module
4. Test locally: `npm test`
5. Build: `npm run build`
6. Commit: `git commit -m "feat: description"`

### 3. Adding New Feature

**Example**: Add property search filter

1. **Frontend**: Create UI component in `frontend/src/components/features/immobili/SearchFilter.tsx`
2. **Backend**: Add API endpoint in `backend/src/app/api/properties/search/route.ts`
3. **Database**: Ensure indexes exist in `database/prisma/schema.prisma`
4. **Test**: Add tests in `tests/integration/api/properties.test.ts`
5. **Document**: Update [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## ⚠️ Common Pitfalls

### 1. Path Aliases

**Frontend**: `@/` → `frontend/src/`
```typescript
import { Button } from '@/components/ui/button';
```

**Backend**: `@/` → `backend/src/`
```typescript
import { prisma } from '@/lib/db';
```

### 2. Module Boundaries

❌ **WRONG**: Direct import across modules
```typescript
// In frontend
import { prisma } from '../../backend/src/lib/db'; // ❌ BAD
```

✅ **CORRECT**: Use API
```typescript
// In frontend
const properties = await fetch('http://localhost:3001/api/properties');
```

### 3. Database Access

❌ **WRONG**: Multiple database paths
```typescript
DATABASE_URL="file:./dev.db"  // ❌ Wrong path
```

✅ **CORRECT**: Centralized path
```typescript
DATABASE_URL="file:../database/prisma/dev.db"  // ✅ Correct
```

---

## 🚀 Project Status

**Version**: 3.0.0 (Reorganization Complete)

✅ **Completed**:
- 9-phase repository reorganization
- Modular architecture (7 modules)
- Complete documentation
- Docker support
- Testing infrastructure
- CI/CD pipeline
- Centralized logging

🔄 **In Progress**:
- Authentication system
- Advanced AI features
- Enhanced scraping

📋 **Planned**:
- Mobile app (React Native)
- Multi-tenant support
- Production deployment

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: Create GitHub issue
- **Architecture Questions**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Setup Problems**: See [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)

---

**Remember**: This is a modular, production-ready system. Always work within module boundaries, use established APIs, and maintain the separation of concerns. When in doubt, consult module-specific README files.

**Made with ❤️ by Luca M. & Claude Code**
