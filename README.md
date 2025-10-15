# RealEstate AI CRM 🏠

Una piattaforma CRM intelligente per agenti immobiliari, costruita con Next.js, PostgreSQL e AI.

## 🚀 Quick Start (Docker)

### Prerequisiti
- Docker
- Docker Compose

### Avvio rapido

1. **Clone il repository**
```bash
git clone <repository-url>
cd crm-immobiliare
```

2. **Configura le variabili di ambiente**
```bash
# Il file .env è già configurato con valori di default
# Per cambiare password del database, modifica .env prima di avviare
```

3. **Avvia con Docker Compose**
```bash
docker-compose up
```

L'applicazione sarà disponibile su: **http://localhost:3000**

### Prima volta: Attendi il seeding automatico
Alla prima esecuzione, Docker farà automaticamente:
- ✅ Crea il database PostgreSQL
- ✅ Applica lo schema Prisma
- ✅ Popola dati di test (16 immobili, 20 clienti, 20 azioni)
- ✅ Avvia l'app Next.js

Questo processo potrebbe impiegare 30-60 secondi alla prima esecuzione.

---

## 📊 Accedi ai servizi

### Applicazione Web
- **URL**: http://localhost:3000
- **Descrizione**: Dashboard CRM principale

### Adminer (Gestione Database)
- **URL**: http://localhost:8080
- **Utente**: postgres
- **Password**: postgres (default, vedi .env)
- **Database**: crm_immobiliare
- **Descrizione**: Interfaccia web per gestire PostgreSQL direttamente

### Database PostgreSQL (Diretto)
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres (default, vedi .env)
- **Database**: crm_immobiliare

---

## 🛠️ Comandi disponibili

### Development locale (senza Docker)

```bash
# Installa dipendenze
npm install

# Configura database .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_immobiliare"

# Genera Prisma Client
npm run prisma:generate

# Applica schema al database
npm run prisma:push

# Popola dati di test
npm run prisma:seed

# Avvia dev server
npm run dev

# Apri Prisma Studio (DB GUI)
npm run prisma:studio
```

### Docker Compose

```bash
# Avvia tutti i servizi
docker-compose up

# Avvia in background
docker-compose up -d

# Visualizza i log
docker-compose logs -f

# Ferma i servizi
docker-compose down

# Cancella anche i volumi (database)
docker-compose down -v

# Rebuild dopo cambiamenti
docker-compose up --build
```

---

## 📁 Struttura del progetto

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Homepage (Dashboard)
│   │   ├── properties/        # Pagina Immobili
│   │   ├── clients/           # Pagina Clienti
│   │   ├── map/               # Pagina Mappa
│   │   ├── agenda/            # Pagina Agenda
│   │   ├── actions/           # Pagina Azioni
│   │   ├── settings/          # Pagina Impostazioni
│   │   └── api/               # API Routes (in sviluppo)
│   ├── components/            # Componenti React
│   └── lib/                   # Utilità e logica
├── prisma/
│   ├── schema.prisma          # Schema database
│   ├── seed.ts                # Script seed
│   └── migrations/            # Migrazioni database
├── docker/
│   └── init-db.sql            # Script init PostgreSQL
├── docker-compose.yml         # Configurazione Docker
├── Dockerfile                 # Build image Next.js
└── .env                       # Variabili di ambiente
```

---

## 🗄️ Database

### Schema Principale

#### Immobile
- Proprietà immobiliari (appartamenti, ville, uffici, etc.)
- Campi: titolo, prezzo, superficie, ubicazione, descrizione, foto, stato

#### Cliente
- Clienti (acquirenti, venditori, proprietari)
- Campi: nome, email, telefono, preferenze, budget, zone interesse, priorità, stato

#### Match
- Abbinamenti AI tra immobili e clienti
- Campi: immobileId, clienteId, score (0-100), motivi, stato

#### Azione
- Attività e task per follow-up
- Campi: tipo (chiamata, visita, email, etc.), descrizione, priorità, stato, scadenza

#### Connector
- Integrazioni (Gmail, Calendar, WhatsApp, Google Studio, etc.)
- Campi: nome, tipo, stato, credenziali (crittate), lastSync

#### User
- Profilo agente immobiliare
- Campi: firstName, lastName, email, phone, company, role

---

## 🎯 Funzionalità principali

### Dashboard Principale
- 🔍 **Ricerca AI**: Ricerca naturale di immobili tramite LLM + RAG
- 📋 **Briefing giornaliero**: Generato da AI con priorità azioni
- 📊 **KPI Dashboard**: Metriche veloce (proprietà, clienti, match, conversion)
- ⚡ **Categorie Azioni**: Organizzate per priorità con clienti associati

### Visualizzazioni

#### Immobili (Grid/List)
- Filtri: prezzo, superficie, zona, tipologia
- Visualizzazione: card o lista con dettagli
- Status colore-codificati: disponibile, venduto, riservato

#### Clienti (Grid/List)
- Filtri: tipo (buyer/seller), priorità, status
- Info: budget, zone interesse, ultimo contatto
- Export dati per CRM integrazione

#### Mappa
- Zone geografiche con statistiche
- Proprietà e clienti per zona
- Prezzo medio e trend

#### Agenda
- Timeline appuntamenti odierni
- Status: programmato, completato, cancellato
- Dettagli cliente e indirizzo con azioni

#### Azioni
- Categorie: urgenti, follow-up, visite, email
- Filtri per priorità e stato
- Conteggio azioni per status

#### Impostazioni
- Profilo utente modificabile
- Gestione connettori (Gmail, Calendar, WhatsApp, etc.)
- Status sincronizzazione

---

## 🔌 Connettori (To Be Implemented)

### Integrati
- ✅ Struttura pronta in database
- ✅ UI per gestione connettori

### To Do
- [ ] Gmail: Sincronizzazione email e contatti
- [ ] Google Calendar: Sincronizzazione appuntamenti
- [ ] WhatsApp: Integrazione messaggi
- [ ] Google Studio API: Scraping dati
- [ ] PortaleX: Sincronizzazione annunci
- [ ] Idealista: Web scraping intelligente

---

## 🤖 AI Features (To Be Implemented)

- [ ] **LLM Search**: Ricerca naturale con RAG su immobili/clienti
- [ ] **Auto Matching**: Algoritmo AI che suggerisce match immobili-clienti
- [ ] **Daily Briefing**: Briefing giornaliero generato da AI
- [ ] **Valuation Tool**: Stima automatica prezzo immobili
- [ ] **Web Scraping**: Raccolta automatica annunci da portali
- [ ] **Chat Assistant**: RAG-based assistant per il supporto

---

## 🛡️ Sicurezza

- ✅ Credenziali database in .env (non versionato)
- ✅ Hash password (da implementare)
- ✅ CORS configurato
- ✅ Rate limiting (da implementare)
- ⚠️ Authentication (da implementare)

---

## 📝 Variabili d'ambiente (.env)

```bash
# Database
DB_USER=postgres              # Utente PostgreSQL
DB_PASSWORD=postgres          # Password PostgreSQL
DB_NAME=crm_immobiliare       # Nome database
DB_PORT=5432                  # Porta PostgreSQL

# App
NODE_ENV=development          # Environment
APP_PORT=3000                 # Porta Next.js

# Adminer
ADMINER_PORT=8080            # Porta Adminer GUI

# Per development locale, crea .env.local:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_immobiliare
```

---

## 🚨 Troubleshooting

### Container non si avvia
```bash
# Visualizza errori
docker-compose logs app

# Riavvia da zero
docker-compose down -v
docker-compose up --build
```

### Database non raggiungibile
```bash
# Verifica che PostgreSQL sia avviato
docker-compose ps

# Connettiti direttamente
docker-compose exec postgres psql -U postgres -d crm_immobiliare
```

### Port già in uso
```bash
# Cambia porta in .env
APP_PORT=3001  # Invece di 3000

# O libera la porta
sudo lsof -i :3000  # Trova processo
kill -9 <PID>       # Termina
```

### Dati perduti accidentalmente
```bash
# Resetta database (cancella dati)
docker-compose down -v

# Riavvia e risemina
docker-compose up
```

---

## 📚 Stack Tecnologico

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16 + Prisma ORM
- **UI**: Shadcn/ui + Tailwind CSS
- **State**: React Query + React Hook Form
- **Icons**: Lucide React
- **Forms**: Zod validation
- **Container**: Docker + Docker Compose

---

## 🤝 Contribuire

1. Crea un branch per la feature
2. Commit i cambiamenti
3. Push e apri una Pull Request

---

## 📞 Supporto

Per domande o problemi:
1. Controlla il [Troubleshooting](#troubleshooting)
2. Visualizza i log: `docker-compose logs -f`
3. Apri una issue su GitHub

---

## 📄 License

Privato - Solo uso autorizzato

---

## 🎉 Grazie

Graziezione per aver usato RealEstate AI CRM!

Buon lavoro! 🚀
