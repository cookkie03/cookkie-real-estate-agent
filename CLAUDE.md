# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRM Immobiliare is a comprehensive, single-user real estate management system for Italian real estate agents. The application provides complete property and client lifecycle management with AI-powered features including intelligent matching, RAG-based assistant, web scraping, interactive maps, and daily briefings.

**Tech Stack**: Next.js 14 (App Router) + TypeScript + Prisma + SQLite

**Current Phase**: Foundation - Next.js migration completed, ready for API implementation and database integration.

**Interface Language**: Italian

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Prisma commands
npm run prisma:generate    # Generate Prisma Client
npm run prisma:push        # Push schema to database
npm run prisma:studio      # Open Prisma Studio (DB GUI)
npm run prisma:seed        # Seed database with sample data
```

## Project Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Homepage (dashboard)
│   │   ├── providers.tsx       # React Query + UI providers
│   │   ├── globals.css         # Global styles + CSS variables
│   │   ├── search/page.tsx     # Search page
│   │   ├── agenda/page.tsx     # Calendar page
│   │   ├── actions/page.tsx    # Suggested actions
│   │   ├── map/page.tsx        # Interactive map
│   │   ├── connectors/page.tsx # Integrations
│   │   ├── settings/page.tsx   # Settings
│   │   └── not-found.tsx       # 404 page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (DO NOT edit manually)
│   │   ├── AISearchBar.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── MapPreview.tsx
│   │   └── ...                 # Feature components
│   ├── lib/
│   │   ├── db/
│   │   │   └── index.ts        # Prisma client singleton
│   │   ├── mockData.ts         # TEMPORARY: Mock data (to be replaced)
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   └── hooks/                  # Custom React hooks
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script
│   └── dev.db                  # SQLite database (generated)
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── CLAUDE.md                   # This file
├── README.md                   # Project documentation
├── MIGRATION_NOTES.md          # Migration details
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Core Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Prisma ORM + SQLite
- **State Management**: @tanstack/react-query (for async state/API calls)
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom theme
- **Forms**: react-hook-form + zod validation
- **Icons**: lucide-react

## Database Schema (Prisma)

### Models

**Immobile** (Property)
- Basic info: titolo, tipologia, prezzo, superficie, locali, bagni
- Location: indirizzo, città, cap, provincia, coordinates, zona
- Details: descrizione, caratteristiche (JSON), foto (array)
- Metadata: fonte, urlOriginale, stato
- Relations: matches

**Cliente** (Client)
- Personal: nome, cognome, email, telefono
- Preferences: tipologiaRichiesta, budgetMin/Max, superficieMin, localiMin, zoneInteresse
- Status: priorità, stato, note
- Relations: matches, azioni

**Match** (Property-Client Match)
- immobileId, clienteId
- score (0-100), motivi (JSON), stato
- Tracks AI-powered property-client matching

**Azione** (Action/Task)
- tipo, descrizione
- clienteId (optional link to client)
- priorità, stato, dataScadenza, completedAt
- Task management for follow-ups

### Database Notes
- SQLite stores JSON as strings (use `JSON.parse()/stringify()`)
- Arrays stored as stringified JSON
- All fields with `?` are optional
- Timestamps: `createdAt`, `updatedAt` auto-managed

## Key Architectural Patterns

### 1. Next.js App Router Structure

- **File-based routing**: Each folder in `src/app/` is a route
- **Server vs Client Components**:
  - Default: Server Components (no "use client")
  - Add `"use client"` for hooks, event handlers, browser APIs
- **Layout**: `layout.tsx` wraps all pages with providers
- **Metadata**: Set in `layout.tsx` or per-page

### 2. Navigation

**Router Hook**:
```typescript
"use client";
import { useRouter } from "next/navigation";

const router = useRouter();
router.push("/path");
```

**Links**:
```typescript
import Link from "next/link";
<Link href="/path">Text</Link>
```

**Search Params** (client components):
```typescript
import { useSearchParams } from "next/navigation";
const searchParams = useSearchParams();
const query = searchParams.get("q");
```

### 3. Data Fetching Pattern

**Current**: Mock data from `lib/mockData.ts`

**Target**: React Query + API Routes
```typescript
// Hook (src/hooks/useImmobili.ts)
export function useImmobili() {
  return useQuery({
    queryKey: ['immobili'],
    queryFn: () => fetch('/api/immobili').then(r => r.json())
  });
}

// Component
function ImmobiliList() {
  const { data, isLoading, error } = useImmobili();
  // render...
}
```

### 4. API Routes (To Be Created)

Create in `src/app/api/[resource]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const items = await prisma.immobile.findMany();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Validate with Zod
  const item = await prisma.immobile.create({ data: body });
  return NextResponse.json(item);
}
```

### 5. Component Organization

- **shadcn/ui components** (`src/components/ui/`): DO NOT edit manually
  - Added via: `npx shadcn@latest add <component>`
- **Feature components** (`src/components/`): Custom application components
  - Use `"use client"` when needed (hooks, events, etc.)

### 6. Styling System

**Tailwind Config**: Custom theme in `tailwind.config.ts`
- Custom colors (primary, accent, success, warning, etc.)
- Custom gradients (gradient-primary, gradient-accent, gradient-subtle)
- Custom shadows and animations
- Responsive breakpoints: mobile-first, lg, xl

**CSS Variables**: Defined in `src/app/globals.css`
- Light and dark theme support (`.dark` class)
- HSL color system for easy theming

**Animations**:
- fade-in, fade-in-up, scale-in, slide-in-right, pulse-glow
- Use: `className="animate-fade-in"`

### 7. Keyboard Shortcuts (Preserved)

- `Cmd/Ctrl + K`: Open Command Palette
- `s`: Focus search (when not in input)
- `g`: Navigate to Agenda
- `a`: Navigate to Actions
- `m`: Navigate to Map

Implemented in `src/app/page.tsx` with `useEffect` + event listeners.

## Development Guidelines

### Adding a New Page

1. Create folder in `src/app/[route-name]/`
2. Add `page.tsx`:
```typescript
"use client"; // if using hooks/events

export default function PageName() {
  return <div>Content</div>;
}
```
3. Navigation automatically works via file structure

### Adding a shadcn/ui Component

```bash
npx shadcn@latest add <component-name>
```
Component will be added to `src/components/ui/` automatically.

### Creating an API Endpoint

1. Create `src/app/api/[resource]/route.ts`
2. Export GET, POST, PUT, DELETE functions
3. Use Prisma for database operations
4. Validate input with Zod
5. Return `NextResponse.json(data)`

### Using Prisma

```bash
# After schema changes
npx prisma generate      # Regenerate client
npx prisma db push       # Apply to database
npx prisma studio        # View data in GUI
```

**Query Examples**:
```typescript
import { prisma } from '@/lib/db';

// Find all
const immobili = await prisma.immobile.findMany();

// Find one
const immobile = await prisma.immobile.findUnique({
  where: { id: "..." }
});

// Create
const newImmobile = await prisma.immobile.create({
  data: { /* ... */ }
});

// Update
const updated = await prisma.immobile.update({
  where: { id: "..." },
  data: { /* ... */ }
});

// Delete
await prisma.immobile.delete({
  where: { id: "..." }
});
```

## Immediate Next Steps

**Phase 1**: API Implementation (Week 1-2)
1. Create `/api/immobili` route (CRUD)
2. Create `/api/clienti` route (CRUD)
3. Create `/api/matches` route
4. Create `/api/azioni` route
5. Add Zod validation schemas

**Phase 2**: Replace Mock Data (Week 2-3)
1. Create React Query hooks for all resources
2. Replace `mockData.ts` imports with API calls
3. Add loading states and error handling

**Phase 3**: CRUD UIs (Week 3-4)
1. Create `/immobili` page with list and details
2. Create `/clienti` page with list and details
3. Add forms for create/edit operations
4. Implement file upload for property images

**Phase 4**: Authentication (Week 4)
1. Implement simple single-user auth
2. Add login page
3. Protect all routes with middleware

**Phase 5**: Advanced Features (Week 5-8)
- Matching algorithm implementation
- Interactive map with Leaflet
- Daily briefing generator
- RAG system with LlamaIndex + OpenRouter
- Web scraping modules

## Important Notes

### Path Aliases

The project uses `@/` for `src/`:
- `@/components/ui/button` → `src/components/ui/button`
- `@/lib/utils` → `src/lib/utils`

### Environment Variables

Required in `.env.local`:
```bash
DATABASE_URL="file:./dev.db"
# Add others as needed (OpenRouter API key, etc.)
```

### Responsive Design

Mobile-first approach:
- Mobile: Single column, bottom nav
- Tablet (lg): Two-column grid
- Desktop (xl): Sidebar navigation

Always test on different viewports.

### Italian Language

All UI text must be in Italian:
- Labels, buttons, placeholders
- Error messages, notifications
- Page titles, descriptions

### Mock Data

`src/lib/mockData.ts` is TEMPORARY. Replace with real API calls progressively.

## Common Patterns

### Client Component with Data Fetching
```typescript
"use client";

import { useImmobili } from "@/hooks/useImmobili";

export default function Page() {
  const { data, isLoading, error } = useImmobili();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return <div>{/* render data */}</div>;
}
```

### Server Component (Future)
```typescript
import { prisma } from "@/lib/db";

export default async function Page() {
  const immobili = await prisma.immobile.findMany();

  return <div>{/* render immobili */}</div>;
}
```

### Form with Validation
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  titolo: z.string().min(1),
  prezzo: z.number().positive(),
});

export default function FormPage() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    // API call
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>
    {/* form fields */}
  </form>;
}
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

## Project Status

✅ **Completed**:
- Next.js 14 migration with App Router
- Database schema and Prisma setup
- All UI components and pages migrated
- Styling system preserved
- Keyboard shortcuts working

🔄 **In Progress**:
- API routes implementation
- Mock data replacement
- Authentication system

📋 **Planned**:
- Advanced features (matching, RAG, scraping)
- Performance optimization
- Production deployment

---

Remember: This is a single-user, local-first application. Keep it simple, modular, and maintainable. Focus on one feature at a time, test thoroughly, commit often.
