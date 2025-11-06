# 🚂 Railway Deployment Guide - CRM Immobiliare

**Guida definitiva per deployment Docker su Railway**

---

## 📋 Prerequisiti

- Account Railway (https://railway.app)
- Repository GitHub connesso a Railway
- Google API Key (https://aistudio.google.com/app/apikey)

---

## 🚀 DEPLOYMENT SEMPLICE (3 passi)

### PASSO 1: Crea il Progetto Railway

1. Vai su https://railway.app
2. Clicca **"New Project"**
3. Seleziona **"Deploy from GitHub repo"**
4. Scegli questo repository: `cookkie-real-estate-agent`
5. Railway rileverà automaticamente i Dockerfile

### PASSO 2: Crea i 4 Servizi

Railway richiede 4 servizi separati:

#### 1️⃣ **Database (PostgreSQL)**

```
1. Nel progetto Railway, clicca "+ New"
2. Seleziona "Database" → "PostgreSQL"
3. Nome: "crm-database"
4. Railway creerà automaticamente DATABASE_URL
```

✅ **Il database è pronto!** Railway gestisce tutto automaticamente.

#### 2️⃣ **Backend API**

```
1. Clicca "+ New" → "GitHub Repo"
2. Seleziona il repo
3. Root Directory: lascia vuoto (.)
4. Dockerfile Path: backend/Dockerfile
5. Nome servizio: "crm-backend"
```

**Environment Variables** (Settings → Variables):
```bash
DATABASE_URL=${{crm-database.DATABASE_URL}}  # Auto-reference al database
GOOGLE_API_KEY=<your-key-here>
NODE_ENV=production
PORT=3001
SESSION_SECRET=<genera-una-stringa-casuale-sicura>
```

**Settings**:
- ✅ Health Check Path: `/api/health`
- ✅ Port: `3001`

#### 3️⃣ **Frontend UI**

```
1. Clicca "+ New" → "GitHub Repo"
2. Seleziona il repo
3. Root Directory: lascia vuoto (.)
4. Dockerfile Path: frontend/Dockerfile
5. Nome servizio: "crm-frontend"
```

**Environment Variables**:
```bash
NEXT_PUBLIC_API_URL=https://<backend-url>.railway.app
NODE_ENV=production
PORT=3000
```

**Nota**: Sostituisci `<backend-url>` con l'URL pubblico del backend (lo trovi in Settings → Networking)

**Settings**:
- ✅ Port: `3000`
- ✅ Generate Domain (per avere URL pubblico)

#### 4️⃣ **AI Tools (Opzionale)**

```
1. Clicca "+ New" → "GitHub Repo"
2. Seleziona il repo
3. Root Directory: lascia vuoto (.)
4. Dockerfile Path: ai_tools/Dockerfile
5. Nome servizio: "crm-ai-tools"
```

**Environment Variables**:
```bash
DATABASE_URL=${{crm-database.DATABASE_URL}}
GOOGLE_API_KEY=<your-key-here>
PORT=8000
```

**Settings**:
- ✅ Health Check Path: `/health`
- ✅ Port: `8000`

---

### PASSO 3: Deploy!

1. Tutti i servizi si deployeranno automaticamente
2. Aspetta che tutti diventino **"Active" (verde)**
3. Vai al servizio **Frontend**
4. Clicca su **"View Deployment"** o apri l'URL pubblico
5. **Accedi alle Impostazioni** (icona Settings nell'app)
6. **Inserisci la tua Google API Key** nella UI

✅ **FATTO!** L'app è live!

---

## 🔧 Configurazione Post-Deploy

### Configura API Keys dalla UI

1. Apri l'app frontend: `https://<frontend-url>.railway.app`
2. Vai su **Impostazioni** (icona ingranaggio nella sidebar)
3. Tab **"API Keys"**:
   - Inserisci **Google API Key**
   - (Opzionale) Inserisci **OpenAI API Key**
4. Clicca **"Salva"**

✅ Tutte le funzionalità AI sono ora attive!

### Prisma Migrations

Per applicare le migrations al database Railway:

```bash
# Localmente, con Railway CLI
railway login
railway link  # Seleziona il tuo progetto
railway run npx prisma migrate deploy --schema=database/prisma/schema.prisma
```

Oppure aggiungi un comando di deploy nel backend che esegue le migrations all'avvio.

---

## 📊 Monitoraggio

### Health Checks

Tutti i servizi hanno health check automatici:
- **Backend**: `GET /api/health`
- **Frontend**: `GET /` (homepage)
- **AI Tools**: `GET /health`

Railway monitora automaticamente e riavvia i servizi se non rispondono.

### Logs

Per vedere i logs:
1. Vai al servizio su Railway
2. Clicca tab **"Deployments"**
3. Clicca sul deployment attivo
4. Vedi i **logs in real-time**

---

## 🔄 Aggiornamenti

### Deploy Automatico (Consigliato)

Railway fa auto-deploy ad ogni push su GitHub:

```bash
git add .
git commit -m "feat: nuova funzionalità"
git push origin main
```

✅ Railway deployer automaticamente!

### Deploy Manuale

1. Vai al servizio su Railway
2. Clicca **"Deployments"**
3. Clicca **"Deploy"**

---

## 💾 Database Management

### Accesso al Database

Railway fornisce:
- **DATABASE_URL**: connessione interna tra servizi
- **DATABASE_PUBLIC_URL**: connessione esterna (per Prisma Studio, pgAdmin, etc.)

### Backup

Railway fa backup automatici. Per backup manuale:

1. Vai al servizio "crm-database"
2. Tab **"Data"**
3. Clicca **"Backups"**

### Prisma Studio

Per aprire Prisma Studio sul database Railway:

```bash
# Localmente
railway login
railway link
railway run npx prisma studio --schema=database/prisma/schema.prisma
```

---

## 🐛 Troubleshooting

### Backend non si avvia

**Problema**: Errore database connection
**Soluzione**:
1. Verifica che `DATABASE_URL` sia configurato
2. Usa la variabile di riferimento: `${{crm-database.DATABASE_URL}}`
3. Aspetta che il database sia "Active" prima di deployare il backend

### Frontend non raggiunge il Backend

**Problema**: 404 o CORS errors
**Soluzione**:
1. Verifica che `NEXT_PUBLIC_API_URL` punti all'URL pubblico del backend
2. Aggiungi CORS origin nel backend: `CORS_ORIGINS=https://frontend-url.railway.app`

### AI Features non funzionano

**Problema**: Errori API Google
**Soluzione**:
1. Vai su Impostazioni nell'app
2. Inserisci Google API Key valida
3. Testa la connessione con il pulsante "Testa Connessione"

### Build failed

**Problema**: Dockerfile build error
**Soluzione**:
1. Verifica che tutti i file necessari siano committati
2. Controlla i logs del build
3. Testa il build localmente: `docker build -f backend/Dockerfile .`

---

## 💰 Costi Railway

Railway offre:
- **Free Tier**: $5 di credito gratis al mese
- **Hobby Plan**: $5/mese per uso personale
- **Pro Plan**: $20/mese per uso professionale

**Stima per questo progetto**:
- 4 servizi (Frontend + Backend + AI + Database)
- ~$5-10/mese nel piano Hobby
- ~$0 con Free Tier per testing

---

## 📚 Risorse

- **Railway Docs**: https://docs.railway.app
- **Railway Status**: https://status.railway.app
- **Railway CLI**: https://docs.railway.app/develop/cli
- **Prisma Railway Guide**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway

---

## ✅ Checklist Pre-Deploy

Prima di deployare su Railway:

- [ ] Repository pushato su GitHub
- [ ] Google API Key disponibile
- [ ] Account Railway creato
- [ ] Repository connesso a Railway
- [ ] Tutti i test passano localmente: `npm test`
- [ ] Build locale funziona: `npm run build`
- [ ] Docker build funziona: `docker-compose up`

---

## 🎯 Architettura Railway

```
┌─────────────────────────────────────────────────┐
│            Railway Project                       │
│                                                  │
│  ┌─────────────┐    ┌─────────────┐            │
│  │  Frontend   │◄───┤  Cloudflare │ (CDN)      │
│  │  (Next.js)  │    │   Domain    │            │
│  │  Port 3000  │    └─────────────┘            │
│  └──────┬──────┘                                │
│         │                                        │
│         │ NEXT_PUBLIC_API_URL                   │
│         │                                        │
│         ▼                                        │
│  ┌─────────────┐                                │
│  │   Backend   │                                │
│  │  (Next.js)  │                                │
│  │  Port 3001  │                                │
│  └──────┬──────┘                                │
│         │                                        │
│         │ DATABASE_URL                          │
│         │                                        │
│         ▼                                        │
│  ┌─────────────┐    ┌─────────────┐            │
│  │ PostgreSQL  │    │  AI Tools   │            │
│  │  (Managed)  │◄───┤  (FastAPI)  │            │
│  │             │    │  Port 8000  │            │
│  └─────────────┘    └─────────────┘            │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🎉 Congratulazioni!

Hai deployato con successo il CRM Immobiliare su Railway!

**Prossimi passi**:
1. Configura la tua Google API Key dalla UI
2. Carica i tuoi primi immobili e clienti
3. Testa le funzionalità AI (matching, chat, briefing)
4. Personalizza l'interfaccia secondo le tue esigenze

**Enjoy!** 🚀

---

**Versione**: 1.0.0
**Ultimo aggiornamento**: 2025-11-06
**Autore**: CRM Immobiliare Team
