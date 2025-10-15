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
next-migration/
├── src/
│   ├── app/                # App Router (Next.js 14)
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Homepage
│   │   ├── providers.tsx   # React Query + UI providers
│   │   └── [routes]/       # Route pages
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # Feature components
│   ├── lib/
│   │   ├── db/            # Prisma client
│   │   ├── mockData.ts    # Mock data (temporaneo)
│   │   └── utils.ts       # Utilities
│   └── hooks/             # Custom React hooks
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── public/                # Static assets
└── .env.local            # Environment variables
```

## Database Schema

Il database include i seguenti modelli:

- **Immobile**: Proprietà immobiliari
- **Cliente**: Clienti (buyer/seller/owner)
- **Match**: Matching immobili-clienti con score AI
- **Azione**: Task e follow-up da completare

Vedi `prisma/schema.prisma` per dettagli completi.

## Environment Variables

Copia `.env.local` e configura le variabili necessarie:

```env
DATABASE_URL="file:./dev.db"
# Altre variabili opzionali...
```

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
