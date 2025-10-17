# 🔄 Migration Guide - Riorganizzazione Repository

## Overview

Questa guida documenta la migrazione dalla struttura precedente (monolitica) alla nuova struttura modulare.

## Cosa è Cambiato

### Prima (Struttura Vecchia)

```
cookkie-real-estate-agent/
├── src/                    # Frontend + Backend mescolati
│   ├── app/
│   │   ├── page.tsx        # Homepage
│   │   └── api/            # API routes
│   ├── components/
│   ├── hooks/
│   └── lib/
├── python_ai/              # AI tools
├── prisma/                 # Database
├── public/
└── package.json
```

### Dopo (Nuova Struttura)

```
cookkie-real-estate-agent/
├── frontend/               # UI separata
├── backend/                # API separata
├── ai_tools/               # AI tools (rinominato)
├── scraping/               # Nuovo modulo
├── database/               # Database centralizzato
├── config/                 # Config centralizzata
├── scripts/                # Automazione
├── tests/                  # Test unificati
├── logs/                   # Log centralizzati
└── docs/                   # Documentazione
```

## Migration Status

⚠️ **IMPORTANTE**: La riorganizzazione è stata iniziata ma **NON COMPLETATA**.

**Stato Attuale:**
- ✅ Struttura directory creata
- ✅ Documentazione completa scritta
- ✅ Script di automazione creati
- ❌ File NON ancora spostati nelle nuove posizioni
- ❌ Import paths NON ancora aggiornati
- ❌ Testing NON ancora verificato

## Come Completare la Migrazione

### Opzione 1: Migrazione Graduale (Raccomandato)

Mantieni la vecchia struttura funzionante mentre costruisci la nuova:

1. **Lavora sulla nuova struttura in parallelo**
2. **Testa ogni modulo separatamente**
3. **Quando tutto funziona, sostituisci la vecchia**

### Opzione 2: Migrazione Immediata

⚠️ **Rischioso**: Sistema non funzionante durante migrazione

1. Backup completo repository
2. Sposta tutti i file
3. Aggiorna import paths
4. Testa tutto
5. Fix errori

## TODO per Completare Migrazione

### 1. Frontend Separation

**Azioni:**
```bash
# Crea struttura frontend
mkdir -p frontend/src

# Sposta file UI (NO api/)
cp -r src/app/* frontend/src/app/ (escludi api/)
cp -r src/components frontend/src/
cp -r src/hooks frontend/src/
cp -r src/types frontend/src/
cp src/app/layout.tsx frontend/src/app/
cp src/app/page.tsx frontend/src/app/
cp src/app/globals.css frontend/src/app/

# Config
cp package.json frontend/ (e pulisci deps backend)
cp tsconfig.json frontend/
cp tailwind.config.ts frontend/
cp next.config.js frontend/
```

**Fix imports:**
- Cambia `@/lib/db` → API calls a `http://localhost:3001/api`
- Rimuovi dipendenze Prisma da frontend

### 2. Backend Separation

**Azioni:**
```bash
# Crea struttura backend
mkdir -p backend/src/app

# Sposta API routes
cp -r src/app/api backend/src/app/

# Sposta database utilities
cp -r src/lib/db backend/src/lib/
cp -r src/lib/validation backend/src/lib/

# Config
cp package.json backend/ (solo deps backend)
cp tsconfig.json backend/
```

**Fix imports:**
- API routes restano uguali
- Database access via Prisma resta uguale

### 3. Database Migration

**Azioni:**
```bash
# Sposta Prisma
cp -r prisma database/

# Copia Python models
cp python_ai/app/models.py database/python/
```

**Fix paths:**
- Aggiorna `DATABASE_URL` in tutti i moduli
- Backend: `../database/prisma/dev.db`
- AI Tools: `../database/prisma/dev.db`

### 4. AI Tools Migration

**Azioni:**
```bash
# Rinomina directory
mv python_ai ai_tools (già fatto in teoria)

# Verifica struttura
ls -la ai_tools/
```

**Fix paths:**
- Aggiorna import per database
- Aggiorna .env path

### 5. Config Centralization

**Azioni:**
```bash
# Sposta .env
mv .env config/.env (crea symlink alla root se serve)
mv .env.example config/.env.example

# Sposta docker-compose
cp docker/docker-compose.yml config/
```

### 6. Update Import Paths

**Frontend:**
```typescript
// Prima
import { prisma } from '@/lib/db'

// Dopo
const response = await fetch('http://localhost:3001/api/properties')
const data = await response.json()
```

**Backend:**
```typescript
// Prima
import { prisma } from '@/lib/db'

// Dopo
import { prisma } from '@/lib/db'  // Uguale, ma path assoluto cambia
```

**AI Tools:**
```python
# Prima
from app.database import get_db

# Dopo
import sys
sys.path.append('../database/python')
from models import Property
```

## Testing Post-Migration

### 1. Test Backend

```bash
cd backend
npm install
npm run dev  # Porta 3001

# Test
curl http://localhost:3001/api/health
```

### 2. Test Frontend

```bash
cd frontend
npm install
npm run dev  # Porta 3000

# Verifica in browser
open http://localhost:3000
```

### 3. Test AI Tools

```bash
cd ai_tools
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py  # Porta 8000

# Test
curl http://localhost:8000/health
```

### 4. Test Integration

```bash
# Con tutti i servizi running
./scripts/start.sh

# Test end-to-end
# 1. Apri http://localhost:3000
# 2. Usa search bar AI
# 3. Verifica risposta
```

## Rollback Plan

Se qualcosa va male:

```bash
# Backup prima di migrare
tar -czf backup-pre-migration.tar.gz .

# Rollback
rm -rf frontend backend ai_tools database config scripts
tar -xzf backup-pre-migration.tar.gz
```

## Breaking Changes

### Per Sviluppatori

1. **Import paths cambiati** - Aggiorna tutti gli import
2. **Porte cambiate** - Frontend 3000, Backend 3001, AI 8000
3. **Database path** - Ora in `database/prisma/dev.db`
4. **Config location** - Ora in `config/.env`
5. **Scripts location** - Ora in `scripts/`

### Per Deployment

1. **Dockerfile** - Uno per modulo, non più monolitico
2. **docker-compose** - Nuova struttura in `config/`
3. **Environment variables** - Centralizzate in `config/.env`

## Supporto

Se hai problemi durante la migrazione:

1. **Verifica backup** - Hai fatto backup?
2. **Leggi errori** - Controlla log in `logs/`
3. **Check documentation** - Vedi `docs/`
4. **GitHub Issues** - Apri issue se necessario

## Next Steps

Dopo la migrazione:

1. ✅ Aggiorna CI/CD pipeline
2. ✅ Aggiorna deployment scripts
3. ✅ Aggiorna documentazione team
4. ✅ Testa in staging
5. ✅ Deploy in production

---

**Last Updated**: 2025-01-17
**Status**: ⚠️ Migration IN PROGRESS (not complete)
