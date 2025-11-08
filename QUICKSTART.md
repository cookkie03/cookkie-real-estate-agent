# 🚀 QUICKSTART - CRM Immobiliare

Questa guida ti porta dall'installazione all'utilizzo in **meno di 5 minuti**.

---

## ⚡ Installazione Rapida

### Opzione 1: Docker (Consigliato - Produzione)

**Prerequisiti**: Docker e Docker Compose

```bash
# 1. Clona il repository
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# 2. Configura l'ambiente (auto-genera secrets)
npm run setup

# 3. Avvia con Docker
docker-compose up -d

# 4. Apri il browser
# http://localhost:3000
```

**Fatto!** Il wizard di setup ti guiderà nella configurazione iniziale.

**⏱️ Nota**: Il primo avvio richiede 5-10 minuti per buildare le immagini Docker. Gli avvii successivi sono quasi istantanei (~30 secondi) grazie alla cache.

---

### Opzione 2: Sviluppo Locale

**Prerequisiti**: Node.js 18+, Python 3.11+

```bash
# 1. Clona il repository
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# 2. Installa dipendenze
npm install

# 3. Setup automatico (genera .env con secrets)
npm run setup

# 4. Avvia tutto con UN solo comando
npm run dev

# 5. Apri il browser
# http://localhost:3000
```

**Fatto!** App (porta 3000) + AI Tools (porta 8000) partono insieme.

**💡 Nota importante**:
- `npm install` installa **automaticamente** le dipendenze di tutti i workspace (root + frontend)
- Grazie ai **workspaces** di npm, non serve eseguire `cd frontend && npm install` manualmente!
- Un solo comando installa tutto ciò che serve

---

## 🎯 Primo Utilizzo

### 1. Setup Wizard

Al primo avvio si apre automaticamente il **Setup Wizard**:

**Step 1 - Il Tuo Profilo:**
- Nome completo
- Email
- Telefono (opzionale)

**Step 2 - La Tua Agenzia (opzionale):**
- Nome agenzia
- Partita IVA
- Indirizzo
- Percentuale commissione (default: 3%)

**Step 3 - API Keys (opzionale):**
- Google AI (Gemini) - **GRATUITA** 🎉
  - Ottieni su: https://aistudio.google.com/app/apikey
  - Abilita: RAG Assistant, Matching, Briefing, Ricerca Semantica
- Testa la connessione direttamente dal wizard

**Step 4 - Riepilogo:**
- Verifica tutto
- Clicca "Completa Setup"

### 2. Dashboard

Dopo il setup accedi alla **Dashboard** con:

- **Statistiche in tempo reale**: Proprietà, clienti, richieste, match
- **Attività recenti**: Timeline delle ultime operazioni
- **Azioni suggerite**: AI-powered suggestions
- **Quick actions**: Aggiungi proprietà/cliente con 1 click

### 3. Funzionalità Principali

**Gestione Proprietà** (`/immobili`)
- Schede complete con foto, planimetrie, documenti
- Ricerca avanzata e filtri
- Importazione massiva (CSV, Excel)
- Web scraping da portali (Immobiliare.it, Casa.it, Idealista)

**Gestione Clienti** (`/clienti`)
- Contatti unificati (acquirenti, venditori, proprietari)
- Storico attività e comunicazioni
- Segmentazione automatica

**Richieste di Ricerca** (`/richieste`)
- Profili di ricerca dettagliati
- Budget e preferenze
- Notifiche automatiche su nuovi match

**Property Matching AI** (`/matching`)
- Algoritmo AI che abbina proprietà a richieste
- Score di compatibilità 0-100
- Suggerimenti intelligenti

**Mappa Interattiva** (`/mappa`)
- Visualizzazione geografica di tutte le proprietà
- Filtri in tempo reale
- Heatmap prezzi per zona

**RAG Assistant** (Sidebar)
- Chat AI contestuale
- Interroga il tuo database in linguaggio naturale
- Genera report automatici

---

## 🔑 Configurazione API Keys (Post-Setup)

Puoi aggiungere o modificare le API keys in qualsiasi momento:

1. Vai su **Impostazioni** (icona ingranaggio in alto a destra)
2. Tab **API Keys**
3. Inserisci/aggiorna le chiavi
4. Clicca **Test Connessione**
5. Salva

### Google AI (Gemini) - GRATUITA

1. Vai su https://aistudio.google.com/app/apikey
2. Clicca "Create API Key"
3. Copia la chiave (inizia con `AIza...`)
4. Incollala nelle Impostazioni
5. **Funzionalità sbloccate**:
   - 🤖 RAG Assistant (chat intelligente)
   - 🎯 Property Matching (abbinamenti automatici)
   - 📊 Daily Briefing (riepilogo giornaliero)
   - 🔍 Semantic Search (ricerca avanzata)

---

## 📖 Workflow Tipico

### Caso d'uso: Nuovo Cliente Acquirente

1. **Aggiungi il cliente** → `/clienti/nuovo`
   - Nome, email, telefono
   - Tipologia: Acquirente

2. **Crea richiesta di ricerca** → `/richieste/nuova`
   - Tipologia immobile
   - Zona/Città
   - Budget min/max
   - Caratteristiche (camere, bagni, mq, ecc.)

3. **AI fa il matching** → `/matching`
   - Automatico: vedi i match migliori
   - Ordina per score
   - Invia proposte al cliente

4. **Organizza visita** → `/agenda`
   - Pianifica appuntamento
   - Reminder automatici

5. **Segui le attività** → Dashboard
   - Timeline completa
   - Storico interazioni

---

## 🐳 Docker - Comandi Utili

```bash
# Avvia
docker-compose up -d

# Verifica stato
docker-compose ps

# Vedi logs
docker-compose logs -f

# Vedi logs solo app
docker-compose logs -f app

# Ferma tutto
docker-compose down

# Ferma e cancella volumi (ATTENZIONE: perde dati!)
docker-compose down -v

# Riavvia un servizio
docker-compose restart app

# Aggiorna immagini (pull latest)
docker-compose pull
docker-compose up -d
```

### Auto-Update (Watchtower)

Il sistema include **Watchtower** che:
- Controlla GitHub Container Registry ogni 5 minuti
- Scarica automaticamente nuove versioni
- Riavvia i container aggiornati
- **Mantiene i dati** (database, uploads, backups)

---

## 🛠️ Sviluppo Locale - Comandi Utili

```bash
# Setup iniziale (genera .env)
npm run setup

# Avvia tutto (app + AI)
npm run dev

# Solo app (frontend + API)
npm run dev:app

# Solo AI tools
npm run dev:ai

# Build produzione
npm run build

# Database commands
npm run prisma:generate    # Rigenera Prisma Client
npm run prisma:push        # Push schema to DB
npm run prisma:studio      # Apri Prisma Studio GUI
npm run prisma:seed        # Popola DB con dati di test
npm run prisma:migrate     # Crea migration

# Lint e test
npm run lint
npm run test

# Pulizia
npm run clean
```

---

## 📊 Database

### Sviluppo Locale
- **SQLite** (automatico, nessuna configurazione)
- File: `database/prisma/dev.db`
- GUI: `npm run prisma:studio` → http://localhost:5555

### Docker (Produzione)
- **PostgreSQL 16**
- Persistente (volume Docker)
- Auto-migrazioni all'avvio

---

## 🆘 Troubleshooting

### "Errore di connessione al database"
```bash
# Rigenera Prisma Client
npm run prisma:generate
```

### "Porta 3000 già in uso"
```bash
# Trova processo
npx kill-port 3000

# Oppure cambia porta in .env
APP_PORT=3001
```

### "Setup wizard non appare"
```bash
# Resetta setup (cancella UserProfile)
npm run prisma:studio
# Elimina manualmente il record UserProfile
```

### "Google AI non funziona"
- Verifica API key valida
- Controlla quota (Google AI Studio dashboard)
- Testa connessione da Impostazioni

### Docker: "Container non parte"
```bash
# Vedi logs dettagliati
docker-compose logs app

# Rigenera immagini
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Prossimi Passi

✅ **Configurazione completata?** Continua con:

- [**Guida Completa**](ARCHITECTURE.md) - Architettura e funzionalità
- [**Docker Deployment**](DOCKER.md) - Deploy in produzione
- [**Development Guide**](DEVELOPMENT.md) - Sviluppo e customizzazione
- [**Configuration**](CONFIGURATION.md) - Variabili ambiente e settings

---

## 💡 Tips & Tricks

**1. Importazione Massiva**
- Prepara CSV/Excel con le proprietà
- Usa `/immobili/importa`
- Il sistema valida e importa automaticamente

**2. Web Scraping**
- Vai su `/scraping`
- Configura portale (Immobiliare.it, Casa.it)
- Avvia ricerca automatica
- Le proprietà vengono importate nel tuo database

**3. Daily Briefing**
- Ogni mattina l'AI genera un riepilogo
- Nuove opportunità
- Azioni prioritarie
- Match recenti

**4. Backup Automatico**
- Docker: volumi persistenti
- Locale: copia `database/prisma/dev.db`

**5. Mobile Access**
- L'app è responsive
- Funziona su smartphone/tablet
- Nessuna app nativa necessaria

---

## 🎉 Enjoy!

**Hai domande?**
- 📖 Leggi la [documentazione completa](../README.md)
- 🐛 Segnala bug su [GitHub Issues](https://github.com/cookkie03/cookkie-real-estate-agent/issues)

**Made with ❤️ by Luca M. & Claude Code**
