# 🏠 CRM Immobiliare AI - Sistema Completo

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

> Sistema CRM completo per agenti immobiliari italiani con AI integrata, matching automatico, web scraping e RAG assistant.

---

## ⚡ Quick Start

### Windows
```powershell
# Setup completo
scripts\install.bat

# Avvia sistema
scripts\start.bat
```

### Linux/Mac
```bash
# Setup completo
chmod +x scripts/*.sh
./scripts/install.sh

# Avvia sistema
./scripts/start.sh
```

### Accesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Tools**: http://localhost:8000/docs

---

## 🎯 Caratteristiche Principali

### ✅ Gestione Completa
- **Immobili**: CRUD completo, foto, geolocalizzazione, valutazione automatica
- **Clienti**: Contatti unificati, richieste, privacy GDPR, timeline attività
- **Edifici**: Censimento completo con dati catastali
- **Agenda**: Calendario appuntamenti e scadenze
- **Azioni**: Task manager con priorità

### 🤖 AI Integrata
- **RAG Assistant**: Chat intelligente con accesso database real-time
- **Matching AI**: Matching automatico property-request con score 0-100
- **Daily Briefing**: Briefing giornaliero automatico
- **Custom Tools**: 7 tool specializzati per database

### 🕷️ Web Scraping
- **Portali Supportati**: Immobiliare.it, Casa.it, Idealista.it
- **Scheduling**: Esecuzione automatica programmabile
- **Cache Intelligente**: Evita re-scraping inutili
- **Rate Limiting**: Rispetta limiti dei server

### 📊 Analytics & Reporting
- **Dashboard**: Statistiche real-time immobili/clienti
- **Metriche**: KPI, conversion rate, tempo medio vendita
- **Export**: PDF, Excel, JSON
- **Audit Log**: Tracciamento completo modifiche

---

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────┐
│            Frontend (Next.js 14)                │
│        React + TypeScript + shadcn/ui           │
│                Port: 3000                       │
└───────────────┬─────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌───────────┐      ┌────────────────┐
│ Backend   │      │   AI Tools     │
│ Next.js   │      │   FastAPI      │
│ Port:3001 │      │   Port: 8000   │
└─────┬─────┘      └────────┬───────┘
      │                     │
      └──────────┬──────────┘
                 ▼
        ┌────────────────┐
        │   Database     │
        │ SQLite/Prisma  │
        └────────────────┘
```

### Moduli

| Modulo | Tech Stack | Porta | Descrizione |
|--------|-----------|-------|-------------|
| **Frontend** | Next.js 14, TypeScript, React 18 | 3000 | UI completa con shadcn/ui |
| **Backend** | Next.js API Routes, Prisma | 3001 | API REST CRUD |
| **AI Tools** | FastAPI, DataPizza AI, Google Gemini | 8000 | 3 agenti AI + 7 tools |
| **Scraping** | Python, httpx, BeautifulSoup | - | Scraper modulari portali |
| **Database** | SQLite (dev), PostgreSQL (prod) | - | 10 tabelle normalizzate |

---

## 📁 Struttura Progetto (Riorganizzata!)

```
cookkie-real-estate-agent/
├── frontend/           # 🎨 UI Next.js (porta 3000)
├── backend/            # 🔧 API Next.js (porta 3001)
├── ai_tools/           # 🤖 Backend AI Python (porta 8000)
├── scraping/           # 🕷️ Web Scraping modules
├── database/           # 💾 Database layer centralizzato
├── config/             # ⚙️ Configurazioni centralizzate
├── scripts/            # 🚀 Script automazione
├── tests/              # 🧪 Test suite unificata
├── logs/               # 📋 Log centralizzati
├── docs/               # 📚 Documentazione completa
└── README.md           # Questo file
```

### Vantaggi Nuova Struttura

✅ **Massima Modularità**: Ogni componente è isolato e indipendente
✅ **Multi-Linguaggio**: Node.js + Python perfettamente integrati
✅ **One-Click Setup**: Script automatici per installazione e avvio
✅ **Docker Ready**: Dockerfile per ogni modulo + docker-compose
✅ **Testabile**: Test organizzati per modulo con coverage
✅ **Documentazione**: Guide complete per developer e utenti
✅ **CI/CD Ready**: Pipeline automatizzate con GitHub Actions
✅ **Scalabile**: Facile aggiungere nuovi moduli (es: mobile app)

---

## 🛠️ Stack Tecnologico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State**: React Query (TanStack Query)
- **Forms**: react-hook-form + Zod
- **Icons**: lucide-react

### Backend API
- **Framework**: Next.js 14 API Routes
- **Language**: TypeScript 5.0+
- **ORM**: Prisma
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Validation**: Zod

### AI Tools
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **AI**: DataPizza AI + Google Gemini
- **Vector Store**: Qdrant
- **ORM**: SQLAlchemy
- **Observability**: OpenTelemetry

### Web Scraping
- **Language**: Python 3.11+
- **HTTP**: httpx (async)
- **Parsing**: BeautifulSoup4, lxml
- **Scheduling**: APScheduler
- **Browser**: Playwright (opzionale)

---

## 📦 Installazione Dettagliata

### Requisiti

#### Con Docker (Raccomandato)
- Docker Desktop 20.10+
- Docker Compose 2.0+

#### Senza Docker
- Node.js 18+ (https://nodejs.org/)
- Python 3.11+ (https://www.python.org/)
- npm 9+ (incluso con Node.js)

### Step-by-Step

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/cookkie-real-estate-agent.git
   cd cookkie-real-estate-agent
   ```

2. **Configura Environment**
   ```bash
   # Crea .env da template
   cp config/.env.example config/.env

   # Modifica con tuo editor
   nano config/.env  # o code/vim/notepad
   ```

3. **Imposta Google API Key** (RICHIESTO)

   Ottieni chiave: https://ai.google.dev/

   Modifica `config/.env`:
   ```bash
   GOOGLE_API_KEY="AIzaSy_YOUR_ACTUAL_KEY_HERE"
   ```

4. **Installa & Avvia**

   **Windows:**
   ```powershell
   scripts\install.bat
   scripts\start.bat
   ```

   **Linux/Mac:**
   ```bash
   chmod +x scripts/*.sh
   ./scripts/install.sh
   ./scripts/start.sh
   ```

5. **Verifica Installazione**

   Apri browser:
   - Frontend: http://localhost:3000 ✅
   - Backend: http://localhost:3001/api/health ✅
   - AI Tools: http://localhost:8000/health ✅

---

## 🎮 Guida Uso

### Dashboard

Apri http://localhost:3000 per vedere:

- **Statistiche**: Immobili, clienti, richieste attive
- **Feed Attività**: Ultime 10 attività
- **Agenda Mini**: Prossimi appuntamenti
- **Mappa Preview**: Immobili geolocalizzati

### AI Search Bar

Clicca la search bar (grande, al centro homepage) e prova:

```
"Mostrami tutti gli appartamenti a Corbetta sotto 200k"
"Chi sono i clienti VIP attivi?"
"Trova immobili con giardino e parcheggio"
"Dammi statistiche immobili in vendita"
"Quali clienti cercano casa con budget 150-250k?"
```

L'AI interrogherà il database e risponderà in italiano!

### Command Palette

Premi `Cmd/Ctrl + K` per aprire la command palette:

- Cerca immobili/clienti
- Naviga rapidamente
- Esegui azioni
- Accedi impostazioni

### Keyboard Shortcuts

- `Cmd/Ctrl + K` - Command Palette
- `s` - Focus Search
- `g` - Go to Agenda
- `a` - Go to Actions
- `m` - Go to Map

---

## 🔧 Sviluppo

### Avvio Moduli Separati

```bash
# Solo frontend
cd frontend
npm run dev

# Solo backend
cd backend
npm run dev

# Solo AI tools
cd ai_tools
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
python main.py
```

### Database

```bash
# Prisma Studio (GUI)
cd database/prisma
npx prisma studio

# Seed database
./scripts/seed-db.sh

# Reset database
cd database/prisma
npx prisma migrate reset
```

### Test

```bash
# Tutti i test
./scripts/test-all.sh

# Solo unit
./scripts/test-all.sh --unit

# Con coverage
./scripts/test-all.sh --coverage
```

### Build Production

```bash
# Build tutti i moduli
./scripts/build-all.sh

# Build Docker images
./scripts/build-all.sh --docker
```

### Pulizia

```bash
# Pulisci build artifacts
./scripts/clean.sh

# Deep clean (anche .env)
./scripts/clean.sh --deep
```

---

## 🐳 Docker

### Avvio Completo

```bash
# Start tutti i servizi
docker-compose -f config/docker-compose.yml up

# Background mode
docker-compose -f config/docker-compose.yml up -d

# Logs
docker-compose -f config/docker-compose.yml logs -f
```

### Singoli Servizi

```bash
# Solo frontend
docker-compose -f config/docker-compose.yml up frontend

# Solo AI tools
docker-compose -f config/docker-compose.yml up ai_tools
```

### Stop

```bash
docker-compose -f config/docker-compose.yml down

# Con rimozione volumi
docker-compose -f config/docker-compose.yml down -v
```

---

## 📚 Documentazione

| Documento | Descrizione |
|-----------|-------------|
| [**GETTING_STARTED.md**](docs/GETTING_STARTED.md) | Quick start guide |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Architettura sistema |
| [**API_REFERENCE.md**](docs/API_REFERENCE.md) | Documentazione API |
| [**AI_AGENTS.md**](docs/AI_AGENTS.md) | Guide AI agents |
| [**SCRAPING.md**](docs/SCRAPING.md) | Guide web scraping |
| [**DEPLOYMENT.md**](docs/DEPLOYMENT.md) | Deploy production |
| [**TROUBLESHOOTING.md**](docs/TROUBLESHOOTING.md) | Risoluzione problemi |

### README Moduli

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [AI Tools README](ai_tools/README.md)
- [Scraping README](scraping/README.md)
- [Database README](database/README.md)
- [Config README](config/README.md)
- [Scripts README](scripts/README.md)

---

## 🔐 Sicurezza

### File Sensibili (Git-Ignored)

✅ **MAI committare:**
- `.env`, `.env.local`, `.env.production`
- `*.db`, `*.db-journal` (database files)
- `.cache/` (cache AI e scraping)
- `logs/` (log files)
- `node_modules/`, `.venv/` (dependencies)

✅ **Sempre committare:**
- `.env.example` (template pubblico)
- `Dockerfile`, `docker-compose.yml`
- Documentazione
- Codice sorgente

### Seed Data

⚠️ **Seed data è SOLO fittizio:**
- Nomi generici: "Mario Rossi", "Test User"
- Email: `user@example.com`, `test@test.com`
- Telefoni: `+39 XXX XXX XXXX`
- Indirizzi pubblici

### Privacy (GDPR)

- Flag privacy per consensi
- Audit log completo
- Anonimizzazione export
- Tracciamento consensi

---

## 🧪 Testing

### Test Suite

```bash
# Tutti i test
./scripts/test-all.sh

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# AI tools tests
cd ai_tools && pytest

# Scraping tests
cd scraping && pytest
```

### Coverage

```bash
# Con coverage report
./scripts/test-all.sh --coverage

# View coverage
open coverage/index.html
```

---

## 🚀 Deploy Production

### Docker (Raccomandato)

```bash
# Build production images
docker-compose -f config/docker-compose.yml build

# Deploy
docker-compose -f config/docker-compose.yml up -d
```

### Cloud Platforms

- **Google Cloud Run**: Deploy containerizzato auto-scaling
- **AWS ECS/Fargate**: Container orchestration
- **Azure Container Instances**: Deployment semplificato
- **DigitalOcean App Platform**: PaaS con auto-deploy
- **Railway / Render**: Deploy one-click da Git

Vedi [DEPLOYMENT.md](docs/DEPLOYMENT.md) per guide dettagliate.

---

## 🤝 Contributing

Contribuzioni benvenute! Vedi [CONTRIBUTING.md](CONTRIBUTING.md) per linee guida.

### Development Workflow

1. Fork repository
2. Crea branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Apri Pull Request

### Code Style

- **TypeScript**: ESLint + Prettier
- **Python**: Black + Flake8
- **Commits**: Conventional Commits

---

## 📊 Roadmap

### ✅ Completato (v2.0)

- [x] Riorganizzazione modulare
- [x] AI tools integrati
- [x] Web scraping strutturato
- [x] Database centralizzato
- [x] Script automazione
- [x] Documentazione completa

### 🚧 In Corso (v2.1)

- [ ] Autenticazione single-user
- [ ] CRUD UIs complete
- [ ] Test suite completa
- [ ] CI/CD pipeline

### 📋 Pianificato (v3.0)

- [ ] Multi-user support
- [ ] Mobile app (React Native)
- [ ] Voice assistant
- [ ] Document processing (PDF)
- [ ] Advanced analytics
- [ ] WhatsApp integration

---

## 🐛 Troubleshooting

### Porta già in uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Database locked

```bash
./scripts/stop.sh
./scripts/start.sh
```

### Dipendenze mancanti

```bash
./scripts/install.sh --force
```

### Docker not found

```bash
# Installa Docker o usa manual mode
./scripts/install.sh --skip-docker
```

Vedi [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) per lista completa.

---

## 📈 Performance

**Risorse richieste:**
- RAM: ~2GB totale
- CPU: 2+ cores raccomandati
- Disk: ~500MB (immagini Docker)

**Tempi:**
- First build: ~5-10 minuti
- Avvio: ~30 secondi
- Rebuild: ~2-3 minuti (cache)

---

## 📄 License

MIT License - Vedi [LICENSE](LICENSE) per dettagli.

---

## 💬 Supporto

- **GitHub Issues**: https://github.com/your-username/cookkie-real-estate-agent/issues
- **Documentazione**: `docs/`
- **Email**: your-email@example.com

---

## ⭐ Credits

Powered by:
- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [DataPizza AI](https://datapizza.ai/)
- [Google Gemini](https://ai.google.dev/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**🎉 Pronto per iniziare? Esegui `./scripts/install.sh` e poi `./scripts/start.sh`!**

---

**Made with ❤️ by [Your Name]**

**Last updated**: 2025-01-17
**Version**: 2.0.0 (Riorganizzazione Modulare)
