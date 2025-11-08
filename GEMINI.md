# GEMINI.md

This file provides guidance to Gemini Code Assist when working with code in this repository.

**Last Updated**: 2025-11-08
**Version**: 3.1.1 (Documentation Streamline)

---

## 🎯 Project Philosophy: ESSENTIALITY, SIMPLICITY, INTUITIVITY

CRM Immobiliare is designed around three core principles that **MUST** guide every development decision:

### 1. **ESSENTIALITY** (Essenzialità)
- **One command to start everything**: `npm run dev` → app + AI tools running
- **One .env file**: All configuration in a single root `.env.example`
- **Zero manual setup**: Auto-generated secrets, automatic database creation
- **Minimal dependencies**: Only what's truly necessary
- **No redundancy**: Each feature exists in ONE place only

### 2. **SIMPLICITY** (Semplicità)
- **For beginners**: A novice must be able to start the app in < 5 minutes
- **Self-explanatory**: Code and UI should explain themselves
- **Conventional over complex**: Use standard patterns, avoid clever tricks
- **Progressive disclosure**: Simple by default, advanced when needed
- **Clear error messages**: Every error tells you exactly what to do

### 3. **INTUITIVITY** (Intuitività)
- **Wizard-driven setup**: GUI configuration wizard at first launch
- **Discoverable features**: Users find features naturally through UI
- **Contextual help**: Help where you need it, when you need it
- **Visual feedback**: Loading states, success/error messages, progress bars
- **Smart defaults**: Works great out-of-the-box, customizable if needed

### 🚫 Anti-Patterns to AVOID

- ❌ **Multiple config files scattered** → Use ONE .env in root
- ❌ **Manual secret generation** → Auto-generate everything
- ❌ **Complex installation steps** → Two commands max
- ❌ **Separate backend/frontend commands** → One unified command
- ❌ **Unexplained failures** → Every error has a solution
- ❌ **Hidden features** → Make everything discoverable
- ❌ **Configuration via code** → Configuration via GUI wizard

---

## 📋 Project Overview

**CRM Immobiliare** is a comprehensive, single-user real estate management system for Italian real estate agents. Built with modern tools and AI-powered features.

**Tech Stack**:
- Frontend + API: Next.js 14 (App Router, unified)
- AI: Python 3.13 (FastAPI + Google Gemini)
- Database: SQLite (dev) / PostgreSQL (prod)
- ORM: Prisma (TS) + SQLAlchemy (Python)

**Current Phase**: Production-Ready v3.1.0

**Interface Language**: Italian (UI), English (code/docs)

**Architecture**: 2 main components + database
- App (UI + API): `frontend/` → Port 3000
- AI Tools: `ai_tools/` → Port 8000
- Database: `database/prisma/` → SQLite (dev) or PostgreSQL (Docker)

**Deployment**: Docker Compose (4 containers: db, app, ai, watchtower)

---

## 🚀 Getting Started (The Essence)

### For Users (New Developer)

```bash
# 1. Clone & Install
git clone <repo>
cd cookkie-real-estate-agent
npm install

# 2. Setup (auto-generates .env with secrets)
npm run setup

# 3. Start EVERYTHING
npm run dev

# 4. Open browser → http://localhost:3000
# Setup wizard guides you through configuration!
```

**That's it!** Two actual commands (`npm run setup` + `npm run dev`).

### For Docker (Production)

```bash
# 1. Clone
git clone <repo>
cd cookkie-real-estate-agent

# 2. Setup
npm run setup

# 3. Start Docker
docker-compose up -d

# Done! → http://localhost:3000
```

---

## 🏗️ Simplified Architecture

### Directory Structure

```
cookkie-real-estate-agent/
├── .env                    # ⭐ ONE config file (auto-generated)
├── package.json            # ⭐ 15 simple scripts (not 40!)
│
├── frontend/               # Next.js App (UI + API unified)
│   ├── src/app/            # Pages + API routes
│   │   ├── setup/          # ⭐ Setup wizard (first launch)
│   │   ├── api/            # API endpoints
│   │   └── */              # Feature pages
│   ├── src/components/     # React components
│   ├── src/lib/            # Utils + config
│   │   └── config.ts       # ⭐ Centralized config management
│   └── src/middleware.ts   # ⭐ Auto-redirect to setup
│
├── ai_tools/               # Python AI (FastAPI)
│   ├── app/agents/         # 3 AI agents
│   └── app/tools/          # 7 custom tools
│
├── database/               # Database layer
│   ├── prisma/             # Prisma schema
│   │   └── schema.prisma   # ⭐ Multi-provider (SQLite/PostgreSQL)
│   └── python/             # SQLAlchemy models
│
├── scripts/                # ⭐ ONE script only
│   └── setup-env.js        # Auto-setup .env with secrets
│
└── docs/                   # Documentation
    ├── QUICKSTART.md       # ⭐ Start here (5 min guide)
    ├── ARCHITECTURE.md     # System architecture
    └── */                  # Other guides
```

**Key Changes from v3.0.0**:
- ✅ Unified `.env` (not 5 different files)
- ✅ Setup wizard UI (not manual config)
- ✅ Auto-generated secrets (not manual openssl commands)
- ✅ One `npm run dev` command (not separate frontend/backend/ai)
- ✅ SQLite default (not PostgreSQL requirement for dev)
- ✅ Middleware auto-redirect (not manual navigation)

---

## ⚡ Development Principles

### 1. ESSENTIAL Commands Only

**Root package.json** has exactly **15 scripts** (down from 40+):

```json
{
  "setup": "node scripts/setup-env.js",           // Auto-setup
  "dev": "... npm run dev:app && dev:ai",         // ⭐ Start EVERYTHING
  "dev:app": "cd frontend && npm run dev",        // App only
  "dev:ai": "cd ai_tools && python main.py",      // AI only
  "build": "cd frontend && npm run build",        // Build
  "start": "cd frontend && npm start",            // Production start
  "prisma:*": "...",                              // Database commands
  "docker:*": "...",                              // Docker commands
  "install": "npm install && cd frontend && ...", // Install all
  "clean": "rm -rf node_modules ..."              // Cleanup
}
```

**What we DON'T have anymore**:
- ❌ `dev:all`, `dev:frontend`, `dev:backend` (redundant)
- ❌ `install:all`, `install:frontend`, `install:backend` (confusing)
- ❌ `start:production`, `start:backend`, `start:frontend` (too many)
- ❌ 27 shell scripts in `scripts/` (now just 1!)

### 2. SIMPLE Configuration

**Before (v3.0.0)**: 5 different .env files
- `config/backend.env.example`
- `config/frontend.env.example`
- `config/ai_tools.env.example`
- `config/docker.env.example`
- `.env.example` (root)

**Now (v3.1.0)**: ONE `.env.example` in root

```bash
# .env.example structure
DATABASE_URL="file:./database/prisma/dev.db"  # SQLite default
SESSION_SECRET=                                # Auto-generated
NEXTAUTH_SECRET=                               # Auto-generated
POSTGRES_PASSWORD=                             # Auto-generated
GOOGLE_API_KEY=                                # Via GUI wizard
```

**Auto-generation script**: `scripts/setup-env.js`
- Copies `.env.example` to `.env`
- Generates all secrets automatically
- User only needs to run `npm run setup`

### 3. INTUITIVE First Launch

**Setup Wizard** (`/setup` route):
1. **User Profile**: Name, email, phone
2. **Agency Info**: Name, VAT, address (optional)
3. **API Keys**: Google AI key (with test button!)
4. **Review & Complete**

**Middleware** (`frontend/src/middleware.ts`):
- Auto-redirects to `/setup` if no UserProfile exists
- Protects all routes except `/setup` and `/api/setup`
- User can't break the app by navigating away

**Configuration Precedence**:
1. **Database** (UserProfile.settings) - GUI configured
2. **Environment** (.env file) - Fallback
3. **Defaults** (hardcoded) - Last resort

See `frontend/src/lib/config.ts` for implementation.

---

## 🛠️ Development Guidelines

### When Adding New Features

**Ask yourself**:
1. **Is it essential?** → If not, don't add it
2. **Is it simple?** → Can a beginner understand it?
3. **Is it intuitive?** → Does the UI guide the user?

**Before writing code**:
1. **Identify target module**: Frontend, AI Tools, or Database?
2. **Check existing patterns**: Don't reinvent the wheel
3. **Respect module boundaries**: Use APIs, not direct imports

**Example - Adding a new setting**:

❌ **WRONG (v3.0.0 way)**:
```typescript
// Add to .env file manually
// Update backend/.env, frontend/.env.local, ai_tools/.env
// Restart each service separately
// Hope it works
```

✅ **CORRECT (v3.1.0 way)**:
```typescript
// 1. Add to lib/config.ts interface
export interface AppConfig {
  myNewSetting: string;
}

// 2. Add to settings UI (frontend/src/app/settings/page.tsx)
<Input value={settings.myNewSetting} onChange={...} />

// 3. Done! Stored in database, survives restarts
```

### File Organization Rules

**Component Structure** (MANDATORY):
```
frontend/src/components/
├── ui/           # shadcn/ui ONLY (DO NOT EDIT MANUALLY)
├── features/     # Feature-specific components
└── layouts/      # Layout components (Header, Sidebar, etc.)
```

**API Routes** (REST conventions):
```
frontend/src/app/api/
├── properties/route.ts      # GET /api/properties, POST /api/properties
├── properties/[id]/route.ts # GET/PUT/DELETE /api/properties/:id
└── setup/
    ├── complete/route.ts    # POST /api/setup/complete
    └── test-google-ai/route.ts # POST /api/setup/test-google-ai
```

**Module Exports**:
- Each module has a `README.md` explaining its purpose
- Main functionality exposed via index files
- Internal utilities kept private

---

## 🔒 Critical Rules (NON-NEGOTIABLE)

### 1. Protect Core Files

**NEVER modify these without explicit user request**:
- `database/prisma/schema.prisma` - Database schema
- `frontend/src/app/layout.tsx` - Root layout
- `frontend/src/app/providers.tsx` - React providers
- `frontend/src/middleware.ts` - Route protection
- `package.json` (root) - Main config
- `docker-compose.yml` - Docker orchestration
- `CLAUDE.md`, `GEMINI.md` - AI instructions

### 2. Security First

**NEVER commit**:
- `.env`, `.env.local`, `.env.production`
- `*.db`, `*.db-journal`
- API keys, passwords, secrets
- Real user data

**ALWAYS use**:
- Git-ignored environment files
- Fictional seed data only
- Validation (Zod) on all inputs
- Parameterized queries (Prisma ORM)

### 3. Configuration Management

**NEVER**:
- Create multiple `.env` files in different folders
- Hardcode configuration in code
- Ask user to manually generate secrets
- Require manual database setup

**ALWAYS**:
- Use ONE root `.env` file
- Auto-generate all secrets
- Provide GUI for configuration
- Document precedence order (DB > ENV > Defaults)

### 4. Database Strategy

**Development**:
- Default: **SQLite** (`file:./database/prisma/dev.db`)
- No installation required
- File-based, portable
- Schema: `provider = "sqlite"` in schema.prisma

**Production (Docker)**:
- Automatic: **PostgreSQL 16**
- Managed by Docker Compose
- Volume-backed persistence
- Auto-migrations on startup

**Migration Strategy**:
```bash
# Development (SQLite)
npm run prisma:push      # Push schema changes

# Production (PostgreSQL)
npm run prisma:migrate   # Create versioned migrations
```

### 5. Error Handling Standards

**Every error MUST**:
- Have a clear message in Italian (user-facing)
- Include the action to resolve it
- Log technical details (developer-facing)
- Provide fallback behavior when possible

**Example**:
```typescript
try {
  await saveConfig(settings);
} catch (error) {
  // User sees
  setError("Impossibile salvare le impostazioni. Verifica la connessione al database.");

  // Console logs
  console.error('[Config] Save failed:', error);

  // Fallback
  return currentSettings; // Don't lose data
}
```

---

## 📦 Module Boundaries

### Frontend (UI)

**Location**: `frontend/src/app/`, `frontend/src/components/`

**Responsibilities**:
- React components and pages
- Client-side state (React Query)
- Form handling (react-hook-form + Zod)
- UI interactions

**Can access**:
- API routes via `fetch('/api/...')`
- Client-side utilities
- Public environment variables (`NEXT_PUBLIC_*`)

**Cannot access**:
- Database directly (use API)
- Server-side secrets
- Python AI tools directly (use API)

### Backend (API)

**Location**: `frontend/src/app/api/`

**Responsibilities**:
- REST API endpoints
- Database operations (Prisma)
- Business logic
- Input validation (Zod)

**Can access**:
- Prisma Client (database)
- All environment variables
- Server-side utilities
- External APIs

**Cannot access**:
- React components
- Client-side state
- Browser APIs

### AI Tools

**Location**: `ai_tools/`

**Responsibilities**:
- AI agents (RAG, Matching, Briefing)
- Custom tools (database queries, etc.)
- FastAPI endpoints
- Vector operations (Qdrant)

**Can access**:
- Database via SQLAlchemy
- Google AI (Gemini) API
- Python utilities

**Cannot access**:
- Next.js internals
- Frontend code
- Prisma Client (use SQLAlchemy)

### Database

**Location**: `database/`

**Responsibilities**:
- Schema definition (Prisma)
- Migrations
- Seed data
- SQLAlchemy models (Python mirror)

**Accessed by**:
- Frontend/Backend: Prisma Client
- AI Tools: SQLAlchemy
- Scraping: SQLAlchemy

---

## 🎨 UI/UX Principles

### Design System

**Library**: shadcn/ui (Radix UI primitives + Tailwind CSS)

**Component Installation**:
```bash
cd frontend
npx shadcn@latest add button
npx shadcn@latest add dialog
# etc.
```

**Components go to**: `frontend/src/components/ui/`

**⚠️ NEVER edit shadcn/ui components manually**. Always reinstall if broken.

### Accessibility

**Requirements**:
- All interactive elements keyboard-accessible
- ARIA labels on all icons
- Color contrast WCAG AA minimum
- Focus visible on all inputs
- Screen reader friendly

### Responsiveness

**Breakpoints** (Tailwind defaults):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Mobile-first**: Design for mobile, enhance for desktop

---

## 🤖 AI Features

### Available AI Agents

1. **RAG Assistant** (`ai_tools/app/agents/rag_agent.py`)
   - Chat with database in natural language
   - Context-aware responses
   - Custom tools for data access

2. **Property Matching** (`ai_tools/app/agents/matching_agent.py`)
   - Match properties to client requests
   - Scoring algorithm (0-100)
   - Smart recommendations

3. **Daily Briefing** (`ai_tools/app/agents/briefing_agent.py`)
   - Morning summary of activities
   - Suggested actions
   - Priority alerts

### Adding New AI Features

**Process**:
1. Create agent in `ai_tools/app/agents/`
2. Create custom tools in `ai_tools/app/tools/`
3. Add router in `ai_tools/app/routers/`
4. Update frontend to call AI endpoint
5. Add UI for results

**Example**:
```python
# ai_tools/app/agents/new_agent.py
from datapizza import Agent

class NewAgent(Agent):
    name = "New Feature Agent"
    description = "Does something cool"

    async def run(self, input: str):
        # Your logic here
        return result
```

---

## 📚 Documentation Standards

### Documentation Structure

**CRITICAL - Only TWO documentation files allowed in repository root**:

1. **[README.md](README.md)** - Project overview and tech stack
   - What the project does
   - Features list
   - Tech stack (frameworks, libraries)
   - Architecture overview
   - Quick link to QUICKSTART.md

2. **[QUICKSTART.md](QUICKSTART.md)** - Complete installation guide
   - **Single unified document** for installation
   - Step-by-step instructions (Docker + Local)
   - Troubleshooting section
   - First-time usage guide
   - All setup information in ONE place

**FORBIDDEN**:
- ❌ NO `docs/` folder with scattered documentation
- ❌ NO separate guides (INSTALL.md, SETUP.md, GUIDE.md, etc.)
- ❌ NO duplicated information across files
- ❌ NO module-specific README files (unless for npm packages)

**Rationale**: Reduces confusion, eliminates outdated docs, forces essentiality

### File Headers

**Every code file MUST have**:
```typescript
/**
 * CRM IMMOBILIARE - [Component/Feature Name]
 *
 * [Brief description of what this file does]
 *
 * @module [module-name]
 * @since v3.1.1
 */
```

### Comments

**When to comment**:
- Complex business logic
- Non-obvious algorithms
- Workarounds for bugs
- API integrations

**When NOT to comment**:
- Obvious code (`// set x to 5`)
- Self-explanatory functions
- Standard patterns

**Example**:
```typescript
// ✅ GOOD
// Calculate commission percentage based on property price
// Properties > 500k have reduced commission
const commission = price > 500_000 ? 0.025 : 0.03;

// ❌ BAD
// Set commission
const commission = 0.03;
```

---

## 🧪 Testing Strategy

**Current Status**: Basic test structure in place, comprehensive tests pending

**Test Organization**:
```
tests/
├── unit/               # Unit tests
│   ├── frontend/       # Jest + React Testing Library
│   ├── backend/        # Jest (API routes)
│   └── ai_tools/       # pytest
│
├── integration/        # Integration tests
│   └── api/            # API endpoint tests
│
└── e2e/                # End-to-end tests
    └── scenarios/      # User journey tests
```

**When adding features**:
1. Write unit tests for business logic
2. Write integration tests for API endpoints
3. Add E2E tests for critical user paths

---

## 🐳 Docker & Deployment

### Docker Compose Services

**4 containers** (not 3 as docs claim):
1. `database` - PostgreSQL 16
2. `app` - Next.js (UI + API)
3. `ai-tools` - FastAPI
4. `watchtower` - Auto-updater

**Auto-update**: Watchtower checks GitHub Container Registry every 5 minutes, pulls latest images, and restarts containers.

**Volumes** (persistent data):
- `postgres_data` - Database
- `app_uploads` - User uploads
- `app_backups` - Backups

### Environment in Docker

**Override mechanism**:
```yaml
# docker-compose.yml
environment:
  DATABASE_URL: postgresql://user:pass@database:5432/db  # Overrides .env
```

**Precedence**: docker-compose.yml > .env > defaults

---

## 🗺️ Roadmap & Future Features

### v3.1.0 (Current) - Essentiality Update
- ✅ Unified .env configuration
- ✅ Setup wizard UI
- ✅ Auto-generated secrets
- ✅ One-command startup
- ✅ SQLite default for dev

### v3.2.0 (Next) - Enhanced Settings
- [ ] Settings page with connection testing
- [ ] API key management UI
- [ ] Theme customization
- [ ] Backup/restore from UI

### v3.3.0 - Authentication
- [ ] User login system
- [ ] JWT auth
- [ ] Password reset flow
- [ ] Session management

### v4.0.0 - Multi-tenant
- [ ] Multiple agencies support
- [ ] Role-based access control
- [ ] Agency switcher

---

## 💡 Common Tasks

### Adding a New Page

```bash
# 1. Create page file
frontend/src/app/new-feature/page.tsx

# 2. Add navigation link
frontend/src/components/layouts/Sidebar.tsx

# 3. Create API endpoint (if needed)
frontend/src/app/api/new-feature/route.ts

# 4. Test
npm run dev
# Navigate to /new-feature
```

### Adding a New Setting

```typescript
// 1. Update config interface
// frontend/src/lib/config.ts
export interface AppConfig {
  myNewSetting: boolean;
}

// 2. Add to settings page
// frontend/src/app/settings/page.tsx
<Switch checked={settings.myNewSetting} onChange={...} />

// 3. Save to database
await saveConfig({ myNewSetting: true });
```

### Adding a New AI Agent

```python
# 1. Create agent file
# ai_tools/app/agents/my_agent.py
from datapizza import Agent

class MyAgent(Agent):
    name = "My Agent"
    # ... implementation

# 2. Create router
# ai_tools/app/routers/my_agent.py
from fastapi import APIRouter
router = APIRouter()

@router.post("/")
async def run_agent(input: str):
    # ...

# 3. Register router
# ai_tools/main.py
app.include_router(my_agent_router, prefix="/my-agent")

# 4. Call from frontend
const result = await fetch('http://localhost:8000/my-agent', {
  method: 'POST',
  body: JSON.stringify({ input: 'test' })
});
```

---

## 📞 Getting Help

**Documentation**:
- [QUICKSTART.md](docs/QUICKSTART.md) - 5-minute setup guide
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [Module README files](frontend/README.md) - Detailed module docs

**For AI Assistants**:
- This file (CLAUDE.md) - Development principles
- [GEMINI.md](GEMINI.md) - Same content, Gemini-optimized

**When stuck**:
1. Check QUICKSTART.md first
2. Read module README.md
3. Search existing code for examples
4. Ask user for clarification

---

## 🎓 Key Takeaways for AI Assistants

**Remember**:
1. **ONE command to start**: `npm run dev` (not multiple scripts)
2. **ONE config file**: `.env` in root (not scattered configs)
3. **ZERO manual setup**: Everything auto-generated
4. **Setup wizard FIRST**: No direct code configuration
5. **SQLite for dev**: No PostgreSQL installation needed
6. **GUI over CLI**: User configures via web UI, not terminal
7. **Errors explain solutions**: Every error message is actionable
8. **Protect core files**: Schema, layout, providers are sacred
9. **Module boundaries**: Frontend → API → Database (respect layers)
10. **Essential only**: If it's not essential, don't add it

**Mantra**: *"Would a beginner understand this in 30 seconds?"*

If the answer is no, simplify it.

---

**Made with ❤️ for Italian real estate agents by Luca M. & Claude Code**

**Version**: 3.1.0 (Essentiality Update)
**Last Updated**: 2025-11-08
**Status**: ✅ Production Ready | ⚡ Simplified | 🎯 Essential
