# 🚀 CRM Immobiliare AI - Sistema Completo

## ⚡ **AVVIO IMMEDIATO - 1 COMANDO**

### Windows
```bash
run.bat
```

### Linux/Mac
```bash
chmod +x run.sh
./run.sh
```

**✅ FATTO! Il sistema:**
- Compila automaticamente tutto (build completa)
- Avvia Backend Python AI (porta 8000)
- Avvia Frontend Next.js (porta 3000)
- Configura database e dipendenze
- **ZERO configurazione manuale richiesta!**

---

## 🎯 Accesso Rapido

Una volta avviato con `run.bat`:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs Interactive:** http://localhost:8000/docs

---

## 📋 Modalità di Avvio

### 1. Automatica (RACCOMANDATO)

```bash
run.bat  # Windows
./run.sh # Linux/Mac
```

Lo script rileva automaticamente:
- ✅ Se hai Docker → Usa Docker (containerizzato)
- ✅ Se non hai Docker → Installa e avvia manualmente

### 2. Docker Manuale

```bash
docker-compose up
```

### 3. Tradizionale Manuale

```bash
# Windows
start-ai-system.bat

# Linux/Mac
./start-ai-system.sh
```

---

## 🤖 Sistema AI Integrato

### DataPizza AI Framework

**3 Agenti AI Pronti:**
1. **RAG Assistant** - Chat intelligente con database access
2. **AI Matching** - Matching semantico property-request
3. **Daily Briefing** - Briefing automatico giornaliero

**7 Custom Tools:**
- Query properties/contacts/requests/matches
- Ricerca semantica immobili e contatti
- Dettagli completi e statistiche

**Powered by Google Gemini** (API key già configurata)

---

## 🧪 Test Immediato

1. Avvia: `run.bat`
2. Vai su: http://localhost:3000
3. Clicca la **search bar** (grande, al centro homepage)
4. Scrivi: `Mostrami tutti gli appartamenti a Corbetta sotto 200k`
5. **L'AI interrogherà il database SQLite e risponderà!**

---

## 📚 Stack Tecnologico

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **shadcn/ui** (Radix UI)
- **Tailwind CSS**
- **React Query**

### Backend AI
- **FastAPI** + **DataPizza AI**
- **Google Gemini** (LLM)
- **SQLAlchemy** (Database ORM)
- **Qdrant** (Vector Store - opzionale)

### Database
- **Prisma** + **SQLite**
- Database condiviso tra Next.js e Python
- Seed automatico con dati di esempio

---

## 🔑 Prerequisiti

### Con Docker (Automatico)
- ✅ Docker Desktop
- ✅ Nient'altro!

### Senza Docker (Automatico)
- ✅ Node.js 20+
- ✅ Python 3.11+
- ✅ Lo script installerà tutto automaticamente

---

## 📖 Documentazione

| Documento | Descrizione |
|-----------|-------------|
| **`README_DOCKER.md`** | Guida Docker completa |
| **`QUICK_START.md`** | Quick start con esempi |
| **`DOCKER_GUIDE.md`** | Docker avanzato |
| **`DATAPIZZA_SETUP.md`** | Setup AI dettagliato |
| **`AI_SYSTEM_READY.md`** | Funzionalità AI |

---

## 🛠️ Comandi Sviluppo

### Docker

```bash
# Avvia
docker-compose up

# Background
docker-compose up -d

# Logs
docker-compose logs -f

# Ferma
docker-compose down

# Rebuild
docker-compose build --no-cache
```

### Tradizionale

```bash
# Frontend
npm run dev

# Backend Python
cd python_ai
uvicorn main:app --reload

# Database
npm run prisma:studio
```

---

## 🌟 Funzionalità AI

### RAG Assistant
Dalla **search bar** puoi chiedere:

**Immobili:**
- "Mostrami appartamenti a Corbetta sotto 200k"
- "Trova immobili con giardino e parcheggio"
- "Quanti trilocali in vendita abbiamo?"

**Clienti:**
- "Chi sono i clienti VIP?"
- "Mostrami clienti con budget 150k-250k"
- "Quali clienti cercano casa a Milano?"

**Statistiche:**
- "Dammi statistiche immobili in vendita"
- "Quanti clienti attivi abbiamo?"
- "Quali sono le richieste urgenti?"

**L'AI ha accesso a 7 custom tools per interrogare il database!**

---

## 🏗️ Struttura Progetto

```
cookkie-real-estate-agent/
├── run.bat / run.sh              # 🚀 AVVIO UNICO
├── docker-compose.yml            # 🐳 Docker orchestration
├── Dockerfile.python             # Python backend image
├── Dockerfile.nextjs             # Next.js frontend image
│
├── src/                          # Next.js Frontend
│   ├── app/                      # Pages (App Router)
│   │   ├── page.tsx              # Homepage con search bar
│   │   ├── search/page.tsx       # Chat AI (RAG)
│   │   └── api/ai/               # API proxy to Python
│   ├── components/               # React components
│   ├── hooks/                    # React Query hooks
│   └── lib/                      # Utilities
│
├── python_ai/                    # Python AI Backend
│   ├── main.py                   # FastAPI server
│   ├── app/
│   │   ├── agents/               # 3 AI agents
│   │   ├── tools/                # 7 custom tools
│   │   ├── routers/              # API endpoints
│   │   └── models.py             # Database models
│   └── requirements.txt          # Python dependencies
│
└── prisma/                       # Database
    ├── schema.prisma             # Schema definition
    ├── seed.ts                   # Seed data
    └── dev.db                    # SQLite database
```

---

## 🔐 Sicurezza

✅ **Google API Key** già configurata in:
- `.env.local` (Next.js)
- `python_ai/.env` (Python)

✅ **File sensibili git-ignored:**
- `.env`, `.env.local`
- `*.db` files
- `python_ai/.cache/`
- `node_modules/`

---

## 🐛 Troubleshooting

### Porta già in uso

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Docker non si avvia

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Dipendenze mancanti

```bash
# Python
cd python_ai
pip install -r requirements.txt

# Node.js
npm install
```

---

## 🎯 Cosa Include

✅ **Frontend Next.js 14**
- Homepage con dashboard
- Search bar AI-powered
- Gestione immobili e clienti
- Agenda e azioni suggerite
- Mappa interattiva

✅ **Backend Python AI**
- 3 agenti AI (RAG, Matching, Briefing)
- 7 custom tools per database
- FastAPI con Swagger docs
- Google Gemini integration

✅ **Database SQLite**
- Schema Prisma completo
- Seed con dati di esempio
- Condiviso Next.js/Python

✅ **Docker Setup**
- Build multi-stage ottimizzato
- Health checks automatici
- Auto-restart on failure
- Volume persistence

✅ **Documentazione Completa**
- Guide quick start
- Setup AI dettagliato
- Docker guide avanzata

---

## 🚀 Deploy Production

```bash
# Docker production build
docker-compose -f docker-compose.yml up -d

# Oppure deploy su cloud:
# - Google Cloud Run
# - AWS ECS/Fargate
# - Azure Container Instances
# - DigitalOcean App Platform
# - Railway / Render
```

---

## 📊 Performance

**Risorse richieste:**
- RAM: ~2GB totale
- CPU: 2+ cores raccomandati
- Disk: ~500MB (immagini Docker)

**Tempi:**
- First build: ~5-10 minuti
- Avvio: ~30 secondi
- Rebuild: ~2-3 minuti (cache)

---

## ✨ Features in Arrivo

- [ ] Qdrant vector store per ricerca semantica
- [ ] Document processing (PDF upload/analysis)
- [ ] Web scraping portali immobiliari
- [ ] Voice assistant integration
- [ ] Mobile app (React Native)

---

## 🤝 Supporto

**Guide:**
- Quick start → `QUICK_START.md`
- Docker → `DOCKER_GUIDE.md`
- AI Setup → `DATAPIZZA_SETUP.md`

**Resources:**
- [Next.js Docs](https://nextjs.org/docs)
- [DataPizza AI](https://docs.datapizza.ai)
- [FastAPI Docs](https://fastapi.tiangolo.com)

---

**🎉 Esegui `run.bat` e il sistema parte! Zero configurazione! 🚀**

**Un comando. Tutto funziona. 🐳**
