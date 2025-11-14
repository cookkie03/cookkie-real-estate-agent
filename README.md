# 🏡 CRM Immobiliare - AI-Powered Real Estate CRM

**Sistema CRM completo per agenti immobiliari con intelligenza artificiale integrata**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Overview

CRM Immobiliare è un sistema completo di gestione per agenti immobiliari singoli, con funzionalità AI avanzate:

### ✨ Features Principali

- 🏠 **Gestione Immobili** - CRUD completo con dettagli, foto, caratteristiche
- 👥 **Gestione Clienti** - Profili completi, richieste, priorità
- 🤖 **AI Matching** - Matching automatico property-cliente con scoring
- 💬 **RAG Assistant** - Chat AI con accesso diretto al database
- 📊 **Dashboard** - Statistiche real-time, attività, calendario
- 🗺️ **Mappa Interattiva** - Visualizzazione geografica immobili
- ⌨️ **Command Palette** - Navigazione rapida (Cmd/Ctrl+K)
- 🌐 **Web Scraping** - Import automatico da portali immobiliari
- 📧 **Daily Briefing** - Report giornaliero AI-generated

---

## 🚀 Quick Start

### 🐳 Deploy con Docker (Consigliato)

**Il modo più semplice per deployare il CRM con auto-aggiornamento da GitHub:**

```bash
# 1. Clone repository
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# 2. Configure environment
cp .env.example .env
# Modifica .env con i tuoi valori

# 3. Start all services
docker-compose up -d
```

**Auto-update**: Ogni push al branch `main` aggiorna automaticamente i container entro 5 minuti grazie a Watchtower!

**Servizi inclusi**:
- ✅ PostgreSQL 16 Database
- ✅ Next.js 14 App (Frontend + Backend API)
- ✅ Python FastAPI (AI Tools)
- ✅ Watchtower (Auto-update)

**Documentazione completa**: **[docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)**
- 📦 Deployment su Synology NAS (GUI)
- 🖥️ Deployment con Docker Desktop (GUI)
- 💻 Deployment CLI per server Linux
- 🔧 Troubleshooting completo

### 💻 Sviluppo Locale

#### Prerequisites

- **Node.js** 20+
- **npm** o **yarn**
- **Python** 3.11+ (per AI tools)
- **Docker** (opzionale)

#### Opzione 1: Docker (Più Semplice)

```bash
# Clone repository
git clone https://github.com/yourusername/crm-immobiliare.git
cd crm-immobiliare

# Start con Docker Compose (3 servizi)
docker-compose up -d

# Accedi
# App (UI + API): http://localhost:3000
# AI Tools:       http://localhost:8000
# Database:       PostgreSQL su porta 5432
```

#### Opzione 2: Sviluppo Nativo

```bash
# 1. Clone repository
git clone https://github.com/yourusername/crm-immobiliare.git
cd crm-immobiliare

# 2. Install dependencies
npm install

# 3. Setup configurazione
cp config/backend.env.example backend/.env
cp config/frontend.env.example frontend/.env.local
cp config/ai_tools.env.example ai_tools/.env

# 4. Configure database (PostgreSQL recommended)
cd database/prisma
npx prisma generate
npx prisma db push
npx tsx seed.ts  # Dati di esempio

# 5. Start development
cd ../..
cd frontend
npm run dev  # App unificata (UI + API) su porta 3000

# AI Tools (opzionale, in another terminal)
cd ../ai_tools
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
python main.py  # Porta 8000
```

### Accesso

- **App (UI + API)**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **AI Tools**: http://localhost:8000/health
- **AI API Docs**: http://localhost:8000/docs

---

## 📦 Architettura Monorepo

**Clean Architecture + DDD** - Monorepo con packages condivisi:

```
crm-immobiliare/
├── packages/          # Shared libraries
│   ├── database/      # Prisma schema & client
│   ├── shared-types/  # DTOs & API contracts
│   ├── ai-toolkit/    # AI agents & tools
│   ├── config/        # Shared configs
│   └── utils/         # Utilities
│
├── apps/
│   ├── web/           # Next.js frontend
│   └── api/           # NestJS backend (Phases 1-4 ✅)
│
├── docs/              # Architecture docs
├── infrastructure/    # Docker & deployment
│
└── [LEGACY]           # Original code (preserved)
    ├── frontend/      # Legacy Next.js
    ├── ai_tools/      # Python FastAPI
    └── database/      # Legacy Prisma
```

### Moduli Implementati

**Backend (apps/api)** - NestJS with Clean Architecture:
- ✅ Auth (JWT + Google OAuth)
- ✅ Properties (CRUD + filtering)
- ✅ Clients (management)
- ✅ Matching (7-component algorithm)
- ✅ Scraping (3 portals)
- ✅ Gmail (OAuth + AI parsing)
- ✅ WhatsApp (Business API)
- ✅ Calendar (Google sync)
- ✅ Analytics (dashboards, KPIs)
- ✅ Tasks (activity tracking)

**AI Toolkit** (packages/ai-toolkit):
- 5 specialized agents
- 11 custom tools
- Datapizza AI integration

**Shared Packages**:
- @crm-immobiliare/database
- @crm-immobiliare/shared-types
- @crm-immobiliare/utils
- @crm-immobiliare/config

**Status**: Backend complete (Phases 1-4), database integration pending.

---

## 🛠️ Tech Stack

### Backend (NestJS)
- **Framework**: NestJS 10.3.0
- **Language**: TypeScript 5.8.3
- **ORM**: Prisma 6.19.0
- **Auth**: Passport (JWT + Google OAuth)
- **Queue**: BullMQ 5.1.0
- **Cache**: Redis (ioredis)
- **WebSocket**: Socket.io 4.6.0
- **Validation**: class-validator + Zod

### Frontend (Next.js)
- **Framework**: Next.js 14.2.18
- **Language**: TypeScript
- **State**: TanStack Query 5.17.0 + Zustand 4.4.7
- **UI**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 3.4.0

### AI & Integrations
- **AI**: Google Gemini (Datapizza framework)
- **Scraping**: Playwright 1.41.0
- **APIs**: Gmail API, WhatsApp Business API, Google Calendar API
- **Python**: FastAPI (ai_tools/ service)

### Database & Infrastructure
- **DB**: PostgreSQL 16 (production), SQLite (dev)
- **ORM**: Prisma + SQLAlchemy
- **Storage**: MinIO (object storage)
- **Docker**: Multi-stage builds

---

## 📚 Documentazione

### Guide Principali

- 🐳 **[Docker Quickstart](docs/setup/DOCKER_QUICKSTART.md)** ⭐ - Deployment con Docker Compose (PRINCIPALE)
- 📖 [Getting Started](docs/GETTING_STARTED.md) - Setup locale
- 🏗️ [Architettura](docs/ARCHITECTURE.md) - Architettura sistema

### Documentazione Moduli

- [Frontend README](frontend/README.md) - UI components, pages, styling, API routes
- [AI Tools README](ai_tools/README.md) - AI agents, tools, config
- [Database README](database/README.md) - Schema, migrations, seed
- [Scraping README](scraping/README.md) - Web scraping modules
- [Config README](config/README.md) - Environment variables

### Report Riorganizzazione

- [FASE 1](docs/reorganization/FASE1_COMPLETATA.md) - Cleanup e consolidamento
- [FASE 2](docs/reorganization/FASE2_COMPLETATA.md) - Centralizzazione configurazione

---

## ⚙️ Configuration

Tutte le configurazioni sono centralizzate in `/config`:

```bash
# Backend
cp config/backend.env.example backend/.env

# Frontend
cp config/frontend.env.example frontend/.env.local

# AI Tools
cp config/ai_tools.env.example ai_tools/.env

# Scraping (optional)
cp config/scraping.env.example scraping/.env
```

### Variabili Essenziali

```bash
# Database (shared)
DATABASE_URL="file:../database/prisma/dev.db"

# Google AI (required for AI features)
GOOGLE_API_KEY="your-api-key-here"

# Ports
FRONTEND: 3000
BACKEND:  3001
AI_TOOLS: 8000
```

Vedi [Config README](config/README.md) per dettagli completi.

---

## 🐳 Docker

### Sviluppo Locale con Docker

```bash
# From project root
docker-compose up -d
```

Avvia automaticamente 3 servizi:
- PostgreSQL database (porta 5432)
- App unificata - UI + API (porta 3000)
- AI Tools (porta 8000)

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

**Deployment Production**: Per deployment in produzione, utilizza lo stesso `docker-compose.yml` con configurazioni appropriate (vedi `docs/setup/DOCKER_QUICKSTART.md`)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

---

## 📊 Database Schema

### Modelli Principali

- **UserProfile** - Profilo agente immobiliare
- **Contact** - Contatti (clienti, proprietari, lead)
- **Property** - Immobili completi
- **Request** - Richieste di ricerca clienti
- **Match** - Matching property-request AI
- **Activity** - Timeline CRM
- **Tag** - Sistema tagging universale

Vedi [Database README](database/README.md) per schema completo.

---

## 🤖 AI Features

### RAG Assistant
Chat AI con accesso diretto al database via custom tools.

**Esempi query**:
- "Mostrami appartamenti a Milano sotto 200k"
- "Chi sono i clienti VIP?"
- "Dammi statistiche vendite mese corrente"

### AI Matching
Matching automatico property-cliente con scoring intelligente.

### Daily Briefing
Report giornaliero AI-generated con attività suggerite.

Vedi [AI Tools README](ai_tools/README.md) per dettagli.

---

## 🌐 Web Scraping

Import automatico da portali immobiliari:
- Immobiliare.it
- Casa.it
- Idealista.it

```bash
cd scraping
python cli.py scrape --portal all --city Milano
```

Vedi [Scraping README](scraping/README.md) per dettagli.

---

## 🔐 Security

### Environment Variables
- ❌ **MAI** committare `.env`, `.env.local`
- ✅ Solo `.env.example` files committati
- ✅ Usa placeholder per secrets

### Data Privacy
- 🔒 Seed data **SOLO fittizio**
- 🔒 No real addresses, emails, phones
- 🔒 Database files git-ignored

### Best Practices
- Validation con Zod (input/output)
- Sanitization query SQL
- Rate limiting API (future)
- Authentication (future)

---

## 🛠️ Development Commands

### Unified App (Frontend)

```bash
# Development
cd frontend
npm run dev              # Start app (UI + API) su porta 3000
npm run build            # Build production
npm run start            # Start production server

# Prisma commands (from frontend)
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to DB
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database
```

### AI Tools

```bash
# AI Tools (Python)
cd ai_tools
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python main.py             # Port 8000
```

### Docker

```bash
# Start all services (3)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

---

## 📁 Project Structure

```
crm-immobiliare/
├── frontend/              # Next.js App Unificata (porta 3000)
│   ├── src/app/           # Pages, routes & API routes
│   │   ├── (pages)/       # UI Pages
│   │   └── api/           # API Routes (Backend)
│   ├── src/components/    # React components
│   ├── src/hooks/         # Custom hooks
│   └── src/lib/           # Utilities + DB client
│
├── ai_tools/              # Python AI (porta 8000)
│   ├── app/agents/        # AI agents
│   ├── app/tools/         # Custom tools
│   └── app/routers/       # FastAPI routes
│
├── database/              # Database centralizzato
│   ├── prisma/            # Prisma schema & migrations
│   └── python/            # SQLAlchemy models
│
├── scraping/              # Web scraping
│   ├── portals/           # Portal scrapers
│   └── common/            # Shared utilities
│
├── config/                # Configurazione centralizzata
│   ├── *.env.example      # Environment templates
│   ├── docker-compose.yml # Docker orchestration (3 servizi)
│   └── README.md          # Config docs
│
├── backend/               # [ARCHIVED] Migrato in frontend/src/app/api
├── scripts/               # Automation scripts
├── tests/                 # Test suite
├── logs/                  # Centralized logs
└── docs/                  # Documentation
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

- **Next.js** - The React Framework
- **Prisma** - Next-generation ORM
- **shadcn/ui** - Re-usable components
- **Google Gemini** - AI capabilities
- **DataPizza AI** - AI agent framework

---

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/yourusername/crm-immobiliare/issues)
- 💬 [Discussions](https://github.com/yourusername/crm-immobiliare/discussions)

---

## 🗺️ Status & Roadmap

### ✅ Completato (v4.0.0 - Phase 1-4)

**Backend (NestJS)**:
- [x] Core architecture (Clean Architecture + DDD)
- [x] Auth module (JWT + Google OAuth)
- [x] Properties module (CRUD + filtering)
- [x] Clients module (management)
- [x] Matching algorithm (7-component scoring)
- [x] Scraping module (3 portals: Immobiliare.it, Casa.it, Idealista.it)
- [x] Gmail integration (OAuth + AI parsing)
- [x] WhatsApp integration (Business API + webhooks)
- [x] Calendar integration (Google sync)
- [x] Analytics module (dashboards + KPIs)
- [x] Tasks module (activity tracking + reminders)

**AI Toolkit**:
- [x] 5 specialized agents
- [x] 11 custom tools
- [x] Datapizza AI framework integration

**Shared Packages**:
- [x] Database package (Prisma)
- [x] Shared types (DTOs + validation)
- [x] Utils package
- [x] Config package

### 🔄 In Sviluppo

- [ ] **Database integration** - Connect modules to Prisma
- [ ] **Frontend migration** - Update to new API endpoints
- [ ] **WebSocket gateway** - Real-time updates
- [ ] **Testing** - Unit + integration + E2E tests
- [ ] **CI/CD pipelines** - Automated deployment

### 📋 Roadmap Futuro

- [ ] **OpenAPI documentation** - Auto-generated API docs
- [ ] **Mobile app** - React Native
- [ ] **Multi-tenant** - Agency support
- [ ] **Advanced AI** - Predictive analytics

---

**Made with ❤️ for real estate agents**

**Version**: 4.0.0 (Phases 1-4 Complete - Clean Architecture)
**Last Updated**: 2025-11-14
**Architecture**: Monorepo + DDD + Clean Architecture
**Status**: ✅ Backend (10 modules) | ✅ AI Toolkit | 🔄 Database Integration Pending
