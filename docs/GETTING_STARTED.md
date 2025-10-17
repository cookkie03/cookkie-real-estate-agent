# 🚀 Getting Started - CRM Immobiliare

Guida rapida per iniziare ad usare il CRM Immobiliare.

## Requisiti

### Con Docker (Raccomandato)
- **Docker Desktop** installato e funzionante
- Nient'altro!

### Senza Docker
- **Node.js 18+** (https://nodejs.org/)
- **Python 3.11+** (https://www.python.org/)
- **npm** (incluso con Node.js)

## Setup One-Click

### Windows

```powershell
# Clona repository
git clone https://github.com/your-username/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# Setup completo
scripts\install.bat

# Avvia sistema
scripts\start.bat
```

### Linux/Mac

```bash
# Clona repository
git clone https://github.com/your-username/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# Setup completo
chmod +x scripts/*.sh
./scripts/install.sh

# Avvia sistema
./scripts/start.sh
```

## Primo Avvio

1. **Setup** (solo prima volta)
   ```bash
   ./scripts/install.sh  # o install.bat su Windows
   ```

2. **Configura API Key**
   - Apri `config/.env`
   - Sostituisci `GOOGLE_API_KEY` con la tua chiave
   - Salva il file

3. **Avvia Sistema**
   ```bash
   ./scripts/start.sh  # o start.bat su Windows
   ```

4. **Apri Browser**
   - Frontend: http://localhost:3000
   - API Backend: http://localhost:3001
   - AI Tools: http://localhost:8000/docs

## Verifica Installazione

Il sistema dovrebbe mostrare:

```
✅ Frontend ready at http://localhost:3000
✅ Backend ready at http://localhost:3001
✅ AI Tools ready at http://localhost:8000
```

### Test Manuale

1. Apri http://localhost:3000
2. Dovresti vedere la dashboard
3. Clicca sulla search bar (in alto)
4. Scrivi: `Mostrami tutti gli immobili`
5. L'AI dovrebbe rispondere con i dati dal database

## Struttura del Progetto

```
cookkie-real-estate-agent/
├── backend/          # API Next.js (porta 3001)
├── frontend/         # UI Next.js (porta 3000)
├── ai_tools/         # Backend AI Python (porta 8000)
├── scraping/         # Web scraping modules
├── database/         # Database layer (Prisma + SQLite)
├── config/           # Configurazioni centralizzate
├── scripts/          # Script di automazione
├── tests/            # Test suite
├── logs/             # Log files
└── docs/             # Documentazione
```

## Funzionalità Principali

### 1. Dashboard
- Statistiche immobili/clienti
- Feed attività recenti
- Agenda appuntamenti
- Mappa preview

### 2. Gestione Immobili
- CRUD completo
- Upload foto
- Geolocalizzazione
- Valutazione automatica

### 3. Gestione Clienti
- Contatti unificati
- Richieste di ricerca
- Privacy GDPR
- Timeline attività

### 4. AI Assistant
- Chat intelligente con database
- Ricerca semantica
- Statistiche automatiche
- Linguaggio naturale (italiano)

### 5. Matching AI
- Matching automatico property-request
- Score multi-dimensionale (0-100)
- Reasoning dettagliato
- Notifiche automatiche

### 6. Web Scraping
- Immobiliare.it
- Casa.it
- Idealista.it
- Scheduling automatico

## Primi Passi

### 1. Popola Database

Il database è già popolato con dati di esempio dopo `install.sh`.

Per ri-popolare:

```bash
./scripts/seed-db.sh
```

### 2. Esplora l'interfaccia

- **Homepage**: Dashboard completa
- **Search Bar**: Prova l'AI assistant
- **Menu Laterale**: Naviga tra sezioni
- **Command Palette**: Premi `Cmd/Ctrl + K`

### 3. Testa l'AI

Esempi di query nella search bar:

```
"Mostrami appartamenti a Corbetta sotto 200k"
"Quali clienti cercano casa con budget 150-250k?"
"Dammi statistiche immobili in vendita"
"Chi sono i clienti VIP?"
```

### 4. Usa le API

#### API Backend (REST)

```bash
# Get all properties
curl http://localhost:3001/api/properties

# Get single property
curl http://localhost:3001/api/properties/{id}

# Search
curl "http://localhost:3001/api/properties?city=Milano&minPrice=100000"
```

#### AI Tools API

```bash
# Chat con AI
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Mostrami immobili a Milano"}'

# Matching
curl -X POST http://localhost:8000/ai/matching/run \
  -H "Content-Type: application/json" \
  -d '{"request_id": "req_123"}'
```

## Comandi Utili

### Sviluppo

```bash
# Start development mode
./scripts/start.sh

# Run tests
./scripts/test-all.sh

# View logs
tail -f logs/backend/app.log
tail -f logs/ai_tools/ai.log

# Database GUI
cd database/prisma
npx prisma studio
```

### Build Production

```bash
# Build all modules
./scripts/build-all.sh

# Build Docker images
./scripts/build-all.sh --docker
```

### Pulizia

```bash
# Clean build artifacts
./scripts/clean.sh

# Deep clean (including .env)
./scripts/clean.sh --deep
```

## Keyboard Shortcuts

- `Cmd/Ctrl + K` - Command Palette
- `s` - Focus Search
- `g` - Go to Agenda
- `a` - Go to Actions
- `m` - Go to Map

## Configurazione

### Environment Variables

Modifica `config/.env`:

```bash
# Google AI (REQUIRED)
GOOGLE_API_KEY=your_key_here

# Database
DATABASE_URL=file:../database/prisma/dev.db

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=3001
AI_TOOLS_PORT=8000

# Qdrant (opzionale)
QDRANT_MODE=memory  # o 'server'
```

### Settings YAML

Configura moduli specifici in `config/settings.*.yml`

## Troubleshooting

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
# Stop all services
./scripts/stop.sh

# Restart
./scripts/start.sh
```

### AI non risponde

1. Verifica `GOOGLE_API_KEY` in `config/.env`
2. Check logs: `logs/ai_tools/ai.log`
3. Test diretto: http://localhost:8000/health

### Dipendenze mancanti

```bash
# Re-run install
./scripts/install.sh --force
```

## Next Steps

1. **Leggi la documentazione completa**: `docs/`
2. **Esplora l'API**: http://localhost:8000/docs
3. **Contribuisci**: Vedi `CONTRIBUTING.md`
4. **Deploy**: Vedi `docs/DEPLOYMENT.md`

## Risorse

- **Documentazione Completa**: `docs/`
- **API Reference**: http://localhost:8000/docs
- **Database Schema**: `database/prisma/schema.prisma`
- **Architecture**: `docs/ARCHITECTURE.md`

## Supporto

- GitHub Issues: https://github.com/your-username/cookkie-real-estate-agent/issues
- Documentazione: `docs/`
- Email: your-email@example.com

---

**Pronto per iniziare? Esegui `./scripts/install.sh` e poi `./scripts/start.sh`!**
