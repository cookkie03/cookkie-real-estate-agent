# ⚙️ Configuration Center - CRM Immobiliare

**Centralizzazione completa delle configurazioni del progetto**

---

## 📁 Struttura Directory

```
config/
├── .env.global.example      # Template globale (tutte le variabili)
├── backend.env.example       # Template specifico backend
├── frontend.env.example      # Template specifico frontend
├── ai_tools.env.example      # Template specifico AI tools
├── scraping.env.example      # Template specifico scraping
├── docker-compose.yml        # Orchestrazione Docker
└── README.md                 # Questa documentazione
```

---

## 🚀 Quick Start

### 1. Setup Iniziale

```bash
# Dalla root del progetto

# Backend
cp config/backend.env.example backend/.env

# Frontend
cp config/frontend.env.example frontend/.env.local

# AI Tools
cp config/ai_tools.env.example ai_tools/.env

# Scraping (opzionale)
cp config/scraping.env.example scraping/.env
```

### 2. Compila le Variabili

Modifica i file `.env` appena creati e inserisci i tuoi valori:

**IMPORTANTE**: Devi avere almeno:
- `GOOGLE_API_KEY` per le funzionalità AI

---

## 🔑 Variabili Essenziali

### Database (Shared)
```bash
# Backend/Frontend (Prisma)
DATABASE_URL="file:../database/prisma/dev.db"

# AI Tools/Scraping (SQLAlchemy)
DATABASE_URL="sqlite:///../database/prisma/dev.db"
```

### Ports Standardizzati
```bash
Frontend UI:     3000
Backend API:     3001
AI Tools:        8000
```

### Google AI (Required)
```bash
GOOGLE_API_KEY="your_key_here"
```
Ottieni la chiave su: https://aistudio.google.com/app/apikey

---

## 📦 Configurazione per Modulo

### Backend API (Port 3001)

**File**: `backend/.env`
**Template**: `config/backend.env.example`

```bash
DATABASE_URL="file:../database/prisma/dev.db"
PORT=3001
NODE_ENV=development
PYTHON_AI_URL="http://localhost:8000"
GOOGLE_API_KEY=""  # Optional
```

**Avvio**:
```bash
cd backend
npm run dev  # Porta 3001
```

---

### Frontend UI (Port 3000)

**File**: `frontend/.env.local`
**Template**: `config/frontend.env.example`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_API_KEY=""  # Optional
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

**Avvio**:
```bash
cd frontend
npm run dev  # Porta 3000
```

---

### AI Tools (Port 8000)

**File**: `ai_tools/.env`
**Template**: `config/ai_tools.env.example`

```bash
DATABASE_URL=sqlite:///../database/prisma/dev.db
GOOGLE_API_KEY=your_key_here  # REQUIRED
GOOGLE_MODEL=gemini-1.5-pro
QDRANT_MODE=memory
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Avvio**:
```bash
cd ai_tools
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
python main.py  # Porta 8000
```

---

### Scraping Module (Optional)

**File**: `scraping/.env`
**Template**: `config/scraping.env.example`

```bash
DATABASE_URL=sqlite:///../database/prisma/dev.db
RATE_LIMIT_RPS=1.0
CACHE_TTL=86400
LOG_LEVEL=INFO
```

**Avvio**:
```bash
cd scraping
python cli.py scrape --portal all --city Milano
```

---

## 🐳 Docker Setup

### Avvio con Docker Compose

```bash
# Dalla root del progetto
docker-compose -f config/docker-compose.yml up
```

Questo avvierà automaticamente:
- Frontend (porta 3000)
- Backend (porta 3001)
- AI Tools (porta 8000)
- Database SQLite condiviso

---

## 🔒 Sicurezza

### File da NON committare

```
.env
.env.local
.env.development
.env.production
backend/.env
frontend/.env.local
ai_tools/.env
scraping/.env
```

### File da committare

```
config/*.env.example      # Template pubblici
.env.example              # Template root (legacy)
```

### Verifica Git

```bash
# Verifica che .env non siano tracciati
git status

# Dovrebbe mostrare solo .env.example
```

---

## 📚 Variabili per Categoria

### Database
| Variabile | Moduli | Valore |
|-----------|--------|--------|
| `DATABASE_URL` | Backend, Frontend | `file:../database/prisma/dev.db` |
| `DATABASE_URL` | AI Tools, Scraping | `sqlite:///../database/prisma/dev.db` |

### API Keys
| Variabile | Moduli | Descrizione |
|-----------|--------|-------------|
| `GOOGLE_API_KEY` | AI Tools, (Frontend opt.) | Google Gemini API key |
| `NEXT_PUBLIC_MAPBOX_API_KEY` | Frontend (opt.) | Mapbox maps API key |

### Server Ports
| Variabile | Modulo | Porta |
|-----------|--------|-------|
| `PORT` | Backend | 3001 |
| (hardcoded) | Frontend | 3000 |
| `PORT` | AI Tools | 8000 |

### URLs
| Variabile | Modulo | Valore |
|-----------|--------|--------|
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:3001` |
| `NEXT_PUBLIC_AI_URL` | Frontend | `http://localhost:8000` |
| `PYTHON_AI_URL` | Backend | `http://localhost:8000` |

### Logging
| Variabile | Moduli | Valori |
|-----------|--------|--------|
| `LOG_LEVEL` | AI Tools, Scraping | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `LOG_FORMAT` | AI Tools | `console`, `json` |

### Cache
| Variabile | Moduli | Default |
|-----------|--------|---------|
| `CACHE_DIR` | AI Tools, Scraping | `.cache` |
| `CACHE_TTL` | AI Tools | `3600` (1 hour) |
| `CACHE_TTL` | Scraping | `86400` (24 hours) |

---

## 🛠️ Troubleshooting

### "DATABASE_URL not found"
```bash
# Verifica che .env esista nel modulo
ls backend/.env
ls frontend/.env.local
ls ai_tools/.env

# Se mancano, copiali dai template
cp config/backend.env.example backend/.env
```

### "GOOGLE_API_KEY invalid"
```bash
# Verifica la chiave in ai_tools/.env
cat ai_tools/.env | grep GOOGLE_API_KEY

# Ottieni nuova chiave su:
# https://aistudio.google.com/app/apikey
```

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### "Module not found" (Python)
```bash
cd ai_tools
pip install -r requirements.txt
```

---

## 📖 Best Practices

### 1. **Mai committare .env**
I file `.env` contengono segreti e devono essere git-ignored.

### 2. **Usa .env.example come riferimento**
Quando aggiungi nuove variabili, aggiornale in `config/*.env.example`

### 3. **Variabili NEXT_PUBLIC_***
Solo variabili con prefisso `NEXT_PUBLIC_` sono accessibili nel browser.

### 4. **Database Condiviso**
Tutti i moduli puntano allo stesso database in `database/prisma/dev.db`

### 5. **Ports Standardizzati**
Non cambiare le porte default a meno che non sia necessario.

---

## 🔄 Migrazione da Vecchia Struttura

Se hai file `.env` nella root del progetto:

```bash
# Backup vecchi .env
cp .env .env.backup
cp .env.local .env.local.backup

# Usa nuovi template
cp config/backend.env.example backend/.env
cp config/frontend.env.example frontend/.env.local
cp config/ai_tools.env.example ai_tools/.env

# Copia i valori dai backup ai nuovi file
# Poi rimuovi i vecchi dalla root
```

---

## 📞 Support

Per problemi con le configurazioni:
1. Verifica che tutti i `.env` esistano
2. Controlla i valori con i template `.env.example`
3. Consulta la documentazione dei singoli moduli

---

**Ultima modifica**: 2025-10-17
**Versione**: 2.0.0
