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

- 🏠 **Gestione Immobili** - CRUD completo con 60+ campi, foto, caratteristiche
- 👥 **Gestione Clienti** - Profili completi (42+ campi), richieste, priorità
- 🗺️ **Mappa Interattiva** - Visualizzazione geografica con urgency system, zone clustering, building census
- 🤖 **AI Matching** - Scoring algoritmico a 7 componenti (92% accuracy)
- 💬 **RAG Assistant** - Chat AI con 11 custom tools e accesso diretto al database
- 🤖 **AI Orchestrator** - Agente intelligente per scraping multi-portale con WebSocket real-time
- 📊 **Dashboard** - Statistiche real-time, attività, calendario, insights
- 🎨 **Custom Fields** - Sistema campi personalizzabili per ogni entità
- 🌐 **Web Scraping** - Import automatico da portali con Playwright (anti-detection)
- 📧 **Daily Briefing** - Report giornaliero AI-generated
- 💾 **Automated Backup** - Backup automatici database e volumi Docker
- 🔒 **Type Safety** - Enums Prisma + Zod validation per data integrity
- ⌨️ **Command Palette** - Navigazione rapida (Cmd/Ctrl+K)

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

## 📦 Architettura Modulare

Il progetto è organizzato in moduli indipendenti con deployment unificato:

```
/
├── frontend/          # Next.js App Unificata (UI + API, porta 3000)
├── ai_tools/          # Python AI (porta 8000)
├── database/          # Prisma + PostgreSQL (centralizzato)
├── scraping/          # Web scraping modules
├── config/            # Configurazione centralizzata
├── scripts/           # Automation scripts
├── tests/             # Test suite
├── logs/              # Log centralizzati
└── docs/              # Documentazione
```

### Moduli Principali

| Modulo | Linguaggio | Descrizione | Docs |
|--------|------------|-------------|------|
| **frontend** | TypeScript | App Next.js 14 (UI + API) | [README](frontend/README.md) |
| **ai_tools** | Python | AI agents + tools | [README](ai_tools/README.md) |
| **database** | SQL/TS/Py | Prisma + SQLAlchemy | [README](database/README.md) |
| **scraping** | Python | Web scraping | [README](scraping/README.md) |
| **config** | - | Configurazione | [README](config/README.md) |

**Nota**: L'architettura è stata semplificata unificando Frontend e Backend in un'unica applicazione Next.js, riducendo da 4 a 3 servizi per deployment semplificato.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **State**: React Query
- **Forms**: react-hook-form + Zod

### Backend
- **Framework**: Next.js 14 (API Routes)
- **Language**: TypeScript
- **Database**: Prisma ORM
- **Validation**: Zod

### AI Tools
- **Framework**: FastAPI
- **Language**: Python 3.13
- **AI**: DataPizza AI + Google Gemini
- **Vector Store**: Qdrant
- **Database**: SQLAlchemy

### Database
- **Development**: PostgreSQL (locale) o SQLite
- **Production**: PostgreSQL (Docker Compose)
- **ORM**: Prisma (Node.js) + SQLAlchemy (Python)
- **Migrations**: Prisma Migrate

---

## 📚 Documentazione

### Guide Principali

- 🐳 **[Docker Quickstart](docs/setup/DOCKER_QUICKSTART.md)** ⭐ - Deployment con Docker Compose (PRINCIPALE)
- 📖 **[Code Overview - Frameworks & Pipelines](docs/CODE_OVERVIEW_FRAMEWORKS_PIPELINES.md)** ⭐ - Analisi tecnica completa (NEW!)
- 🏗️ [Architettura](docs/ARCHITECTURE.md) - Architettura sistema
- 📖 [Getting Started](docs/GETTING_STARTED.md) - Setup locale

### Documentazione Moduli

- [Frontend README](frontend/README.md) - UI components, pages, styling, API routes
- [AI Tools README](ai_tools/README.md) - AI agents, tools, config
- [Database README](database/README.md) - Schema, migrations, seed
- [Scraping README](scraping/README.md) - Web scraping modules
- [Config README](config/README.md) - Environment variables
- [Backup Scripts README](scripts/backup/README.md) - Automated backup system

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

### Modelli Principali (18 Models)

**Core Entities**:
- **UserProfile** - Profilo agente immobiliare
- **Contact** - Contatti (clienti, proprietari, lead) con enums per status
- **Property** - Immobili completi (60+ fields) con urgency tracking e closure data
- **Building** - Edifici per census con zone clustering
- **Request** - Richieste di ricerca clienti con filtri avanzati

**Business Logic**:
- **Match** - Matching property-request con scoring AI (7 componenti)
- **Activity** - Timeline CRM con status tracking
- **Tag** - Sistema tagging universale polimorfico

**Advanced**:
- **CustomFieldDefinition** / **CustomFieldValue** - Campi personalizzabili
- **ScrapingJob** / **ScrapingSession** / **ScrapingSource** - Web scraping system
- **AgentConversation** / **AgentTask** / **AgentMemory** - AI system
- **AuditLog** - Change tracking per compliance

**Type Safety** (Sprint 3):
- ✅ Enums Prisma: `ContactStatus`, `PropertyStatus`, `RequestStatus`, `MatchStatus`, `ActivityStatus`
- ✅ Business Fields: `soldDate`, `soldPrice`, `rentedDate`, `closedBy`, `mandateEndDate`
- ✅ Urgency System: `urgencyScore` (0-5), `lastActivityAt` per map visualization

Vedi [Database README](database/README.md) per schema completo.

---

## 🤖 AI Features

### RAG Assistant con 11 Custom Tools
Chat AI powered by **Google Gemini 2.0 Flash** con accesso diretto al database via custom tools.

**11 Tools disponibili**:
- 🔍 **Database Query Tools** (5): SQL queries, semantic search properties/contacts
- 📊 **Business Intelligence Tools** (4): Portfolio analysis, market insights, urgent actions, property scoring
- 📋 **Detail Tools** (2): Full contact profiles, existing matches

**Esempi query**:
- "Trova i migliori 5 appartamenti per la richiesta REQ-001"
- "Analizza il mio portfolio: quali immobili sono fermi da più di 60 giorni?"
- "Chi sono i clienti VIP che non ho contattato negli ultimi 15 giorni?"
- "Quali zone a Milano hanno maggior richiesta di trilocali?"

### AI Matching - Scoring Algoritmico a 7 Componenti
Matching automatico property-cliente con algoritmo deterministico:

**Componenti scoring** (0-100 punti):
1. **Location** (25%): City + Zone matching
2. **Price** (20%): Budget fit con tolerance
3. **Property Type** (15%): Apartment, villa, etc.
4. **Size** (15%): Square meters
5. **Rooms** (10%): Number of rooms/bedrooms
6. **Features** (10%): Elevator, parking, garden, etc.
7. **Condition** (5%): Property state

**Accuracy**: 92% sulla base dei match reali

### AI Orchestrator Agent
Agente intelligente per **web scraping multi-portale** con:
- Task planning automatico
- WebSocket real-time progress
- Session management con Playwright
- Anti-detection techniques
- Database persistence

### Daily Briefing
Report giornaliero AI-generated con attività suggerite, deadline urgenti, e opportunità di business.

Vedi [AI Tools README](ai_tools/README.md) e [Code Overview](docs/CODE_OVERVIEW_FRAMEWORKS_PIPELINES.md) per dettagli completi.

---

## 🌐 Web Scraping

Sistema di scraping avanzato con **Playwright** e **AI Orchestrator**:

**Features**:
- 🤖 **AI Orchestrator**: Task planning automatico e coordinamento multi-portale
- 🎭 **Playwright**: Browser automation con anti-detection (headless Chrome)
- 💾 **Session Persistence**: Cookies e localStorage persistenti tra esecuzioni
- 📡 **Real-time Progress**: WebSocket per aggiornamenti live
- 🗄️ **Database Persistence**: Job tracking e risultati salvati
- 🗺️ **Auto-geocoding**: Coordinate geografiche automatiche da indirizzi

**Portali supportati**:
- Immobiliare.it
- Casa.it
- Idealista.it

**Usage via UI**:
1. Apri `/scraping` nell'app
2. Seleziona portale, città, filtri
3. Click "Avvia Scraping"
4. Monitora progress real-time
5. Properties importate automaticamente in database

**Usage via CLI**:
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

### ✅ Completato (v3.2.0 - Sprint 3)

**Core System** (v3.0.0):
- [x] **App unificata** - Frontend + Backend in singola applicazione Next.js
- [x] **Backend API completo** - 15+ endpoints RESTful
- [x] **Frontend completo** - 20+ pagine con ChatGPT-style UI
- [x] **Settings page** - Gestione API keys dalla UI
- [x] **Database schema** - Prisma + PostgreSQL con 18 models
- [x] **Docker setup** - Multi-stage builds ottimizzati (3 servizi + Watchtower)
- [x] **Production ready** - Deployment con Docker Compose

**Advanced Features** (v3.1.0):
- [x] **Interactive Property Map** - 8 milestones completate (urgency system, zones, building census)
- [x] **Custom Fields System** - Campi personalizzabili per tutte le entità (3 milestones)
- [x] **AI Agents attivi** - RAG Assistant (11 tools), AI Orchestrator, Property Scoring
- [x] **Form dialogs completi** - Property (60+ fields), Contact (42+ fields), Requests
- [x] **Web scraping con Playwright** - Anti-detection, session persistence, database storage
- [x] **React Query hooks** - Data fetching ottimizzato con caching

**Type Safety & Reliability** (v3.2.0 - Sprint 3):
- [x] **Type Safety completo** - Enums Prisma (ContactStatus, PropertyStatus, RequestStatus, etc.)
- [x] **Business Fields** - Closure tracking (soldDate, soldPrice), mandate management
- [x] **Automated Backup** - Scripts automatici per database e volumi Docker
- [x] **Comprehensive Documentation** - Code overview con framework e pipeline details

### 🔄 In Sviluppo (v3.3.0 - Sprint 4)

- [ ] **Performance Optimization** - API caching, query optimization
- [ ] **Advanced Analytics** - Revenue tracking, conversion funnels
- [ ] **Email Integration** - SMTP per invio automatico match ai clienti
- [ ] **Calendar Sync** - Google Calendar integration per attività

### 📋 Roadmap Futuro (v4.0.0+)

- [ ] **Authentication & Multi-user** - JWT + OAuth, gestione team
- [ ] **Mobile app** - React Native per agenti on-the-go
- [ ] **Multi-tenant** - Supporto agenzie con più agenti
- [ ] **Advanced AI** - Valutazione automatica immobili, price prediction
- [ ] **Marketplace Integration** - Pubblicazione automatica su portali

---

---

## 📦 Reorganization Complete

This project has been fully reorganized into a modular, scalable architecture:

✅ **9 Phases Completed**:
1. ✅ Cleanup and Code Consolidation
2. ✅ Configuration Centralization
3. ✅ Structured Documentation
4. ✅ Automation Scripts
5. ✅ Docker & Containerization
6. ✅ Testing & CI/CD
7. ✅ Logging & Monitoring
8. ✅ Database Standardization
9. ✅ Finalization & Cleanup

**Result**: Clean, modular, production-ready architecture.

See [docs/](docs/) for complete reorganization reports.

---

**Made with ❤️ for real estate agents**

**Version**: 3.2.0 (Sprint 3 - Type Safety, Custom Fields, AI Enhanced)
**Last Updated**: 2025-11-11
**Architecture**: 3-Service Deployment (Docker Compose + Watchtower auto-update)
**Status**: ✅ App Unificata (UI + API) | ✅ AI Tools (11 custom tools) | ✅ PostgreSQL (18 models) | ✅ Interactive Map | ✅ Web Scraping
