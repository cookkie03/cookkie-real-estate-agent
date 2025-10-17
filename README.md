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

### Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **npm** o **yarn**

### Installazione Rapida

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

# 4. Configure database
cd database/prisma
npx prisma generate
npx prisma db push
npx tsx seed.ts  # Dati di esempio

# 5. Start development
cd ../..
npm run dev:frontend  # Frontend su porta 3000
npm run dev:backend   # Backend su porta 3001

# AI Tools (opzionale)
cd ai_tools
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
python main.py  # Porta 8000
```

### Accesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Tools**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📦 Architettura Modulare

Il progetto è organizzato in moduli indipendenti:

```
/
├── frontend/          # Next.js UI (porta 3000)
├── backend/           # Next.js API (porta 3001)
├── ai_tools/          # Python AI (porta 8000)
├── database/          # Prisma + SQLite (centralizzato)
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
| **frontend** | TypeScript | UI Next.js 14 | [README](frontend/README.md) |
| **backend** | TypeScript | API Next.js 14 | [README](backend/README.md) |
| **ai_tools** | Python | AI agents + tools | [README](ai_tools/README.md) |
| **database** | SQL/TS/Py | Prisma + SQLAlchemy | [README](database/README.md) |
| **scraping** | Python | Web scraping | [README](scraping/README.md) |
| **config** | - | Configurazione | [README](config/README.md) |

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
- **Development**: SQLite (condiviso)
- **ORM**: Prisma (Node.js) + SQLAlchemy (Python)
- **Production**: PostgreSQL (recommended)

---

## 📚 Documentazione

### Guide Principali

- 📖 [Getting Started](docs/GETTING_STARTED.md) - Guida setup completa
- 🏗️ [Architettura](docs/ARCHITECTURE.md) - Architettura sistema
- 🔄 [Migration Guide](docs/MIGRATION.md) - Migrazione da versioni precedenti
- 🐳 [Docker Guide](config/README.md#docker-setup) - Deploy con Docker

### Documentazione Moduli

- [Frontend README](frontend/README.md) - UI components, pages, styling
- [Backend README](backend/README.md) - API endpoints, routes
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

### Quick Start con Docker

```bash
# From project root
docker-compose -f config/docker-compose.yml up
```

Avvia automaticamente:
- Frontend (porta 3000)
- Backend (porta 3001)
- AI Tools (porta 8000)
- Database condiviso

### Docker Compose

```bash
# Start all services
docker-compose -f config/docker-compose.yml up -d

# View logs
docker-compose -f config/docker-compose.yml logs -f

# Stop all
docker-compose -f config/docker-compose.yml down
```

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

### Root Level

```bash
# Start frontend (recommended)
npm run dev

# Start backend separately
npm run dev:backend

# Start frontend separately
npm run dev:frontend

# Build all
npm run build

# Prisma commands
npm run prisma:generate
npm run prisma:push
npm run prisma:studio
npm run prisma:seed
```

### Module Level

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# AI Tools
cd ai_tools && python main.py
```

---

## 📁 Project Structure

```
crm-immobiliare/
├── frontend/              # Next.js UI (porta 3000)
│   ├── src/app/           # Pages & routes
│   ├── src/components/    # React components
│   ├── src/hooks/         # Custom hooks
│   └── src/lib/           # Utilities
│
├── backend/               # Next.js API (porta 3001)
│   ├── src/app/api/       # API routes
│   └── src/lib/           # DB & utilities
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
│   ├── docker-compose.yml # Docker orchestration
│   └── README.md          # Config docs
│
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

## 🗺️ Roadmap

- [x] **Phase 1**: Next.js migration ✅
- [x] **Phase 2**: API implementation ✅
- [x] **Phase 3**: AI integration ✅
- [ ] **Phase 4**: Authentication system
- [ ] **Phase 5**: Advanced scraping
- [ ] **Phase 6**: Mobile app
- [ ] **Phase 7**: Production deployment

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

**Version**: 3.0.0 (Reorganization Complete)
**Last Updated**: 2025-10-17
