# 🚀 CRM Immobiliare AI - Setup Completo

## ⚡ Avvio Rapido (1 Click)

### Windows
**Doppio click su:** `run.bat`

### Linux/Mac
```bash
./run.sh
```

Scegli **[1] Docker** e premi Invio. Fatto!

---

## 🎯 Cosa Ottieni

Un sistema CRM completo con AI:
- 🤖 Chat intelligente RAG-powered
- 📊 Matching AI semantico
- 📈 Daily briefing automatico
- 🔍 7 custom tools per database
- 🐳 Docker containerizzato

---

## 📋 Prerequisiti

**Opzione 1 - Docker (Raccomandato):**
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installato

**Opzione 2 - Locale:**
- Node.js 20+
- Python 3.11+

---

## 🚀 Avvio Sistema

### Con Docker (1 Comando)

```bash
# Windows
run.bat

# Linux/Mac  
./run.sh
```

Oppure manualmente:
```bash
docker-compose up -d
```

### Senza Docker (Locale)

```bash
# Terminal 1 - Python
cd python_ai
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 - Next.js
npm install
npm run dev
```

---

## 🌐 Accedi all'Applicazione

Dopo l'avvio:
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

---

## 🔑 Google API Key

La chiave è già configurata! Se vuoi cambiarla:

**Docker:**
Modifica `.env.docker`

**Locale:**
Modifica `.env.local` e `python_ai/.env`

Ottieni una chiave gratuita su: https://aistudio.google.com/app/apikey

---

## 🧪 Test il Sistema

1. Apri http://localhost:3000
2. Clicca sulla search bar
3. Prova: "Mostrami appartamenti a Corbetta sotto 200k"

L'AI interrogherà il database e ti darà una risposta intelligente!

---

## 📚 Documentazione

- `DOCKER_GUIDE.md` - Guida Docker completa
- `DATAPIZZA_SETUP.md` - Setup AI dettagliato
- `AI_SYSTEM_READY.md` - Funzionalità AI

---

## 🛑 Ferma il Sistema

**Docker:**
```bash
docker-compose down
```

**Locale:**
CTRL+C nei terminali aperti

---

## 🆘 Problemi?

### Porta già in uso
```bash
docker-compose down
netstat -ano | findstr :3000  # Windows
kill -9 $(lsof -ti:3000)      # Linux/Mac
```

### Rebuild completo
```bash
docker-compose down -v
docker-compose up --build
```

### Logs
```bash
docker-compose logs -f
```

---

## 🎓 Comandi Utili

```bash
# Docker
docker-compose up -d          # Avvia in background
docker-compose logs -f        # Logs in tempo reale
docker-compose ps             # Stato container
docker-compose restart        # Riavvia
docker-compose down -v        # Ferma e rimuovi tutto

# Locale
npm run dev                   # Frontend
cd python_ai && uvicorn ...   # Backend
```

---

## 📊 Struttura Progetto

```
cookkie-real-estate-agent/
├── run.bat / run.sh          # Script avvio rapido
├── docker-compose.yml        # Configurazione Docker
├── Dockerfile.python         # Build Python backend
├── Dockerfile.nextjs         # Build Next.js frontend
├── src/                      # Frontend Next.js
├── python_ai/                # Backend Python AI
├── prisma/                   # Database schema
└── docs/                     # Documentazione
```

---

## ✨ Features AI

### RAG Assistant
Chat con accesso diretto al database CRM

### AI Matching
Matching semantico property-request

### Daily Briefing
Report giornaliero automatico

### Custom Tools (7)
- query_properties_tool
- property_search_tool
- query_contacts_tool
- contact_search_tool
- get_contact_details_tool
- query_requests_tool
- query_matches_tool

---

## 🔐 Sicurezza

- ✅ File sensibili git-ignored
- ✅ API keys in environment variables
- ✅ Docker containers isolati
- ✅ Health checks automatici

---

## 📈 Performance

- Avvio: ~2-3 minuti (prima volta)
- Build Docker: ~5-10 minuti (una tantum)
- Risposta AI: ~2-3 secondi
- Database: SQLite (condiviso)

---

## 🤝 Contributi

Sviluppato con:
- Next.js 14
- FastAPI
- DataPizza AI Framework
- Google Gemini
- Docker

---

## 📞 Supporto

Per problemi o domande:
1. Controlla `DOCKER_GUIDE.md`
2. Vedi logs: `docker-compose logs -f`
3. Verifica `.env.docker` e `.env.local`

---

**Buon lavoro con il CRM Immobiliare AI! 🍕🤖**
