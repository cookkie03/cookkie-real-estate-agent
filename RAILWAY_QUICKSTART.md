# 🚀 Railway Deploy - Quick Start (5 minuti)

**Deploy completo in 3 step**

---

## ⚡ STEP 1: Setup Railway (2 min)

### 1.1 Crea Account Railway

1. Vai su https://railway.app
2. Sign up con GitHub
3. Conferma email
4. Connetti il tuo repository GitHub

### 1.2 Crea Nuovo Progetto

1. Dashboard Railway → **"New Project"**
2. Seleziona **"Deploy from GitHub repo"**
3. Scegli: `cookkie-real-estate-agent`
4. Railway inizierà automaticamente l'analisi

---

## 📦 STEP 2: Configura 3 Servizi (2 min)

Railway rileverà automaticamente i Dockerfile. Crea i 3 servizi:

### 2.1 Database (PostgreSQL)

```
1. Nel progetto → "+ New"
2. Seleziona "Database" → "PostgreSQL"
3. Nome: "crm-database"
4. Lascia tutto di default
5. Deploy automatico ✅
```

**Nessuna configurazione richiesta!** Railway genera automaticamente `DATABASE_URL`.

### 2.2 App (Frontend + Backend Unificato)

```
1. "+ New" → "GitHub Repo"
2. Seleziona il repo
3. Service Name: "crm-app"
4. Root Directory: lascia vuoto (.)
5. Clicca "Deploy"
```

**Environment Variables** (Settings → Variables → Raw Editor):

```env
DATABASE_URL=${{crm-database.DATABASE_URL}}
GOOGLE_API_KEY=la-tua-google-api-key-qui
NODE_ENV=production
PORT=3000
SESSION_SECRET=genera-stringa-casuale-qui
```

**Genera SESSION_SECRET**:
```bash
openssl rand -base64 32
```

**Settings Importanti**:
- ✅ Health Check Path: `/api/health`
- ✅ Health Check Timeout: 100 seconds
- ✅ Port: `3000`
- ✅ **Generate Domain** (per URL pubblico)

### 2.3 AI Tools (Python FastAPI)

```
1. "+ New" → "GitHub Repo"
2. Seleziona il repo
3. Service Name: "crm-ai-tools"
4. Root Directory: lascia vuoto (.)
5. Dockerfile Path: "ai_tools/Dockerfile"
6. Clicca "Deploy"
```

**Environment Variables** (Settings → Variables → Raw Editor):

```env
DATABASE_URL=${{crm-database.DATABASE_URL}}
GOOGLE_API_KEY=la-tua-google-api-key-qui
PORT=8000
```

**Settings**:
- ✅ Health Check Path: `/health`
- ✅ Port: `8000`

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
4. Clicca **"Generate Domain"**
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
- ✅ Backend API (route handlers)
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
git push origin main

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

### App non si avvia

**Sintomo**: Service rimane "Building" o va in "Crashed"

**Soluzione**:
1. Clicca sul servizio → "Deployments" → "View Logs"
2. Cerca errori nei logs
3. Errori comuni:
   - `DATABASE_URL` mancante → Aggiungi la variabile
   - `GOOGLE_API_KEY` mancante → Aggiungi la variabile
   - Database non pronto → Aspetta che il database sia "Active"

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

- **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)** - Guida completa deployment
- **[RAILWAY_PRE_FLIGHT_CHECKLIST.md](./RAILWAY_PRE_FLIGHT_CHECKLIST.md)** - Checklist pre-deploy
- **[DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)** - Test locale con Docker

---

## ✅ Checklist Rapida

Dopo il deploy, verifica:

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

1. **Controlla i logs** su Railway (servizio → Deployments → View Logs)
2. **Leggi la guida completa**: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)
3. **Verifica pre-flight**: [RAILWAY_PRE_FLIGHT_CHECKLIST.md](./RAILWAY_PRE_FLIGHT_CHECKLIST.md)

---

**Versione**: 1.0.0
**Tempo medio deploy**: 5 minuti
**Ultimo aggiornamento**: 2025-11-06

🎉 **Buon deploy!**
