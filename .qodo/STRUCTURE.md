# Struttura del Progetto RealEstate AI

## 📋 Panoramica

Questo documento descrive la struttura organizzativa del progetto RealEstate AI, un'applicazione web per la gestione intelligente di immobili e clienti nel settore immobiliare.

## 🗂️ Struttura delle Pagine

### Pagine Principali

```
src/app/
├── page.tsx                    # 🏠 Home/Dashboard
├── immobili/                   # 🏘️ Gestione Immobili
│   └── page.tsx
├── clienti/                    # 👥 Gestione Clienti
│   └── page.tsx
├── tool/                       # 🔧 Toolkit Intelligente
│   └── page.tsx
├── agenda/                     # 📅 Calendario Appuntamenti
│   └── page.tsx
├── actions/                    # ⚡ Azioni Suggerite
│   └── page.tsx
├── search/                     # 🔍 Ricerca AI
│   └── page.tsx
├── map/                        # 🗺️ Mappa Interattiva
│   └── page.tsx
├── settings/                   # ⚙️ Impostazioni
│   └── page.tsx
└── connectors/                 # 🔌 Connettori Esterni
    └── page.tsx
```

## 🧭 Navigazione

### Barra Superiore (Header)

**Lato Sinistro:**
- Logo "RealEstate AI"
- 🏠 **Immobili** → `/immobili` - Gestione portfolio immobili
- 👥 **Contatti** → `/clienti` - Gestione clienti e lead
- 🔧 **Tool** → `/tool` - Suite di strumenti intelligenti

**Lato Destro:**
- ⚙️ **Impostazioni** → `/settings`
- ⌘K **Shortcut Tastiera** - Command Palette
- 🔔 **Notifiche**
- ❓ **Help**

### Navigazione Mobile (Bottom Bar)

- 🏠 Home
- 🔍 Cerca
- 📅 Agenda
- ⚡ Azioni

## 📄 Descrizione delle Pagine

### 1. Home/Dashboard (`/`)
**Scopo:** Panoramica generale e accesso rapido alle funzionalità principali

**Sezioni:**
- Barra di ricerca AI
- Quick Actions Pills (chiamate urgenti, appuntamenti, follow-up, lead)
- Mini Agenda
- Quick Dialer
- Intel Toolkit
- Azioni Suggerite
- Map Preview
- Activity Feed
- Connectors Status

### 2. Immobili (`/immobili`)
**Scopo:** Gestione completa del portfolio immobiliare

**Funzionalità:**
- Lista immobili con filtri
- Ricerca avanzata
- Statistiche (totale, disponibili, in trattativa, venduti)
- Card immobili con dettagli (prezzo, mq, locali, bagni)
- Aggiunta nuovo immobile

**Dati Visualizzati:**
- Tipo immobile
- Indirizzo
- Prezzo
- Metratura
- Numero locali e bagni
- Status (Disponibile, In trattativa, Venduto)

### 3. Clienti (`/clienti`)
**Scopo:** Gestione clienti e lead con sistema di prioritizzazione

**Funzionalità:**
- Tabs per categoria (Tutti, Hot, Warm, Cold, Inattivi)
- Ricerca clienti
- Filtri avanzati
- Ordinamento
- Aggiunta nuovo cliente

**Categorie Lead:**
- **Hot:** Clienti ad alta priorità
- **Warm:** Clienti interessati
- **Cold:** Clienti da riattivare
- **Inattivi:** Clienti dormienti

### 4. Tool (`/tool`)
**Scopo:** Suite di strumenti intelligenti per ottimizzare il lavoro

**Strumenti Disponibili:**
- 🧮 Calcolatore Mutuo
- 📈 Valutazione Immobile
- 📍 Analisi Zona
- 📧 Template Email
- 📞 Script Chiamate
- 🏢 Confronto Immobili
- 👥 Lead Scoring

**Strumenti in Sviluppo:**
- 📄 Generatore Contratti
- 📅 Pianificatore Appuntamenti
- 📊 Report di Mercato
- ⚡ Automazioni

### 5. Agenda (`/agenda`)
**Scopo:** Gestione calendario e appuntamenti

**Funzionalità:**
- Vista calendario
- Lista appuntamenti
- Dettagli visite
- Promemoria

### 6. Actions (`/actions`)
**Scopo:** Azioni suggerite dall'AI basate su priorità

**Categorie:**
- Chiamate urgenti
- Follow-up post visita
- Lead da contattare
- Documenti da preparare

### 7. Search (`/search`)
**Scopo:** Ricerca intelligente con RAG (Retrieval Augmented Generation)

**Capacità:**
- Ricerca clienti
- Ricerca immobili
- Ricerca zone
- Query in linguaggio naturale

### 8. Map (`/map`)
**Scopo:** Visualizzazione geografica di immobili e zone

**Funzionalità:**
- Mappa interattiva
- Marker immobili
- Heatmap prezzi
- Analisi zone

### 9. Settings (`/settings`)
**Scopo:** Configurazione applicazione

**Sezioni:**
- Profilo utente
- Preferenze
- Integrazioni
- Notifiche

### 10. Connectors (`/connectors`)
**Scopo:** Gestione integrazioni con servizi esterni

**Integrazioni:**
- Portali immobiliari
- CRM esterni
- Email
- Calendario

## 🎨 Design System

### Colori
- **Primary:** Blu (brand)
- **Accent:** Turchese/Cyan (AI features)
- **Success:** Verde
- **Warning:** Arancione
- **Danger:** Rosso

### Componenti UI
Basati su **shadcn/ui** con Tailwind CSS:
- Button
- Card
- Input
- Badge
- Dialog
- Tabs
- Table
- Form

## 🔑 Shortcut Tastiera

- `⌘K` / `Ctrl+K` - Command Palette
- `S` - Focus su ricerca
- `G` - Vai ad Agenda
- `A` - Vai ad Azioni
- `M` - Vai a Mappa

## 📱 Responsive Design

- **Desktop:** Navigazione completa in header
- **Tablet:** Navigazione adattiva
- **Mobile:** Bottom navigation bar

## 🚀 Prossimi Sviluppi

1. **Immobili:**
   - Dettaglio immobile singolo
   - Upload foto
   - Virtual tour
   - Documenti allegati

2. **Clienti:**
   - Profilo cliente dettagliato
   - Storico interazioni
   - Note e tag
   - Matching automatico immobili

3. **Tool:**
   - Implementazione tool mancanti
   - AI per generazione contratti
   - Report automatici

4. **Integrazioni:**
   - API portali immobiliari
   - WhatsApp Business
   - Google Calendar
   - Email marketing

## 📊 Tecnologie

- **Framework:** Next.js 14 (App Router)
- **UI:** React + TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Database:** Prisma + SQLite (dev) / PostgreSQL (prod)
- **AI:** OpenAI / Anthropic Claude
- **Maps:** Leaflet / Google Maps

## 🔐 Sicurezza

- Autenticazione utenti
- Autorizzazioni basate su ruoli
- Crittografia dati sensibili
- Backup automatici

---

**Ultimo aggiornamento:** 2024
**Versione:** 1.0.0
