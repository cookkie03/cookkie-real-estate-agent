# 🚀 Railway Deploy - Quick Start (5 minuti)

**Deploy completo in 3 step**

**⚠️ IMPORTANTE**: Usa il branch `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4-011CUriJTow48FK1nJ1gpSjC`

---

## ⚡ STEP 1: Setup Railway (2 min)

### 1.1 Crea Account Railway

1. Vai su https://railway.app
2. Sign up con GitHub
3. Conferma email
4. Connetti il tuo repository GitHub

### 1.2 Crea Nuovo Progetto

1. Dashboard Railway → **"New Project"**
2. Seleziona **"Empty Project"** (NON "Deploy from GitHub" ancora)
3. Dai un nome al progetto (es: "crm-immobiliare")

**IMPORTANTE**: Prima crea il progetto vuoto, poi aggiungi i servizi!

---

## 📦 STEP 2: Configura 3 Servizi (2 min)

Crea i servizi **in questo ordine** (importante!):

### 2.1 Database (PostgreSQL) - Servizio 1/3

```
1. Nel progetto → "+ New"
2. Seleziona "Database" → "PostgreSQL"
3. Nome: "crm-database"
4. Lascia tutto di default
5. Deploy automatico ✅
```

**Nessuna configurazione richiesta!** Railway genera automaticamente `DATABASE_URL`.

⏳ **Aspetta che il database sia "Active"** (pallino verde) prima di procedere!

---

### 2.2 App (Frontend Unificato) - Servizio 2/3

**⚠️ NOTA IMPORTANTE**: Questo servizio contiene **TUTTO** (UI + API). NON serve un backend separato!

```
1. "+ New" → "GitHub Repo"
2. Seleziona il repo: cookkie-real-estate-agent
3. Branch: claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4-011CUriJTow48FK1nJ1gpSjC
4. Service Name: "crm-app"
5. Root Directory: . (lascia vuoto)
6. Railway rileverà automaticamente railway.json
7. Clicca "Deploy"
```

**Configurazione Automatica**:
- Railway userà `railway.json` che specifica `frontend/Dockerfile`
- Questo Dockerfile contiene l'app unificata (UI + API)

**Environment Variables** (Settings → Variables → Raw Editor):

```env
DATABASE_URL=${{crm-database.DATABASE_URL}}
GOOGLE_API_KEY=your-google-api-key-here
NODE_ENV=production
PORT=3000
SESSION_SECRET=generate-with-openssl-rand-base64-32
```

**Genera SESSION_SECRET**:
```bash
openssl rand -base64 32
```

**Settings → Deploy** (verifica/configura):
- ✅ Builder: DOCKERFILE
- ✅ Dockerfile Path: frontend/Dockerfile
- ✅ Watch Paths: frontend/** database/**

**Settings → Networking**:
- ✅ Health Check Path: `/api/health`
- ✅ Health Check Timeout: 100 seconds
- ✅ Port: 3000
- ✅ **Generate Domain** (per URL pubblico)

---

### 2.3 AI Tools (Python FastAPI) - Servizio 3/3

```
1. "+ New" → "GitHub Repo"
2. Seleziona il repo: cookkie-real-estate-agent
3. Branch: claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4-011CUriJTow48FK1nJ1gpSjC
4. Service Name: "crm-ai-tools"
5. Root Directory: . (lascia vuoto)
6. Dockerfile Path: ai_tools/Dockerfile
7. Clicca "Deploy"
```

**Environment Variables** (Settings → Variables → Raw Editor):

```env
DATABASE_URL=${{crm-database.DATABASE_URL}}
GOOGLE_API_KEY=your-google-api-key-here
PORT=8000
```

**Settings → Deploy**:
- ✅ Dockerfile Path: ai_tools/Dockerfile
- ✅ Watch Paths: ai_tools/** database/**

**Settings → Networking**:
- ✅ Health Check Path: `/health`
- ✅ Port: 8000

---

## 📊 Riepilogo Architettura (3 Servizi)

```
Railway Project
│
├── 1️⃣ crm-database (PostgreSQL)
│   └─ Database managed da Railway
│
├── 2️⃣ crm-app (Next.js Unified - Frontend + API)
│   └─ Usa: frontend/Dockerfile
│      • Contiene: UI + API Routes
│      • NON serve backend/ separato!
│
└── 3️⃣ crm-ai-tools (Python FastAPI)
    └─ Usa: ai_tools/Dockerfile
       • AI Features (RAG, Matching, Briefing)
```

**✅ Totale: 3 servizi = Railway Free Tier compatible!**

**❌ NON CREARE**:
- Un servizio `backend` separato (è già incluso in `crm-app`)
- Più di 3 servizi totali

---

## 🎯 STEP 3: Deploy & Test (1 min)

### 3.1 Verifica Deploy

Tutti i 3 servizi devono mostrare **"Active"** (●verde):

```
✅ crm-database       (Active)
✅ crm-app            (Active)
✅ crm-ai-tools       (Active)
```

Se vedi errori, clicca sul servizio → "Deployments" → "View Logs".

### 3.2 Ottieni URL Pubblico

1. Clicca su **"crm-app"**
2. Tab **"Settings"**
3. Sezione **"Networking"**
4. Se non c'è ancora, clicca **"Generate Domain"**
5. Salva l'URL: `https://crm-app-xxxx.up.railway.app`

### 3.3 Test Deploy

1. Apri l'URL generato nel browser
2. Dovresti vedere l'homepage del CRM
3. Test health check: `https://your-url/api/health`

✅ **Se vedi "OK" o status 200, il deploy è riuscito!**

---

## 🔐 STEP BONUS: Configura API Key dalla UI

1. Apri la tua app Railway
2. Vai su **Impostazioni** (icona ingranaggio)
3. Tab **"API Keys"**
4. Inserisci la tua **Google API Key**
5. Clicca **"Salva"**

✅ **Tutte le funzionalità AI sono ora attive!**

---

## 🎉 Deploy Completato!

Il tuo CRM è ora live su Railway con:

- ✅ Frontend Next.js (UI completa)
- ✅ Backend API (route handlers integrati nel frontend)
- ✅ Database PostgreSQL
- ✅ AI Tools (Gemini + RAG + Matching)
- ✅ SSL/HTTPS automatico
- ✅ Auto-deploy da GitHub

**URL della tua app**: `https://crm-app-xxxx.up.railway.app`

---

## 📊 Prossimi Passi

### Cosa fare ora:

1. **Setup iniziale**:
   - Vai su **Impostazioni** nell'app
   - Configura il tuo profilo agente
   - Inserisci dati agenzia

2. **Carica dati**:
   - Aggiungi primi clienti
   - Aggiungi prime proprietà
   - Crea prime richieste

3. **Testa AI Features**:
   - Prova il matching automatico
   - Usa la chat RAG assistente
   - Genera daily briefing

4. **Personalizza**:
   - Modifica colori tema
   - Aggiungi logo agenzia
   - Configura notifiche

---

## 🔄 Aggiornamenti Automatici

Railway fa auto-deploy ad ogni push su GitHub:

```bash
# Fai modifiche in locale
git add .
git commit -m "feat: nuova funzionalità"
git push origin claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4-011CUriJTow48FK1nJ1gpSjC

# Railway deployer automaticamente! ✨
```

---

## 💰 Costi

**Railway Free Tier**:
- $5 di credito gratis/mese
- 3 servizi max (perfetto per noi!)
- 500MB RAM per servizio
- 1GB storage database

**Stima mensile per questo progetto**: $3-5/mese

✅ **Esattamente 3 servizi = compatibile con Free Tier!**

---

## 🐛 Problemi Comuni

### Build Error: npm ci

**Sintomo**:
```
npm error code EUSAGE
npm error npm ci can only install with an existing package-lock.json
```

**Soluzione**: ✅ **RISOLTO** - I Dockerfile ora usano `npm install` invece di `npm ci`

### App non si avvia

**Sintomo**: Service rimane "Building" o va in "Crashed"

**Soluzione**:
1. Clicca sul servizio → "Deployments" → "View Logs"
2. Cerca errori nei logs
3. Errori comuni:
   - `DATABASE_URL` mancante → Aggiungi la variabile con `${{crm-database.DATABASE_URL}}`
   - `GOOGLE_API_KEY` mancante → Aggiungi la tua API key
   - Database non pronto → Aspetta che il database sia "Active"
   - Branch sbagliato → Verifica di usare il branch lungo (claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4-011CUriJTow48FK1nJ1gpSjC)

### Creato servizio backend per errore

**Sintomo**: Hai creato 4 servizi invece di 3

**Soluzione**:
1. Il backend/ è INTERNO al frontend
2. Elimina il servizio "backend" o "crm-immobiliare-backend"
3. Settings → Danger Zone → Delete Service

### Health check fallisce

**Sintomo**: Service si riavvia continuamente

**Soluzione**:
1. Verifica che l'Health Check Path sia corretto:
   - App: `/api/health`
   - AI Tools: `/health`
2. Aumenta Health Check Timeout a 100s
3. Controlla i logs per errori

### Database connection error

**Sintomo**: Errore "cannot connect to database"

**Soluzione**:
1. Verifica che `DATABASE_URL` usi `${{crm-database.DATABASE_URL}}`
2. Aspetta che il database sia completamente avviato (30-60 sec)
3. Fai restart del servizio app

---

## 📚 Documentazione Completa

Per guide dettagliate:

- **[RAILWAY_FIX_IMMEDIATO.md](./RAILWAY_FIX_IMMEDIATO.md)** - Fix problemi deployment ⚠️
- **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)** - Guida completa deployment
- **[RAILWAY_PRE_FLIGHT_CHECKLIST.md](./RAILWAY_PRE_FLIGHT_CHECKLIST.md)** - Checklist pre-deploy
- **[DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)** - Test locale con Docker

---

## ✅ Checklist Rapida

Dopo il deploy, verifica:

- [ ] Esattamente 3 servizi creati (database + app + ai-tools)
- [ ] Tutti i 3 servizi sono "Active" ●verde
- [ ] App accessibile da browser
- [ ] `/api/health` restituisce 200 OK
- [ ] Impostazioni accessibili
- [ ] Database connesso
- [ ] Puoi creare un contatto di test
- [ ] Puoi creare una proprietà di test

✨ **Tutto OK? Congratulazioni, il deploy è completo!**

---

## 🆘 Supporto

Se hai problemi:

1. **⚠️ Leggi prima**: [RAILWAY_FIX_IMMEDIATO.md](./RAILWAY_FIX_IMMEDIATO.md)
2. **Controlla i logs** su Railway (servizio → Deployments → View Logs)
3. **Leggi la guida completa**: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)
4. **Verifica pre-flight**: [RAILWAY_PRE_FLIGHT_CHECKLIST.md](./RAILWAY_PRE_FLIGHT_CHECKLIST.md)

---

## 🔑 Info Importanti

**Branch da usare**:
```
claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4-011CUriJTow48FK1nJ1gpSjC
```

**Servizi da creare** (in ordine):
1. crm-database (PostgreSQL)
2. crm-app (GitHub Repo → frontend/Dockerfile)
3. crm-ai-tools (GitHub Repo → ai_tools/Dockerfile)

**Servizi da NON creare**:
- ❌ backend (è già incluso in crm-app!)

---

**Versione**: 2.0.0 (Fix npm ci + Branch specification)
**Tempo medio deploy**: 5-10 minuti
**Ultimo aggiornamento**: 2025-11-06

🎉 **Buon deploy!**
