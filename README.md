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

### ✅ Completato (v3.0.0)

- [x] **App unificata** - Frontend + Backend in singola applicazione Next.js
- [x] **Backend API completo** - 11 endpoints RESTful
- [x] **Frontend completo** - 18 pagine con ChatGPT-style UI
- [x] **Settings page** - Gestione API keys dalla UI
- [x] **Database schema** - Prisma + PostgreSQL
- [x] **Docker setup** - Multi-stage builds ottimizzati (3 servizi)
- [x] **Production ready** - Deployment con Docker Compose

### 🔄 In Sviluppo

- [ ] **React Query hooks** - Data fetching ottimizzato
- [ ] **AI agents attivi** - RAG, Matching, Briefing
- [ ] **Form dialogs** - CRUD completo dalla UI

### 📋 Roadmap Futuro

- [ ] **Authentication** - JWT + OAuth
- [ ] **Web scraping attivo** - Import automatico portali
- [ ] **Mobile app** - React Native
- [ ] **Multi-tenant** - Supporto agenzie

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

**Version**: 3.0.0 (Production Ready - Unified Architecture)
**Last Updated**: 2025-11-06
**Architecture**: 3-Service Deployment (Docker Compose)
**Status**: ✅ App Unificata (UI + API) | ✅ AI Tools | ✅ PostgreSQL Database
