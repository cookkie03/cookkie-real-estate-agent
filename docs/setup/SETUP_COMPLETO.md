# ✅ Setup Completo - Sistema Pronto all'Uso

## 🎉 Tutto Configurato!

Il sistema CRM Immobiliare AI è completamente configurato e pronto all'uso.

---

## 🚀 Come Avviare (Scelta la Modalità)

### 🐳 Opzione 1: Docker (RACCOMANDATO)

**Windows:**
```
Doppio click su: run.bat
Seleziona [1]
```

**Linux/Mac:**
```bash
./run.sh
Seleziona [1]
```

**Manuale:**
```bash
docker-compose up -d
```

✅ **Vantaggi:**
- Zero configurazione
- Build automatico
- Isolamento completo
- Deploy consistente

---

### 💻 Opzione 2: Locale (Sviluppo)

**Windows:**
```
Doppio click su: run.bat
Seleziona [2]
```

**Linux/Mac:**
```bash
./run.sh
Seleziona [2]
```

✅ **Vantaggi:**
- Hot reload immediato
- Debug più facile
- Modifica codice in tempo reale

---

## 🌐 Accedi al Sistema

Dopo l'avvio (qualsiasi modalità):

**Frontend (Interfaccia Web)**
👉 http://localhost:3000

**API Docs (Swagger UI)**
👉 http://localhost:8000/docs

**Backend Health**
👉 http://localhost:8000/health

---

## 🧪 Test Rapido

1. Apri http://localhost:3000
2. Clicca sulla **barra di ricerca** (grande, al centro)
3. Prova questa query:

```
Mostrami tutti gli appartamenti a Corbetta sotto 200k
```

L'AI interrogherà il database e ti darà una risposta intelligente! 🤖

---

## 📋 Cosa Hai a Disposizione

### ✅ Backend Python (FastAPI)
- Port: 8000
- DataPizza AI Framework
- Google Gemini LLM
- 7 custom tools per database
- Health checks automatici

### ✅ Frontend Next.js
- Port: 3000
- React Query integrato
- UI components pronti
- Search bar RAG-powered

### ✅ Database SQLite
- Condiviso tra backend e frontend
- Prisma ORM
- Seed data disponibile

### ✅ Sistema AI
- RAG Assistant (chat intelligente)
- AI Matching (semantico)
- Daily Briefing (automatico)

---

## 🔑 Google API Key

**Già configurata automaticamente!**

La chiave è stata inserita in:
- `.env.local` (Next.js)
- `python_ai/.env` (Python)
- `.env.docker` (Docker)

Se vuoi cambiarla:
- Ottieni nuova chiave: https://aistudio.google.com/app/apikey
- Modifica i file sopra
- Riavvia il sistema

---

## 📊 Comandi Utili

### Docker
```bash
docker-compose up -d          # Avvia
docker-compose down           # Ferma
docker-compose logs -f        # Logs
docker-compose ps             # Stato
docker-compose restart        # Riavvia
```

### Locale
```bash
npm run dev                   # Frontend
cd python_ai && uvicorn ...   # Backend
```

---

## 🛑 Come Fermare

### Docker
```bash
docker-compose down
```

Oppure:
```
run.bat → Seleziona [3]
./run.sh → Seleziona [3]
```

### Locale
CTRL+C nelle finestre terminale aperte

---

## 📚 Documentazione Disponibile

| File | Descrizione |
|------|-------------|
| `README_DOCKER.md` | Guida rapida Docker |
| `DOCKER_GUIDE.md` | Docker completo |
| `AI_SYSTEM_READY.md` | Sistema AI |
| `DATAPIZZA_SETUP.md` | Setup dettagliato |
| `START_AI_SYSTEM.md` | Avvio manuale |

---

## 🔧 Personalizzazione

### Modifica Comportamento AI

File: `python_ai/app/agents/rag_assistant.py`

Modifica il `SYSTEM_PROMPT` per personalizzare le risposte.

### Aggiungi Custom Tools

File: `python_ai/app/tools/`

Crea nuovi tools seguendo il pattern esistente.

### Modifica UI

File: `src/components/`

Tutti i componenti React sono modificabili.

---

## 🐛 Troubleshooting

### Porta già in uso?
```bash
# Ferma servizi esistenti
docker-compose down

# Oppure cambia porta in docker-compose.yml
ports:
  - "3001:3000"
```

### Build fallisce?
```bash
# Pulizia completa
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Backend non risponde?
```bash
# Verifica logs
docker-compose logs python-backend

# Riavvia
docker-compose restart python-backend
```

### Database locked?
```bash
# Riavvia tutti i servizi
docker-compose restart
```

---

## 📈 Performance Attese

- **Avvio Docker:** 2-3 minuti (prima volta)
- **Avvio Locale:** 30 secondi
- **Build Docker:** 5-10 minuti (una tantum)
- **Risposta AI:** 2-3 secondi
- **Query Database:** <100ms

---

## ✅ Checklist Setup

- [x] Google API Key configurata
- [x] Docker configurato (o ambiente locale)
- [x] Database setup (Prisma)
- [x] Backend Python funzionante
- [x] Frontend Next.js funzionante
- [x] Sistema RAG collegato
- [x] API proxy configurate
- [x] Health checks attivi
- [x] Documentazione completa

**Tutto pronto! 🎉**

---

## 🎯 Prossimi Passi

1. ✅ Testa il sistema con query reali
2. ✅ Esplora API Docs: http://localhost:8000/docs
3. ✅ Personalizza i system prompts AI
4. ✅ Aggiungi custom tools per il tuo business
5. ✅ Popola il database con dati reali
6. ✅ Deploy in production

---

## 🆘 Supporto

**Documentazione:**
- Tutti i file `.md` nella root del progetto
- API Docs interattiva su http://localhost:8000/docs

**Logs:**
```bash
# Docker
docker-compose logs -f

# Locale
# Vedi output nei terminali
```

**Reset Completo:**
```bash
docker-compose down -v
docker system prune -af
docker-compose up --build
```

---

## 🎊 Congratulazioni!

Hai un sistema CRM Immobiliare AI completo e funzionante con:

- 🤖 Chat intelligente RAG
- 🧠 Google Gemini AI
- 📊 Database CRM
- 🐳 Docker containerizzato
- 🚀 Deploy ready

**Un solo comando per avviare tutto!**

```bash
docker-compose up -d
```

**Buon lavoro! 🍕🤖**
