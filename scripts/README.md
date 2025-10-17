# 🚀 Scripts - CRM Immobiliare

## Overview

Scripts di automazione multi-platform per installazione, avvio, test e gestione del sistema CRM Immobiliare.

**One-click setup**: L'intero sistema può essere configurato ed avviato con un solo comando.

## Struttura

```
scripts/
├── 📦 INSTALLAZIONE
│   ├── install.sh           # Setup completo (Linux/Mac)
│   ├── install.bat          # Setup completo (Windows Batch)
│   └── install.ps1          # Setup completo (Windows PowerShell)
│
├── ▶️ AVVIO SERVIZI
│   ├── start-all.sh         # Avvia tutti i servizi (Linux/Mac)
│   ├── start-all.bat        # Avvia tutti i servizi (Windows Batch)
│   ├── start-all.ps1        # Avvia tutti i servizi (Windows PowerShell)
│   ├── start-backend.sh     # Solo backend
│   ├── start-backend.bat    # Solo backend (Windows)
│   ├── start-frontend.sh    # Solo frontend
│   ├── start-frontend.bat   # Solo frontend (Windows)
│   ├── start-ai.sh          # Solo AI tools
│   └── start-ai.bat         # Solo AI tools (Windows)
│
├── ⏹️ STOP SERVIZI
│   ├── stop-all.sh          # Ferma tutti i servizi (Linux/Mac)
│   ├── stop-all.bat         # Ferma tutti i servizi (Windows Batch)
│   └── stop-all.ps1         # Ferma tutti i servizi (Windows PowerShell)
│
├── 🧪 TEST
│   ├── test-all.sh          # Test suite completa (Linux/Mac)
│   ├── test-all.bat         # Test suite completa (Windows)
│   ├── test-unit.sh         # Solo unit tests
│   ├── test-integration.sh  # Solo integration tests (WIP)
│   └── test-e2e.sh          # Solo E2E tests (WIP)
│
├── 🧹 PULIZIA
│   ├── clean.sh             # Pulizia completa (Linux/Mac)
│   └── clean.bat            # Pulizia completa (Windows)
│
└── 📖 DOCUMENTAZIONE
    └── README.md            # Questo file
```

## 🚀 Quick Start

### Linux/Mac

```bash
# 1. Setup completo (prima volta)
chmod +x scripts/*.sh
./scripts/install.sh

# 2. Avvio sistema
./scripts/start-all.sh

# 3. Stop sistema
./scripts/stop-all.sh

# 4. Test (opzionale)
./scripts/test-all.sh

# 5. Pulizia (se necessario)
./scripts/clean.sh
```

### Windows (Batch)

```batch
REM 1. Setup completo (prima volta)
scripts\install.bat

REM 2. Avvio sistema
scripts\start-all.bat

REM 3. Stop sistema
scripts\stop-all.bat

REM 4. Test (opzionale)
scripts\test-all.bat

REM 5. Pulizia (se necessario)
scripts\clean.bat
```

### Windows (PowerShell)

```powershell
# 1. Setup completo (prima volta)
.\scripts\install.ps1

# 2. Avvio sistema
.\scripts\start-all.ps1

# 3. Stop sistema
.\scripts\stop-all.ps1
```

---

## 📦 Script di Installazione

### `install.sh` / `install.bat` / `install.ps1`

**Purpose**: Setup completo automatico del sistema (one-click installation)

#### Prerequisiti Verificati:
- ✅ **Node.js 18+** (richiesto)
- ✅ **npm** (richiesto)
- ⚠️ **Python 3.9+** (opzionale, necessario per AI Tools)

#### Azioni Eseguite:
1. **Verifica prerequisiti** (Node.js, npm, Python)
2. **Crea struttura directory** (`logs/`, `database/`, `config/`)
3. **Installa dipendenze Backend** (`npm install` in `/backend`)
4. **Installa dipendenze Frontend** (`npm install` in `/frontend`)
5. **Installa dipendenze AI Tools** (`pip install` in `/ai_tools`, se Python disponibile)
6. **Installa dipendenze Scraping** (`pip install` in `/scraping`, se Python disponibile)
7. **Setup database Prisma** (`prisma generate` + `prisma db push`)
8. **Seed database** (opzionale, chiede conferma interattiva)
9. **Crea file `.env`** da template (se non esistono in `/config`)

#### Usage:

```bash
# Linux/Mac
./scripts/install.sh

# Windows Batch
scripts\install.bat

# Windows PowerShell
.\scripts\install.ps1
```

#### Output di Esempio:

```
==========================================
CRM Immobiliare - Installazione
==========================================

▶ Verifica prerequisiti...
✓ Prerequisiti OK: Node v18.17.0, npm 9.6.7, Python 3.11.4

▶ Creazione directory strutturali...
✓ Directory create

▶ Installazione dipendenze Backend...
✓ Dipendenze Backend installate

▶ Installazione dipendenze Frontend...
✓ Dipendenze Frontend installate

▶ Setup AI Tools (Python)...
✓ Dipendenze AI Tools installate

▶ Setup Scraping Tools (Python)...
✓ Dipendenze Scraping installate

▶ Setup Database (Prisma)...
✓ Database inizializzato

Vuoi popolare il database con dati di esempio? (s/n) s
✓ Database popolato con dati di esempio

▶ Verifica configurazione ambiente...
✓ Creato config/.env.backend da template
✓ Creato config/.env.frontend da template
✓ Creato config/.env.ai da template

✓ Installazione completata!

==========================================
Prossimi passi:
==========================================
1. Configura i file .env in /config
2. Avvia l'applicazione: ./scripts/start-all.sh
3. Accedi a:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - AI Tools: http://localhost:8000

Per documentazione completa: cat docs/GETTING_STARTED.md
==========================================
```

---

## ▶️ Script di Avvio

### `start-all.sh` / `start-all.bat` / `start-all.ps1`

**Purpose**: Avvia tutti i servizi del sistema in parallelo

#### Servizi Avviati:
- **Backend API** (porta 3001) - Next.js API
- **Frontend UI** (porta 3000) - Next.js App
- **AI Tools** (porta 8000) - Python FastAPI (se disponibile)

#### Funzionalità:
- Avvio in parallelo di tutti i servizi
- Log aggregati in `/logs`
- Verifica automatica prerequisiti
- Salvataggio PID per stop successivo (Linux/Mac)

#### Usage:

```bash
# Linux/Mac
./scripts/start-all.sh

# Windows Batch (apre finestre separate per ogni servizio)
scripts\start-all.bat

# Windows PowerShell (apre finestre separate per ogni servizio)
.\scripts\start-all.ps1
```

#### Output:

```
==========================================
CRM Immobiliare - Avvio Applicazione
==========================================

▶ Avvio Backend (porta 3001)...
Backend PID: 12345

▶ Avvio Frontend (porta 3000)...
Frontend PID: 12346

▶ Avvio AI Tools (porta 8000)...
AI Tools PID: 12347

==========================================
Applicazione avviata!
==========================================

Servizi attivi:
  - Frontend:  http://localhost:3000
  - Backend:   http://localhost:3001
  - AI Tools:  http://localhost:8000

Log files:
  - Backend:   logs/backend/app.log
  - Frontend:  logs/frontend/app.log
  - AI Tools:  logs/ai_tools/app.log

Per fermare l'applicazione: ./scripts/stop-all.sh
==========================================
```

### Script di Avvio Individuali

Per avviare solo un servizio specifico:

```bash
# Solo Backend
./scripts/start-backend.sh    # Linux/Mac
scripts\start-backend.bat     # Windows

# Solo Frontend
./scripts/start-frontend.sh   # Linux/Mac
scripts\start-frontend.bat    # Windows

# Solo AI Tools
./scripts/start-ai.sh         # Linux/Mac
scripts\start-ai.bat          # Windows
```

---

## ⏹️ Script di Stop

### `stop-all.sh` / `stop-all.bat` / `stop-all.ps1`

**Purpose**: Ferma tutti i servizi in esecuzione

#### Funzionalità:
- **Linux/Mac**: Legge i PID salvati da `start-all.sh` e termina i processi
- **Windows**: Identifica processi sulle porte 3000, 3001, 8000 e li termina
- Fallback: kill by port se `.pids` non trovato

#### Usage:

```bash
# Linux/Mac
./scripts/stop-all.sh

# Windows Batch
scripts\stop-all.bat

# Windows PowerShell
.\scripts\stop-all.ps1
```

#### Output:

```
==========================================
CRM Immobiliare - Stop Servizi
==========================================

▶ Stopping Backend (PID: 12345)...
▶ Stopping Frontend (PID: 12346)...
▶ Stopping AI Tools (PID: 12347)...

==========================================
✓ Tutti i servizi sono stati fermati
==========================================
```

---

## 🧪 Script di Test

### `test-all.sh` / `test-all.bat`

**Purpose**: Esegue l'intera test suite del progetto

#### Test Eseguiti:
1. **Backend Unit Tests** (npm test in `/backend`)
2. **Frontend Unit Tests** (npm test in `/frontend`)
3. **AI Tools Tests** (pytest in `/ai_tools/tests`, se esistono)
4. **Scraping Tests** (pytest in `/scraping/tests`, se esistono)

#### Usage:

```bash
# Linux/Mac
./scripts/test-all.sh

# Windows Batch
scripts\test-all.bat
```

#### Output:

```
==========================================
CRM Immobiliare - Test Suite
==========================================

========== Backend Tests ==========
▶ Running: Backend Unit Tests
✓ Backend Unit Tests: PASSED

========== Frontend Tests ==========
▶ Running: Frontend Unit Tests
✓ Frontend Unit Tests: PASSED

========== AI Tools Tests ==========
⚠ No AI tools tests found

========== Scraping Tests ==========
⚠ No scraping tests found

==========================================
✓ All tests passed!
==========================================
```

### Script di Test Specifici

```bash
# Solo unit tests
./scripts/test-unit.sh

# Integration tests (WIP - placeholder)
./scripts/test-integration.sh

# E2E tests (WIP - placeholder)
./scripts/test-e2e.sh
```

---

## 🧹 Script di Pulizia

### `clean.sh` / `clean.bat`

**Purpose**: Rimuove build artifacts, cache e dipendenze per un reset completo

#### Elementi Rimossi:
- ❌ `node_modules/` (Backend & Frontend)
- ❌ `.next/`, `dist/`, `build/` (Build artifacts)
- ❌ `__pycache__/`, `.pytest_cache/` (Cache Python)
- ❌ `.venv/` (Virtual environments Python)
- ❌ `logs/*` (Log files)
- ⚠️ `database/prisma/dev.db` (Database - opzionale, chiede conferma)

#### Usage:

```bash
# Linux/Mac
./scripts/clean.sh

# Windows Batch
scripts\clean.bat
```

#### Output:

```
==========================================
CRM Immobiliare - Cleanup
==========================================

⚠ ATTENZIONE: Questo script rimuoverà:
  - node_modules (Backend & Frontend)
  - Build artifacts (.next, dist, build)
  - Python cache (__pycache__, .pytest_cache)
  - Log files
  - Database (dev.db) [OPZIONALE]

Continuare? (s/n) s

▶ Rimozione node_modules...
✓ node_modules rimossi

▶ Rimozione build artifacts...
✓ Build artifacts rimossi

▶ Rimozione cache Python...
✓ Cache Python rimossa

▶ Rimozione log files...
✓ Log files rimossi

Rimuovere anche il database (dev.db)? (s/n) n
Database preservato

==========================================
✓ Cleanup completato!
==========================================

Per reinstallare: ./scripts/install.sh
```

---

## 📊 Logging

Tutti gli script loggano le proprie attività in directory separate:

```
logs/
├── backend/
│   └── app.log          # Log runtime backend
├── frontend/
│   └── app.log          # Log runtime frontend
├── ai_tools/
│   └── app.log          # Log runtime AI tools
└── scraping/
    └── scraper.log      # Log scraping tasks
```

#### Visualizzare i log:

```bash
# Log in tempo reale (Linux/Mac)
tail -f logs/backend/app.log

# Log completo
cat logs/backend/app.log

# Tutti i log in tempo reale
tail -f logs/*/app.log
```

---

## 🔧 Troubleshooting

### "Permission denied" (Linux/Mac)

```bash
chmod +x scripts/*.sh
```

### "Port already in use"

```bash
# Stop tutti i servizi
./scripts/stop-all.sh

# Oppure kill manualmente (Linux/Mac)
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Command not found: node"

Installa Node.js 18+ da https://nodejs.org

### "Python not found"

Gli AI Tools richiedono Python 3.9+. Scarica da https://python.org oppure salta l'installazione AI Tools.

### Database non inizializzato

```bash
cd backend
npx prisma generate --schema=../database/prisma/schema.prisma
npx prisma db push --schema=../database/prisma/schema.prisma
```

---

## 🎯 Best Practices

1. **Esegui sempre dalla root del progetto**
   ```bash
   # ✅ CORRETTO
   ./scripts/install.sh

   # ❌ ERRATO
   cd scripts && ./install.sh
   ```

2. **Verifica i log in caso di errori**
   ```bash
   tail -f logs/backend/app.log
   ```

3. **Pulizia prima di reinstallare**
   ```bash
   ./scripts/clean.sh
   ./scripts/install.sh
   ```

4. **Ferma i servizi prima di cleanup**
   ```bash
   ./scripts/stop-all.sh
   ./scripts/clean.sh
   ```

---

## 📚 Risorse

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)
- [PowerShell Documentation](https://docs.microsoft.com/powershell/)

---

## 📝 Note Importanti

- **Multi-platform**: Tutti gli script hanno versioni Linux/Mac (.sh), Windows Batch (.bat) e Windows PowerShell (.ps1)
- **Prerequisiti**: Node.js 18+ è **richiesto**. Python 3.9+ è **opzionale** (solo per AI Tools)
- **Database**: SQLite locale in `database/prisma/dev.db` (git-ignored)
- **Porte**: Frontend (3000), Backend (3001), AI Tools (8000) - assicurati siano libere
- **Logs**: Tutti i log sono salvati in `/logs` (git-ignored)

---

**Ultima modifica**: Fase 4 - Scripts di Automazione Completi
