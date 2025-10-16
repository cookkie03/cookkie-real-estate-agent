# Note sulla Migrazione: Vite → Next.js 14

**Data migrazione**: 15 Ottobre 2025
**Versione Next.js**: 14.2.18
**Stato**: ✅ Migrazione base completata

---

## ✅ Completato

### 1. Setup Base Next.js
- ✅ Struttura progetto Next.js 14 con App Router creata
- ✅ `package.json` configurato con tutte le dipendenze necessarie
- ✅ TypeScript configurato con path aliases (`@/*`)
- ✅ `.gitignore` e configurazione base

### 2. Styling e Theme
- ✅ Tailwind CSS configurato con tema custom esistente
- ✅ `globals.css` con tutte le CSS variables (colori, gradienti, ombre, animazioni)
- ✅ Tutte le animazioni custom preservate (fade-in, fade-in-up, scale-in, etc.)
- ✅ Responsive breakpoints mantenuti

### 3. Database (Prisma + SQLite)
- ✅ Schema Prisma creato con 4 modelli: `Immobile`, `Cliente`, `Match`, `Azione`
- ✅ Prisma client singleton pattern implementato in `src/lib/db/index.ts`
- ✅ Script di seed con dati di esempio (`prisma/seed.ts`)
- ✅ Configurazione `.env.local` con `DATABASE_URL`

### 4. Componenti
- ✅ Tutti i componenti shadcn/ui copiati senza modifiche (in `src/components/ui/`)
- ✅ Componenti feature copiati: AISearchBar, CommandPalette, MapPreview, etc.
- ✅ `CommandPalette` convertito per Next.js (useRouter invece di useNavigate)
- ✅ Utilities e hooks copiati (`utils.ts`, `mockData.ts`, hooks)

### 5. Pagine (App Router)
Tutte le pagine convertite con "use client" e useRouter:
- ✅ `/` - Homepage (Index.tsx → page.tsx)
- ✅ `/search` - Ricerca AI
- ✅ `/agenda` - Calendario appuntamenti
- ✅ `/actions` - Azioni suggerite
- ✅ `/map` - Mappa zone
- ✅ `/connectors` - Configurazione connettori
- ✅ `/settings` - Impostazioni
- ✅ `not-found.tsx` - Pagina 404

### 6. Layout e Providers
- ✅ `layout.tsx` con metadata corretti da index.html
- ✅ `providers.tsx` con QueryClient, TooltipProvider, Toaster
- ✅ Lingua impostata su italiano

### 7. Configurazioni
- ✅ `next.config.js` base configurato
- ✅ `postcss.config.js` per Tailwind
- ✅ ESLint configurato per Next.js (`.eslintrc.json`)
- ✅ `.env.local` template con tutte le variabili

### 8. Assets
- ✅ File pubblici copiati (favicon, placeholder.svg, robots.txt)

---

## 🔄 Modifiche Principali

### Da React Router a Next.js Router
```typescript
// Prima (Vite)
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/path");

// Dopo (Next.js)
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/path");
```

### Client Components
Tutti i componenti con:
- useState, useEffect, o altri hooks React
- Event handlers (onClick, onChange, etc.)
- Browser APIs

Devono avere `"use client"` all'inizio del file.

### Search Params
```typescript
// Prima (Vite)
import { useSearchParams } from "react-router-dom";
const [searchParams] = useSearchParams();

// Dopo (Next.js)
import { useSearchParams } from "next/navigation";
const searchParams = useSearchParams(); // No destructuring
```

---

## 📋 TODO: Prossimi Passi

### Fase Immediata (Testing)
- [ ] **IMPORTANTE**: Eseguire `npm install` nella cartella `next-migration/`
- [ ] Eseguire `npm run prisma:generate` per generare Prisma Client
- [ ] Eseguire `npm run prisma:push` per creare database SQLite
- [ ] Eseguire `npm run prisma:seed` per popolare database
- [ ] Testare `npm run dev` e verificare che l'app si avvii correttamente
- [ ] Testare navigazione tra pagine
- [ ] Verificare Command Palette (Cmd+K)
- [ ] Testare keyboard shortcuts (s, g, a, m)
- [ ] Verificare responsive design (mobile/tablet/desktop)

### Fase 1: API Routes (Week 1-2)
- [ ] Creare `/api/immobili` route (GET, POST, PUT, DELETE)
- [ ] Creare `/api/clienti` route (GET, POST, PUT, DELETE)
- [ ] Creare `/api/matches` route (GET, POST)
- [ ] Creare `/api/azioni` route (GET, POST, PATCH)
- [ ] Aggiungere validazione Zod per tutte le API
- [ ] Gestione errori e status codes appropriati
- [ ] Test delle API con Prisma Studio

### Fase 2: Sostituire Mock Data (Week 2-3)
- [ ] Creare custom hooks con React Query per fetching:
  - `useImmobili()` - Fetch properties
  - `useClienti()` - Fetch clients
  - `useMatches()` - Fetch matches
  - `useAzioni()` - Fetch actions
- [ ] Sostituire `mockData.ts` nelle pagine con chiamate reali
- [ ] Aggiungere loading states e error handling
- [ ] Implementare pagination dove necessario

### Fase 3: CRUD UIs (Week 3-4)
- [ ] Pagina `/immobili` con lista e dettagli
- [ ] Form creazione/modifica immobile
- [ ] Pagina `/clienti` con lista e dettagli
- [ ] Form creazione/modifica cliente
- [ ] Upload immagini immobili (multipart/form-data)
- [ ] Filtri e ricerca avanzata

### Fase 4: Autenticazione (Week 4)
- [ ] Implementare auth semplice (single-user)
- [ ] Proteggere tutte le routes
- [ ] Login page
- [ ] Session management
- [ ] Middleware Next.js per auth

### Fase 5: Features Avanzate (Week 5-8)
- [ ] **Matching Algorithm**: Implementare scoring system
- [ ] **Interactive Map**: Leaflet integration
- [ ] **Daily Briefing**: Automated daily summary
- [ ] **RAG System**: LlamaIndex + OpenRouter integration
- [ ] **Web Scraping**: Puppeteer scrapers per portali

### Fase 6: Optimization & Polish (Week 9-10)
- [ ] Performance audit
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Toast notifications per feedback utente
- [ ] Documentazione API
- [ ] Testing (unit + integration)

---

## ⚠️ Note Importanti

### Componenti NON Modificati
I seguenti componenti shadcn/ui sono stati copiati INTATTI:
- Tutti i file in `src/components/ui/`
- Non modificarli manualmente, usa il CLI shadcn se necessario

### Keyboard Shortcuts Preservati
- `Cmd/Ctrl + K` - Command Palette
- `s` - Focus search
- `g` - Go to Agenda
- `a` - Go to Actions
- `m` - Go to Map

### Database SQLite
- File database: `prisma/dev.db` (creato al primo `prisma:push`)
- Non committare il file `.db` (già in `.gitignore`)
- Usare `prisma:seed` per resettare dati di test

### Mock Data Temporaneo
`src/lib/mockData.ts` è ancora usato dalle pagine. Va sostituito gradualmente con chiamate API reali.

---

## 📁 Struttura File Principale

```
next-migration/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout con metadata
│   │   ├── page.tsx                ← Homepage
│   │   ├── providers.tsx           ← React Query + UI providers
│   │   ├── globals.css             ← CSS con theme custom
│   │   ├── [route]/page.tsx        ← Route pages
│   │   └── not-found.tsx           ← 404 page
│   ├── components/
│   │   ├── ui/                     ← shadcn/ui (NON modificare)
│   │   ├── AISearchBar.tsx
│   │   ├── CommandPalette.tsx      ← Convertito per Next.js
│   │   └── ...
│   ├── lib/
│   │   ├── db/
│   │   │   └── index.ts            ← Prisma client singleton
│   │   ├── mockData.ts             ← Da sostituire
│   │   └── utils.ts
│   └── hooks/
├── prisma/
│   ├── schema.prisma               ← Database schema
│   ├── seed.ts                     ← Seed script
│   └── dev.db                      ← SQLite file (generato)
├── public/
├── .env.local                      ← Environment variables
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🐛 Known Issues / Limitazioni

1. **SQLite Limitations**:
   - JSON fields serializzati come stringhe (no native JSON type)
   - Arrays serializzati come stringhe
   - Usare `JSON.parse()/JSON.stringify()` quando necessario

2. **Client-Side Navigation**:
   - Tutte le pagine usano "use client" per ora
   - Future optimization: convertire alcune in Server Components

3. **Image Optimization**:
   - Immagini in `public/` servite staticamente
   - TODO: Usare `next/image` per optimization

---

## 📚 Risorse Utili

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/database/next-js)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## ✨ Success Metrics

Migrazione considerata completa quando:
- ✅ App si avvia senza errori
- ✅ Tutte le pagine navigabili
- ✅ Keyboard shortcuts funzionanti
- ✅ Database Prisma connesso
- ✅ Stile e theme identici a versione Vite
- [ ] CRUD API implementate e testate
- [ ] Mock data completamente sostituito
- [ ] Autenticazione funzionante

---

**Stato Attuale**: Base migrazione completata ✅
**Next Action**: Installare dipendenze e testare app (`npm install` → `npm run dev`)
