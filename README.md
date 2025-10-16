# CRM Immobiliare - Next.js Migration

Migrazione del progetto da Vite + React Router a Next.js 14 con App Router.

## Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Database**: Prisma + SQLite
- **State Management**: @tanstack/react-query
- **Forms**: react-hook-form + zod

## Comandi Disponibili

```bash
# Installare dipendenze
npm install

# Avviare server di sviluppo
npm run dev

# Build per produzione
npm run build

# Avviare server produzione
npm start

# Linting
npm run lint

# Prisma commands
npm run prisma:generate    # Genera Prisma Client
npm run prisma:push        # Push schema al database
npm run prisma:studio      # Apri Prisma Studio GUI
npm run prisma:seed        # Esegui seed del database
```

## Setup Iniziale

1. **Installare dipendenze**:
   ```bash
   npm install
   ```

2. **Configurare database**:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:seed
   ```

3. **Avviare server di sviluppo**:
   ```bash
   npm run dev
   ```

4. Aprire [http://localhost:3000](http://localhost:3000) nel browser

## Struttura Progetto

```
cookkie-real-estate-agent/
├── src/
│   ├── app/                        # 🎨 FRONTEND - Next.js App Router
│   │   ├── page.tsx               # 🏠 Homepage/Dashboard
│   │   ├── immobili/              # 🏘️ Gestione Immobili
│   │   │   └── page.tsx
│   │   ├── clienti/               # 👥 Gestione Clienti
│   │   │   └── page.tsx
│   │   ├── tool/                  # 🔧 Toolkit Intelligente
│   │   │   └── page.tsx
│   ��   ├── agenda/                # 📅 Calendario
│   │   │   └── page.tsx
│   │   ├── actions/               # ⚡ Azioni Suggerite
│   │   │   └── page.tsx
│   │   ├── search/                # 🔍 Ricerca AI
│   │   │   └── page.tsx
│   │   ├── map/                   # 🗺️ Mappa
│   │   │   └── page.tsx
│   │   ├── settings/              # ⚙️ Impostazioni
│   │   │   └── page.tsx
│   │   ├── connectors/            # 🔌 Connettori
│   │   │   └── page.tsx
│   │   ├── api/                   # 🔌 API Routes (future)
│   │   │   ├── immobili/
│   │   │   ├── clienti/
│   │   │   ├── matches/
│   │   │   └── azioni/
│   │   ├── layout.tsx             # Root layout
│   │   ├── providers.tsx          # React Query + UI providers
│   │   └── globals.css
│   │
│   ├── components/                 # 🎨 FRONTEND - React Components
│   │   ├── ui/                    # shadcn/ui components (DO NOT EDIT)
│   │   ├── features/              # Feature-specific components
│   │   │   ├── dashboard/         # Dashboard components
│   │   │   ├── immobili/          # Property components
│   │   │   ├── clienti/           # Client components
│   │   │   └── matches/           # Match components
│   │   └── layouts/               # Layout components
│   │       ├── CommandPalette.tsx
│   │       └── AISearchBar.tsx
│   │
│   ├── lib/                       # 🛠️ UTILITIES & TOOLS
│   │   ├── db/                    # 💾 DATABASE Layer
│   │   │   ├── index.ts           # Prisma client singleton
│   │   │   └── helpers.ts         # Query helpers
│   │   ├── api/                   # API utilities
│   │   ├── validation/            # Zod schemas
│   │   ├── ai/                    # AI tools (future)
│   │   │   └── .cache/            # 🗂️ AI cache (git-ignored)
│   │   ├── scraping/              # Web scraping (future)
│   │   │   └── .cache/            # 🗂️ Scraping cache (git-ignored)
│   │   ├── utils.ts
│   │   └── mockData.ts            # TEMPORARY mock data
│   │
│   └── hooks/                     # Custom React hooks
│
├── prisma/                        # 💾 DATABASE
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # 🌱 Seed data (mock)
│   ├── migrations/                # Schema migrations (git-ignored)
│   └── dev.db                     # SQLite database (git-ignored)
│
├── public/                        # Static assets
├── STRUCTURE.md                   # 📋 Documentazione struttura dettagliata
├── .env.example                   # ✅ Public template
├── .env.local                     # 🔒 Your secrets (git-ignored)
└── .gitignore                     # Git exclusions
```

Per una descrizione dettagliata di ogni pagina e funzionalità, consulta [STRUCTURE.md](./STRUCTURE.md).

## Database Schema

Il database include i seguenti modelli:

- **Immobile**: Proprietà immobiliari
- **Cliente**: Clienti (buyer/seller/owner)
- **Match**: Matching immobili-clienti con score AI
- **Azione**: Task e follow-up da completare

Vedi `prisma/schema.prisma` per dettagli completi.

## Environment Variables

**IMPORTANTE**: Non committare mai file `.env.local` o `.env` su Git!

1. Copia `.env.example` come `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Configura le variabili con le tue credenziali reali

3. Il file `.env.local` è automaticamente escluso da Git tramite `.gitignore`

## 🔒 Sicurezza e Best Practices

### Dati Sensibili

Questo progetto è configurato per **NON includere MAI** dati sensibili nel repository:

✅ **File esclusi da Git (via .gitignore)**:
- `.env`, `.env.local`, `.env.production` - Variabili d'ambiente e credenziali
- `/prisma/*.db`, `/prisma/*.db-journal` - Database SQLite popolati
- `/src/lib/ai/.cache/` - Cache tool AI
- `/src/lib/scraping/.cache/` - Cache web scraping
- `node_modules/`, `.next/`, build artifacts
- File temporanei, backup, log

✅ **Dati mock sicuri**:
- Il file `prisma/seed.ts` contiene SOLO dati fittizi
- Nomi: Laura Bianchi, Marco Rossi, ecc. (inventati)
- Email: `@email.com` (non reali)
- Telefoni: generici italiani
- Indirizzi: realistici ma non personali

⚠️ **PRIMA DI FARE PUSH**:
1. Verifica che `.env.local` NON sia tracciato: `git status`
2. Controlla che il database non contenga dati reali
3. Assicurati che nessuna API key sia hardcoded nel codice
4. Usa sempre `.env.example` per documentare variabili necessarie

### Come Gestire Credenziali

1. **API Keys**: Sempre in `.env.local`, mai nel codice
2. **Database**: SQLite locale è escluso automaticamente
3. **Scraping credentials**: Solo in `.env.local`
4. **JWT secrets**: Generati random, mai committati

### Checklist Pre-Push

- [ ] `git status` non mostra file `.env*` (eccetto `.env.example`)
- [ ] Nessun file `.db` nei file tracciati
- [ ] Nessuna password o API key hardcoded
- [ ] File di cache esclusi
- [ ] Dati seed sono solo mock/fittizi

## Differenze rispetto a Vite

### Routing
- ✅ File-based routing con App Router
- ✅ `useRouter()` da `next/navigation` invece di `useNavigate()`
- ✅ Client Components con `"use client"` dove necessario

### Componenti
- ✅ Tutti i componenti UI shadcn/ui mantenuti intatti
- ✅ Keyboard shortcuts preservati
- ✅ Tema Tailwind custom mantenuto

### Features da Implementare
- [ ] API Routes per CRUD operations
- [ ] Autenticazione (single-user)
- [ ] Sostituire mockData con chiamate database reali
- [ ] Implementare matching algorithm
- [ ] RAG system per ricerca AI
- [ ] Web scraping per portali immobiliari

## Prossimi Passi

1. Testare tutte le pagine e la navigazione
2. Creare prime API routes (`/api/immobili`, `/api/clienti`)
3. Sostituire mock data con query Prisma reali
4. Implementare autenticazione base
5. Aggiungere features avanzate (matching, RAG, etc.)

## Note

- Il progetto usa SQLite per semplicità (perfetto per single-user)
- Tutti gli stili e animazioni custom sono preservati
- I componenti shadcn/ui NON sono stati modificati
- Il database è già seedato con dati di esempio

## Supporto

Per problemi o domande, consultare:
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
