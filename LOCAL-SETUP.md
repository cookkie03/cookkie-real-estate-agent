# 🚀 Setup Locale - CRM Immobiliare

Guida rapida per avviare l'applicazione **in locale su Windows** senza Docker.

## ✅ Prerequisiti

Prima di iniziare, assicurati di avere installato:

1. **Node.js 18+** - [Scarica qui](https://nodejs.org/)
2. **Python 3.10+** - [Scarica qui](https://www.python.org/downloads/)
3. **Git** - [Scarica qui](https://git-scm.com/)

Verifica l'installazione aprendo PowerShell:

```powershell
node --version   # Dovrebbe mostrare v18.x.x o superiore
python --version # Dovrebbe mostrare Python 3.10.x o superiore
git --version    # Dovrebbe mostrare git version x.x.x
```

---

## 📦 Setup Rapido (Automatico)

### Opzione 1: Script PowerShell (Consigliato)

Apri PowerShell nella cartella del progetto ed esegui:

```powershell
# Abilita esecuzione script (una sola volta)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Esegui setup automatico
.\start-local.ps1
```

Lo script installerà tutto automaticamente:
- ✅ Crea virtual environment Python
- ✅ Installa dipendenze frontend e backend
- ✅ Crea database SQLite con dati demo
- ✅ Configura file .env

### Opzione 2: Setup Manuale

Se preferisci il controllo completo:

#### 1. Crea file .env

```powershell
# Copia la configurazione locale
Copy-Item .env.local .env
```

#### 2. Setup Database

```powershell
cd database\prisma

# Installa dipendenze
npm install

# Genera Prisma Client
npx prisma generate

# Crea database e tabelle
npx prisma db push

# Popola dati demo
npx tsx seed.ts

cd ..\..
```

#### 3. Setup Frontend

```powershell
cd frontend

# Installa dipendenze
npm install

cd ..
```

#### 4. Setup Backend AI

```powershell
cd ai_tools

# Crea virtual environment
python -m venv .venv

# Attiva virtual environment
.\.venv\Scripts\Activate.ps1

# Aggiorna pip
python -m pip install --upgrade pip

# Installa dipendenze
pip install -r requirements.txt

cd ..
```

---

## 🎮 Avvio Applicazione

**IMPORTANTE**: Servono **2 terminali separati**, uno per il frontend e uno per il backend.

### Terminal 1: Backend AI (FastAPI)

```powershell
# Metodo rapido con script
.\start-backend.ps1
```

Oppure manualmente:

```powershell
cd ai_tools
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2: Frontend (Next.js)

```powershell
# Metodo rapido con script
.\start-frontend.ps1
```

Oppure manualmente:

```powershell
cd frontend
npm run dev
```

---

## 🌐 Accesso all'Applicazione

Una volta avviati entrambi i servizi:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Health Check**: http://localhost:8000/health

---

## 🔑 Configurazione API Key

Al primo avvio, dovrai configurare la Google AI API Key:

1. Vai su http://localhost:3000/settings
2. Tab "API Keys"
3. Ottieni una chiave gratuita su: https://aistudio.google.com/app/apikey
4. Incolla la chiave e clicca "Testa e Salva"
5. Riavvia il backend AI (Ctrl+C nel terminal 1, poi riavvia)

---

## 🗄️ Database

Il progetto usa **SQLite** in locale, nessun server database richiesto!

- **File database**: `database/prisma/dev.db`
- **Dati demo**: Automaticamente popolati con `seed.ts`
- **Reset database**:

```powershell
cd database\prisma
Remove-Item dev.db
npx prisma db push
npx tsx seed.ts
```

---

## 🛠️ Comandi Utili

### Frontend (Next.js)

```powershell
cd frontend

# Sviluppo
npm run dev

# Build produzione
npm run build

# Avvia produzione
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

### Backend AI (FastAPI)

```powershell
cd ai_tools

# Attiva venv (sempre prima di eseguire comandi Python)
.\.venv\Scripts\Activate.ps1

# Sviluppo con auto-reload
python -m uvicorn app.main:app --reload

# Produzione
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Test
pytest

# Linting
black . && ruff check .
```

### Database (Prisma)

```powershell
cd database\prisma

# Genera client TypeScript
npx prisma generate

# Push schema a database
npx prisma db push

# Studio GUI per database
npx prisma studio

# Reset completo
npx prisma db push --force-reset
npx tsx seed.ts
```

---

## 🐛 Troubleshooting

### Errore: "Cannot find module '@prisma/client'"

```powershell
cd database\prisma
npx prisma generate
```

### Errore: "Port 3000 already in use"

Chiudi altre applicazioni sulla porta 3000, oppure modifica in `.env`:

```env
PORT=3001
```

### Errore: "ModuleNotFoundError" (Python)

Assicurati di aver attivato il virtual environment:

```powershell
cd ai_tools
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Errore: "Database locked"

Chiudi Prisma Studio se aperto, oppure:

```powershell
cd database\prisma
Remove-Item dev.db-journal -ErrorAction SilentlyContinue
```

### Backend non risponde

Verifica che sia in esecuzione:

```powershell
# Apri http://localhost:8000/health
# Dovrebbe rispondere con {"status": "healthy"}
```

Se non risponde, controlla i log nel terminal del backend.

---

## 📁 Struttura Progetto

```
cookkie-real-estate-agent/
├── frontend/              # Next.js app (porta 3000)
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── package.json
├── ai_tools/             # FastAPI backend (porta 8000)
│   ├── app/
│   │   ├── agents/       # AI agents
│   │   ├── routers/      # API routes
│   │   └── tools/        # AI tools
│   └── requirements.txt
├── database/
│   └── prisma/
│       ├── schema.prisma # Database schema
│       ├── seed.ts       # Dati demo
│       └── dev.db        # SQLite database (auto-generato)
├── .env                  # Config (copia da .env.local)
├── start-local.ps1       # Setup automatico
├── start-frontend.ps1    # Avvia solo frontend
└── start-backend.ps1     # Avvia solo backend
```

---

## 🎯 Prossimi Passi

Dopo il setup:

1. **Configura API Key** su http://localhost:3000/settings
2. **Esplora l'app** su http://localhost:3000
3. **Prova il chatbot AI** (icona chat in basso a destra)
4. **Visualizza la mappa** su http://localhost:3000/mappa
5. **Gestisci immobili** su http://localhost:3000/properties

---

## 💡 Note

- **NO Docker richiesto** - Tutto gira in locale
- **SQLite** - Database file-based, zero configurazione
- **Hot Reload** - Modifiche al codice si riflettono automaticamente
- **Dati Persistenti** - Il database `dev.db` sopravvive ai restart

Buon sviluppo! 🚀
