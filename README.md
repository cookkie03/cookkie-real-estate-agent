# 🏡 CRM Immobiliare - AI-Powered Real Estate CRM

**Sistema CRM completo per agenti immobiliari con intelligenza artificiale integrata**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Overview

CRM Immobiliare è un sistema completo di gestione per agenti immobiliari singoli, con funzionalità AI avanzate, costruito con un'architettura moderna unificata.

### ✨ Funzionalità Principali

- 🏠 **Gestione Immobili** - CRUD completo con foto, caratteristiche, valutazione
- 👥 **Gestione Clienti** - Profili, richieste, timeline attività
- 🤖 **AI Matching** - Matching automatico property-cliente con scoring 0-100
- 💬 **RAG Assistant** - Chat AI con accesso al database
- 📊 **Dashboard** - Statistiche real-time, attività, calendario
- 🗺️ **Mappa Interattiva** - Visualizzazione geografica
- ⚡ **Command Palette** - Navigazione rapida (Cmd/Ctrl+K)
- 🌐 **Web Scraping** - Import automatico da portali immobiliari
- 📧 **Daily Briefing** - Report giornaliero AI-generated

---

## 🚀 Quick Start

**⏱️ Installation time: 5 minutes**

```bash
# 1. Clone repository
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# 2. Run installation script
chmod +x scripts/install.sh
./scripts/install.sh

# 3. Get Google AI API Key
# Visit: https://aistudio.google.com/app/apikey
# Add to frontend/.env.local and ai_tools/.env

# 4. Start services
./scripts/start-all.sh

# 5. Open application
# Frontend & API: http://localhost:3000
# AI Tools API: http://localhost:8000/docs
```

**👉 For full setup instructions: [QUICK_START.md](QUICK_START.md)**

---

## 📦 Architecture (v3.0.0 - Unified)

Modern modular architecture with **unified deployment**:

```
├── frontend/        # Next.js 14 (UI + API - port 3000)
├── ai_tools/        # Python FastAPI (port 8000)
├── database/        # Prisma + SQLite/PostgreSQL
└── scraping/        # Web scraping modules
```

**Key Features**:
- ✅ **Unified Architecture** - Frontend + Backend on same port (3000)
- ✅ **3-Service Deployment** - Simplified with Docker Compose
- ✅ **Google AI Primary** - All AI features use Google Gemini (Optional OpenRouter fallback)
- ✅ **Production Ready** - Complete with logging, monitoring, health checks

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + TypeScript | UI + API Routes |
| **AI** | FastAPI + Python 3.13 | AI agents (RAG, Matching, Briefing) |
| **Database** | Prisma + PostgreSQL/SQLite | Data persistence |
| **AI Model** | Google Gemini (Primary) | LLM for AI features |
| **UI Components** | shadcn/ui + Tailwind | React components |
| **State** | React Query | Client-side caching |

---

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** ⭐ - 5-minute setup guide
- **[CLAUDE.md](CLAUDE.md)** - Complete project documentation (source of truth)
- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Detailed setup guide
- **[docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)** - Production deployment

### Architecture & Guides
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture details
- **[docs/](docs/)** - Full documentation index

### Module Guides
- [frontend/README.md](frontend/README.md) - UI components and API routes
- [ai_tools/README.md](ai_tools/README.md) - AI agents and configuration
- [database/README.md](database/README.md) - Database schema and models
- [config/README.md](config/README.md) - Environment variables

---

## 🐳 Docker Deployment

```bash
# Start all 3 services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

Services:
- **App** (UI + API): http://localhost:3000
- **AI Tools**: http://localhost:8000
- **Database**: PostgreSQL (port 5432)

**Auto-Update**: Watchtower automatically updates containers when new images are pushed to GitHub Container Registry every 5 minutes.

---

## 🤖 AI Configuration

### Primary Service: Google Gemini ✅
All AI features use Google AI Studio API as PRIMARY service:
- **RAG Assistant** - Chat with database access
- **AI Matching** - Property-request matching
- **Daily Briefing** - Personalized briefing
- **Semantic Search** - Web scraping enhancement

**Get API Key**: https://aistudio.google.com/app/apikey

### Configuration
```bash
# Add to environment files
export GOOGLE_API_KEY="your-key-here"
```

### Optional: OpenRouter Fallback
OpenRouter is NOT currently implemented. Future integration planned as optional fallback.

---

## 🔐 Security

### Best Practices
✅ **Environment Files**
- Never commit `.env` files
- Always use `.env.example` templates
- Use `NEXT_PUBLIC_*` only for public values

✅ **Data Privacy**
- All seed data is fictional
- No real personal information
- Database files git-ignored

✅ **API Security**
- Input validation with Zod
- CORS configuration
- Health checks on all services

---

## 🛠️ Development

### Core Commands

```bash
# Frontend (UI + API unified)
cd frontend
npm install
npm run dev           # Start on port 3000

# AI Tools (Python)
cd ai_tools
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py        # Start on port 8000

# Database
cd frontend
npm run prisma:generate    # Generate Prisma Client
npm run prisma:push        # Push schema to database
npm run prisma:seed        # Seed with sample data
```

---

## 📊 Project Status

### ✅ Completed
- [x] Unified architecture (Frontend + API in single app)
- [x] 3-service Docker deployment
- [x] Complete API endpoints
- [x] Database schema with 10 models
- [x] AI agents with Google Gemini
- [x] Web scraping modules
- [x] Comprehensive documentation

### 🔄 In Development
- [ ] Advanced AI features
- [ ] Enhanced scraping

### 📋 Planned
- [ ] Authentication system (JWT/OAuth)
- [ ] Mobile app (React Native)
- [ ] Multi-tenant support

---

## 📁 Project Structure

```
crm-immobiliare/
├── frontend/              # Next.js App (port 3000)
│   ├── src/app/           # Pages & API routes
│   └── src/components/    # React components
│
├── ai_tools/              # Python FastAPI (port 8000)
│   ├── app/agents/        # AI agents
│   └── app/tools/         # Custom tools
│
├── database/              # Database layer
│   ├── prisma/            # Schema & migrations
│   └── python/            # SQLAlchemy models
│
├── scraping/              # Web scraping
├── config/                # Configuration
├── scripts/               # Automation scripts
├── docs/                  # Documentation
└── tests/                 # Test suite
```

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md).

Development workflow:
1. Create feature branch
2. Implement changes following modular principles (CLAUDE.md)
3. Run tests and build
4. Create pull request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file.

---

## 📞 Support

- 📖 **Documentation**: [docs/](docs/) and [CLAUDE.md](CLAUDE.md)
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Prisma** - Database ORM
- **shadcn/ui** - UI components
- **Google Gemini** - AI capabilities
- **FastAPI** - Python web framework

---

**Made with ❤️ for real estate agents**

**Version**: 3.0.0 (Production Ready - Unified Architecture)
**Last Updated**: 2025-11-08
**Architecture**: Unified (port 3000) + AI Tools (port 8000) + Database
**Status**: ✅ Production Ready
