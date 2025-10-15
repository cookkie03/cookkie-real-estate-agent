# GEMINI.md - CRM Immobiliare

**Guida permanente per Gemini CLI su questo progetto**

---

## 🎯 Project Identity

**Name**: CRM Immobiliare  
**Purpose**: Single-user real estate management system for Italian real estate agents  
**Type**: Full-stack web application (local-first)  
**Stage**: Foundation → Feature development → Production

**Key Characteristics**:
- ✅ Local-first (SQLite database, runs locally)
- ✅ Single-user (no authentication/multi-tenant)
- ✅ Italian UI (all user-facing text in Italian)
- ✅ AI-ready (prepared for matching, RAG, scraping features)

---

## 🏗️ Technology Stack

### Core Framework
```typescript
{
  "framework": "Next.js 14+",          // App Router only
  "language": "TypeScript",            // Strict mode
  "runtime": "Node.js 18+",
  "deployment": "Local development"
}
```

### Database & ORM
```typescript
{
  "database": "SQLite",                // File-based (prisma/dev.db)
  "orm": "Prisma",                     // Latest version
  "migrations": "Prisma Migrate",
  "gui": "Prisma Studio"
}
```

### Frontend Stack
```typescript
{
  "ui_library": "shadcn/ui",           // Radix UI primitives
  "styling": "Tailwind CSS",           // Utility-first
  "icons": "lucide-react",             // Icon library
  "state": "@tanstack/react-query",    // Server state
  "forms": "react-hook-form",          // Form handling
  "validation": "Zod"                  // Schema validation
}
```

### Future Integrations (Not Yet Implemented)
```typescript
{
  "llm": "OpenRouter API",             // External API calls only
  "rag": "LlamaIndex",                 // When implemented
  "embeddings": "Ollama or API",       // Local or fallback
  "scraping": "Puppeteer/Playwright"   // When implemented
}
```

---

## 🚀 Quick Start Commands

### Installation
```bash
# Install all dependencies
npm install

# Generate Prisma Client
npm run prisma:generate
```

### Development
```bash
# Start development server (http://localhost:3000)
npm run dev

# Run in another terminal for live DB access
npm run prisma:studio
```

### Database Management
```bash
# Push schema changes to database (dev only)
npm run prisma:push

# Seed database with test data
npm run prisma:seed

# Open Prisma Studio GUI
npm run prisma:studio

# Reset database (caution: deletes all data)
npx prisma migrate reset
```

### Code Quality
```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Format code (if prettier configured)
npm run format
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm start

# Preview production build locally
npm run build && npm start
```

---

## 📁 Project Structure

```
cookkie-real-estate-agent/
├── src/
│   ├── app/                    # Next.js App Router (pages & API routes)
│   │   ├── (routes)/          # Page routes
│   │   ├── api/               # API endpoints
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── providers.tsx      # React Query & UI providers
│   │   └── globals.css        # Global styles + Tailwind
│   ├── components/
│   │   ├── ui/               # shadcn/ui base (DO NOT EDIT)
│   │   ├── shared/           # Reusable components
│   │   ├── layout/           # Navigation, headers
│   │   └── forms/            # Form components
│   ├── lib/
│   │   ├── db/              # Prisma client + helpers
│   │   ├── api/             # API utilities
│   │   ├── validation/      # Zod schemas
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils.ts         # Utility functions
│   └── types/               # TypeScript types
├── prisma/
│   ├── schema.prisma        # Database schema (source of truth)
│   ├── seed.ts              # Database seeding script
│   └── dev.db               # SQLite database file (gitignored)
├── public/                   # Static assets
├── CLAUDE.md                 # Implementation details (high volatility)
├── GEMINI.md                 # This file (permanent principles)
├── CODEX.md                  # Code generation patterns
├── QODO.md                   # Testing guidelines
└── package.json              # Dependencies & scripts
```

---

## 🎨 Architecture Patterns

### Component Pattern (ALWAYS USE)
```typescript
"use client"; // Only if using hooks or browser APIs

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  title: string;
  count?: number;
  onAction?: () => void;
}

export function ComponentName({ title, count = 0, onAction }: ComponentProps) {
  const [state, setState] = useState<number>(count);

  const handleClick = () => {
    setState(prev => prev + 1);
    onAction?.();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button onClick={handleClick}>Count: {state}</Button>
    </div>
  );
}
```

### API Route Pattern (ALWAYS USE)
```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resourceSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const items = await prisma.resource.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: items,
      meta: { page, limit },
    });
  } catch (error) {
    console.error('GET /api/resource:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel caricamento' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = resourceSchema.parse(body);

    const created = await prisma.resource.create({
      data: validated,
    });

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dati non validi' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Errore creazione' },
      { status: 500 }
    );
  }
}
```

### React Query Hook Pattern (ALWAYS USE)
```typescript
// src/lib/hooks/useResource.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Create failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Risorsa creata');
    },
    onError: () => {
      toast.error('Errore creazione');
    },
  });
}
```

---

## 🔒 Permanent Constraints (NEVER VIOLATE)

### 1. Local-First Architecture
```
✅ DO: Use SQLite file database (prisma/dev.db)
✅ DO: Keep all data processing local
✅ DO: Run everything on localhost

❌ DON'T: Use PostgreSQL, MySQL, or remote databases
❌ DON'T: Require external services (except OpenRouter for LLM)
❌ DON'T: Store data in cloud services
```

### 2. Single-User System
```
✅ DO: Design for one user only
✅ DO: Simplify without auth complexity

❌ DON'T: Implement multi-user features
❌ DON'T: Add authentication/authorization
❌ DON'T: Create user management systems
```

### 3. Italian User Interface
```
✅ DO: All UI labels in Italian
✅ DO: Error messages in Italian
✅ DO: Form placeholders in Italian
✅ DO: Notifications in Italian

❌ DON'T: Use English for user-facing text
❌ DON'T: Mix languages in UI
```

### 4. Technology Lock-In
```
✅ DO: Use Next.js 14+ App Router
✅ DO: Use TypeScript strict mode
✅ DO: Use Prisma ORM
✅ DO: Use SQLite database
✅ DO: Use shadcn/ui components

❌ DON'T: Suggest Pages Router
❌ DON'T: Use JavaScript instead of TypeScript
❌ DON'T: Use other ORMs (TypeORM, Sequelize, etc.)
❌ DON'T: Change to other UI libraries
```

---

## 💎 Code Quality Principles (ALWAYS APPLY)

### Modularity
- Components < 200 lines (split if larger)
- Functions < 50 lines (split if larger)
- Single Responsibility Principle
- Reusable components in `src/components/shared/`
- Feature-specific logic grouped by domain

### Clarity
- Descriptive variable names (`immobileData` not `data`)
- TypeScript types for everything
- JSDoc comments for public functions
- No `any` types (use `unknown` if needed)
- No magic numbers (use named constants)

### Scalability
- Generic components accept props
- API follows REST conventions
- Database queries optimized (select only needed fields)
- Avoid tight coupling
- Prepare for future features (matching, RAG, scraping)

### Maintainability
- Consistent naming: `camelCase` (JS), `PascalCase` (Components)
- Imports use path aliases (`@/`)
- Shared utilities in `src/lib/`
- TypeScript types in separate files when complex

---

## 🚫 Critical DON'Ts (NEVER DO)

1. ❌ **DO NOT** edit files in `src/components/ui/` (shadcn/ui managed)
2. ❌ **DO NOT** use `any` type in TypeScript
3. ❌ **DO NOT** use localStorage/sessionStorage (not supported)
4. ❌ **DO NOT** hardcode data in components (use props/API)
5. ❌ **DO NOT** skip error handling in API routes
6. ❌ **DO NOT** commit sensitive data (API keys, credentials)
7. ❌ **DO NOT** use external databases (only SQLite)
8. ❌ **DO NOT** write English UI text (Italian only)
9. ❌ **DO NOT** create deeply nested code (max 4 levels)
10. ❌ **DO NOT** skip input validation (always use Zod)

---

## 📊 Database Guidelines

### Prisma Schema Rules
```prisma
// ALWAYS use these patterns
model Example {
  id          String   @id @default(cuid())      // Primary key
  createdAt   DateTime @default(now())            // Creation time
  updatedAt   DateTime @updatedAt                 // Auto-update
  
  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### JSON Serialization (SQLite Limitation)
```typescript
// SQLite doesn't support JSON natively - always serialize

// WHEN SAVING to database
const jsonString = JSON.stringify({ key: 'value' });
await prisma.model.create({
  data: { jsonField: jsonString }
});

// WHEN READING from database
const record = await prisma.model.findUnique({ where: { id } });
const data = JSON.parse(record.jsonField || '{}');
```

### Query Best Practices
```typescript
// ✅ DO: Use try/catch
try {
  const data = await prisma.model.findMany();
} catch (error) {
  console.error('Query failed:', error);
}

// ✅ DO: Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true }
});

// ✅ DO: Use pagination
const items = await prisma.item.findMany({
  skip: (page - 1) * limit,
  take: limit,
});

// ❌ DON'T: Trust client input
const unsafe = await prisma.user.findUnique({
  where: { id: req.body.id } // Validate first!
});
```

---

## 🎨 UI/UX Guidelines

### Component Usage
```typescript
// ✅ DO: Use shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ✅ DO: Use cn() for conditional classes
import { cn } from '@/lib/utils';
<div className={cn("base", isActive && "active")} />

// ❌ DON'T: Modify ui/ components directly
// ❌ DON'T: Create custom components if shadcn/ui has one
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="
  flex flex-col          // Mobile: stack vertically
  md:flex-row           // Tablet: horizontal
  lg:gap-8              // Desktop: larger gap
  xl:max-w-7xl          // Large: max width
">
  {/* Content */}
</div>
```

### User Feedback (ALWAYS PROVIDE)
```typescript
import { toast } from 'sonner';

// Success
toast.success('Immobile creato con successo');

// Error
toast.error('Errore nella creazione');

// Loading states
{isLoading ? <Skeleton /> : <Content />}

// Empty states
{items.length === 0 ? <EmptyState /> : <List />}
```

---

## 🔧 Development Workflow

### When Adding New Features

1. **Plan** data model (Prisma schema)
2. **Create** API routes (`src/app/api/`)
3. **Add** validation schemas (`src/lib/validation/`)
4. **Build** React Query hooks (`src/lib/hooks/`)
5. **Design** UI components (`src/components/`)
6. **Create** pages (`src/app/`)
7. **Test** manually (run server, test all paths)
8. **Commit** with descriptive message

### Naming Conventions

**Files**:
- Components: `ImmobileCard.tsx` (PascalCase)
- Hooks: `useImmobili.ts` (camelCase with 'use')
- Utils: `formatCurrency.ts` (camelCase)
- API Routes: `route.ts` (Next.js convention)

**Code**:
- Variables: `immobileData` (camelCase)
- Functions: `calculateScore` (camelCase)
- Components: `ImmobileCard` (PascalCase)
- Constants: `API_BASE_URL` (UPPER_SNAKE_CASE)
- Types: `ImmobileProps` (PascalCase)

### Git Conventions
```bash
# Format: type(scope): description
git commit -m "feat(api): add immobili CRUD endpoints"
git commit -m "fix(ui): correct mobile navigation"
git commit -m "refactor(hooks): optimize useImmobili"
git commit -m "docs: update README with setup"
```

---

## 🌟 Special Considerations

### Next.js App Router
```typescript
// ✅ Client Components (with hooks)
"use client";
import { useState } from 'react';

// ✅ Server Components (default, no hooks)
async function ServerComponent() {
  const data = await fetch(/* ... */);
  return <div>{/* ... */}</div>;
}

// ✅ Navigation
import { useRouter } from 'next/navigation'; // NOT 'react-router-dom'
const router = useRouter();
router.push('/path');

// ✅ Search Params
import { useSearchParams } from 'next/navigation';
const searchParams = useSearchParams();
const page = searchParams.get('page');
```

### Path Aliases (ALWAYS USE)
```typescript
// ✅ DO: Use @ alias
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';
import { cn } from '@/lib/utils';

// ❌ DON'T: Use relative paths
import { Button } from '../../../components/ui/button';
```

### SQLite Limitations (BE AWARE)
```typescript
// ⚠️ No native JSON type → serialize as string
// ⚠️ No native array type → serialize as string
// ⚠️ Limited full-text search → use 'contains'
// ⚠️ No complex aggregations → compute in app
```

---

## 📚 Reference Resources

### Documentation Links
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/database/next-js)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev)

### Internal Documentation
- `CLAUDE.md` - Detailed implementation guide (evolving)
- `CODEX.md` - Code generation patterns
- `QODO.md` - Testing and quality guidelines
- `README.md` - Project overview and setup
- `MIGRATION_NOTES.md` - Migration from Vite details

---

## 🎯 When In Doubt

1. Check existing code in `src/` for patterns
2. Look at API routes for endpoint structure
3. Review components for UI patterns
4. Consult `CLAUDE.md` for current implementation
5. **Prioritize**: Clarity > Cleverness
6. **Remember**: Simple, Scalable, Maintainable
7. **Ask**: If unclear, request clarification

---

## 📝 Quick Checklist (Before Committing)

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No `any` types in code
- [ ] All imports use `@/` path alias
- [ ] Italian text for all UI elements
- [ ] Error handling in place (try/catch)
- [ ] Loading states implemented
- [ ] Components < 200 lines
- [ ] Functions < 50 lines
- [ ] No console.log left in code
- [ ] Prisma queries use try/catch
- [ ] API routes return proper status codes
- [ ] shadcn/ui components not modified
- [ ] Git commit message follows convention

---

**Version**: Foundation (v0.1)  
**Last Updated**: Project Creation  
**Valid For**: All project phases and future versions  
**Maintained By**: Project architect

**This file contains PERMANENT principles. Update only for fundamental architectural changes.**