# ✈️ Railway Deployment - Pre-Flight Checklist

**Verifica questi punti PRIMA di deployare su Railway**

Data ultimo aggiornamento: 2025-11-06
Versione: 1.0.0

---

## 📋 Requisiti Preliminari

### 1. Account e Accessi

- [ ] **Account Railway creato** (https://railway.app)
- [ ] **Repository GitHub pubblico o privato**
- [ ] **Railway connesso a GitHub** (Settings → GitHub)
- [ ] **Google API Key disponibile** (https://aistudio.google.com/app/apikey)

### 2. Credenziali e API Keys

- [ ] **Google AI Studio API Key** ottenuta e testata
- [ ] API Key con limiti sufficienti (>1000 requests/day)
- [ ] API Key con modelli abilitati: `gemini-1.5-pro`, `text-embedding-004`

---

## 🏗️ Verifica Repository

### 1. File di Configurazione Deployment

Verifica che questi file esistano nella root del repository:

```bash
# Railway configuration
✅ railway.json            # Configurazione Railway
✅ nixpacks.toml          # Build configuration alternativa
✅ .env.railway.example   # Template environment variables

# Docker
✅ docker-compose.yml     # Docker Compose per test locali
✅ frontend/Dockerfile    # Dockerfile app unificata
✅ ai_tools/Dockerfile    # Dockerfile AI tools

# Database
✅ database/prisma/schema.prisma  # Schema PostgreSQL
```

**Comando di verifica**:
```bash
ls -la railway.json nixpacks.toml .env.railway.example docker-compose.yml
ls -la frontend/Dockerfile ai_tools/Dockerfile
ls -la database/prisma/schema.prisma
```

### 2. Verifica Schema Database

- [ ] **Database è PostgreSQL** (non SQLite)
- [ ] Schema prisma ha `provider = "postgresql"`
- [ ] Tutti i modelli sono definiti correttamente

**Verifica**:
```bash
grep 'provider = "postgresql"' database/prisma/schema.prisma
```

Deve restituire:
```
provider = "postgresql"
```

### 3. Verifica Dockerfile Frontend

- [ ] **output: 'standalone'** configurato in `next.config.js`
- [ ] Dockerfile usa multi-stage build
- [ ] Health check configurato su `/api/health`

**Verifica**:
```bash
grep "output: 'standalone'" frontend/next.config.js
grep "HEALTHCHECK" frontend/Dockerfile
```

### 4. Verifica Dockerfile AI Tools

- [ ] Dockerfile copia database/python models
- [ ] Health check configurato su `/health`
- [ ] Requirements.txt include tutte le dipendenze

**Verifica**:
```bash
grep "HEALTHCHECK" ai_tools/Dockerfile
grep "database/python" ai_tools/Dockerfile
```

---

## 🧪 Test Locali

### 1. Test Build Docker

**Test Frontend Build**:
```bash
docker build -f frontend/Dockerfile -t crm-app-test .
```

✅ **Build deve completare senza errori**

**Test AI Tools Build**:
```bash
docker build -f ai_tools/Dockerfile -t crm-ai-test .
```

✅ **Build deve completare senza errori**

### 2. Test Docker Compose Completo

```bash
# Pulisci eventuali container precedenti
docker-compose down -v

# Avvia stack completo
docker-compose up -d

# Verifica che tutti i servizi siano UP
docker-compose ps
```

✅ **Tutti i 3 servizi devono essere "Up"**:
- crm-database
- crm-app
- crm-ai-tools

### 3. Test Health Endpoints

```bash
# Test app health
curl http://localhost:3000/api/health

# Test AI tools health
curl http://localhost:8000/health

# Test database connection
docker exec crm-database pg_isready -U crm_user
```

✅ **Tutti i comandi devono restituire successo**

### 4. Test Prisma Client

```bash
# Genera Prisma Client
cd database/prisma
npx prisma generate

# Push schema al database locale
npx prisma db push

# Verifica connessione
npx prisma studio
```

✅ **Prisma Studio deve aprirsi senza errori**

---

## 🔑 Environment Variables

### 1. Variabili Richieste per Railway

**App (crm-app) - Frontend + Backend**:
```bash
DATABASE_URL=${{crm-database.DATABASE_URL}}  # Auto-reference Railway
GOOGLE_API_KEY=<your-google-api-key>
NODE_ENV=production
PORT=3000
SESSION_SECRET=<genera-stringa-casuale-sicura>
```

**AI Tools (crm-ai-tools)**:
```bash
DATABASE_URL=${{crm-database.DATABASE_URL}}  # Auto-reference Railway
GOOGLE_API_KEY=<your-google-api-key>
PORT=8000
```

### 2. Genera SESSION_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

✅ **Salva il SESSION_SECRET generato** (lo userai su Railway)

---

## 📦 Verifica Dipendenze

### 1. Node.js Dependencies

```bash
# Root
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend (se separato)
# cd backend && npm install && cd ..
```

✅ **Nessun errore di installazione**

### 2. Python Dependencies

```bash
# AI Tools
cd ai_tools
pip install -r requirements.txt
cd ..

# Scraping
cd scraping
pip install -r requirements.txt
cd ..
```

✅ **Nessun errore di installazione**

### 3. Prisma

```bash
cd database/prisma
npx prisma generate
cd ../..
```

✅ **Prisma Client generato correttamente**

---

## 🚦 Checklist Pre-Deploy Finale

Prima di procedere con il deploy su Railway, verifica:

### Repository

- [ ] Tutti i file sono committati
- [ ] `.gitignore` esclude `.env*` e `node_modules/`
- [ ] Repository pushato su GitHub
- [ ] Branch principale aggiornato (main o master)

### Configurazione

- [ ] `railway.json` presente e corretto
- [ ] `nixpacks.toml` presente e corretto
- [ ] `.env.railway.example` presente
- [ ] Tutti i Dockerfile testati localmente

### Database

- [ ] Schema Prisma usa PostgreSQL
- [ ] Nessun riferimento a SQLite
- [ ] Prisma generate funziona
- [ ] Schema aggiornato con ultime modifiche

### Build & Test

- [ ] `docker build -f frontend/Dockerfile .` funziona
- [ ] `docker build -f ai_tools/Dockerfile .` funziona
- [ ] `docker-compose up` funziona
- [ ] Health endpoints rispondono correttamente
- [ ] Test locali passano

### Credenziali

- [ ] Google API Key disponibile e testata
- [ ] SESSION_SECRET generato (32+ caratteri casuali)
- [ ] Nessuna API key committata nel repository

---

## 🎯 Prossimi Passi

Se tutti i check sono ✅, sei pronto per:

1. **Creare progetto Railway**
2. **Configurare 3 servizi**:
   - PostgreSQL Database
   - App (Frontend + Backend)
   - AI Tools
3. **Configurare environment variables**
4. **Deploy automatico**

Segui la guida completa in: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

---

## 🐛 Troubleshooting Pre-Flight

### Docker build fallisce

```bash
# Pulisci cache Docker
docker system prune -a --volumes

# Riprova build
docker build -f frontend/Dockerfile -t crm-app-test .
```

### Prisma generate fallisce

```bash
# Rimuovi node_modules e reinstalla
rm -rf node_modules
npm install

# Rigenera Prisma Client
cd database/prisma
npx prisma generate
```

### Health check fallisce

```bash
# Verifica che l'app sia avviata
docker-compose ps

# Verifica i logs
docker-compose logs app
docker-compose logs ai-tools

# Riavvia i servizi
docker-compose restart
```

### Database connection fallisce

```bash
# Verifica che PostgreSQL sia avviato
docker-compose ps database

# Controlla i logs del database
docker-compose logs database

# Verifica la connessione
docker exec crm-database psql -U crm_user -d crm_immobiliare -c "SELECT 1;"
```

---

## ✅ Tutto OK?

Se tutti i check sono ✅, procedi con:

```bash
# 1. Push finale su GitHub
git add .
git commit -m "chore: ready for Railway deployment"
git push origin main

# 2. Vai su Railway e inizia il deploy
# Segui la guida: RAILWAY_DEPLOY.md
```

---

**Versione**: 1.0.0
**Ultimo aggiornamento**: 2025-11-06
**Autore**: CRM Immobiliare Team

✨ **Buon deploy!**
