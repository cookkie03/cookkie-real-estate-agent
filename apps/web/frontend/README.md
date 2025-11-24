# Frontend UI - CRM Immobiliare

**Next.js 14 App Router** - Interface utente per CRM Immobiliare

**Port**: 3000

---

## 🚀 Quick Start

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp ../config/frontend.env.example .env.local

# Configure .env.local (set API URLs, etc.)

# Start development server
npm run dev
```

Applicazione disponibile su: http://localhost:3000

---

## 📦 Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS + Custom theme
- **State Management**: @tanstack/react-query
- **Forms**: react-hook-form + zod
- **Icons**: lucide-react
- **Runtime**: Node.js 20+

---

## 📁 Struttura

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Homepage (Dashboard)
│   │   ├── layout.tsx        # Root layout
│   │   ├── providers.tsx     # React Query + UI providers
│   │   ├── globals.css       # Global styles
│   │   ├── search/           # AI Search page
│   │   ├── agenda/           # Calendar page
│   │   ├── actions/          # Suggested actions
│   │   ├── immobili/         # Properties page
│   │   ├── clienti/          # Clients page
│   │   ├── map/              # Interactive map
│   │   ├── connectors/       # Integrations
│   │   ├── settings/         # Settings page
│   │   ├── tool/             # Tool dashboard
│   │   ├── api/              # API routes (proxy)
│   │   │   ├── health/
│   │   │   ├── chat/
│   │   │   └── ai/
│   │   └── not-found.tsx     # 404 page
│   │
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (auto-generated)
│   │   ├── features/         # Feature-specific components
│   │   │   ├── dashboard/
│   │   │   ├── immobili/
│   │   │   ├── clienti/
│   │   │   └── chat/
│   │   ├── layouts/          # Layout components
│   │   │   ├── CommandPalette.tsx
│   │   │   └── AISearchBar.tsx
│   │   └── common/           # Shared components
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useImmobili.ts
│   │   ├── useClienti.ts
│   │   └── useMatches.ts
│   │
│   ├── lib/                  # Utilities
│   │   ├── utils.ts          # Utility functions (cn, etc.)
│   │   ├── mockData.ts       # Mock data (temporary)
│   │   └── api-client.ts     # API client
│   │
│   └── types/                # TypeScript types
│
├── public/                   # Static assets
├── .env.local                # Environment variables (git-ignored)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── README.md                 # This file
```

---

## 🎨 Features

### Dashboard
- Statistiche real-time
- Activity feed
- Mini agenda
- Map preview
- Intel toolkit

### AI Search
- RAG-powered search bar
- Chat interface con AI assistant
- Database query naturale

### Gestione Immobili
- Lista immobili
- Dettagli completi
- Filtri avanzati
- Form CRUD

### Gestione Clienti
- Lista clienti
- Profili dettagliati
- Richieste associate
- Priority management

### Matching AI
- Property-client matching
- Score automatico
- Motivi matching
- Suggestions

### Mappa Interattiva
- Visualizzazione geografica
- Marker properties
- Cluster zones
- Filters

### Command Palette
- **Shortcut**: `Cmd/Ctrl + K`
- Quick navigation
- Search properties/clients
- Execute actions

---

## ⚙️ Configuration

### Environment Variables

**File**: `.env.local`
**Template**: `../config/frontend.env.example`

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# AI Tools API URL
NEXT_PUBLIC_AI_URL=http://localhost:8000

# Google AI (optional)
NEXT_PUBLIC_GOOGLE_API_KEY=""

# Environment
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

---

## 🛠️ Development

### Scripts NPM

```bash
# Development (porta 3000)
npm run dev

# Build production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Adding shadcn/ui Components

```bash
# Add new component
npx shadcn@latest add <component-name>

# Example
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

Components will be added to `src/components/ui/` automatically.

**DO NOT** edit files in `src/components/ui/` manually!

---

## 🎨 Styling

### Tailwind CSS

Custom theme in `tailwind.config.ts`:

```typescript
// Custom colors
colors: {
  primary: { ... },
  accent: { ... },
  success: { ... },
  warning: { ... }
}

// Custom animations
animation: {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'scale-in': 'scaleIn 0.3s ease-out'
}
```

### CSS Variables

Defined in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Using Styles

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  "hover:bg-primary",
  isActive && "active-class"
)} />
```

---

## 🔗 API Integration

### Using API Client

```typescript
// src/lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchProperties() {
  const res = await fetch(`${API_URL}/api/properties`);
  return res.json();
}
```

### Using React Query Hooks

```typescript
// src/hooks/useImmobili.ts
import { useQuery } from '@tanstack/react-query';

export function useImmobili() {
  return useQuery({
    queryKey: ['immobili'],
    queryFn: fetchProperties
  });
}

// In component
const { data, isLoading, error } = useImmobili();
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `s` | Focus Search (when not in input) |
| `g` | Navigate to Agenda |
| `a` | Navigate to Actions |
| `m` | Navigate to Map |

Implemented in `src/app/page.tsx` with `useEffect`.

---

## 🧪 Testing

```bash
# Unit tests (future)
npm test

# Component tests (future)
npm run test:components

# E2E tests (future)
npm run test:e2e
```

---

## 🐳 Docker

### Build Image

```bash
docker build -t crm-frontend .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://backend:3001" \
  -e NEXT_PUBLIC_AI_URL="http://ai-tools:8000" \
  crm-frontend
```

### Docker Compose

```bash
# From project root
docker-compose -f config/docker-compose.yml up frontend
```

---

## 🎯 Adding New Pages

### 1. Create Route Folder

```bash
mkdir -p src/app/mypage
```

### 2. Add page.tsx

```typescript
// src/app/mypage/page.tsx
"use client"; // if using hooks/events

export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
    </div>
  );
}
```

### 3. Navigation Automatic

File-based routing works automatically.

Access at: `http://localhost:3000/mypage`

---

## 🔒 Security

### Environment Variables
- ❌ **MAI** committare `.env.local`
- ✅ Usa `../config/frontend.env.example` come template
- ✅ `.env.local` è git-ignored

### NEXT_PUBLIC_ Variables
Only variables prefixed with `NEXT_PUBLIC_` are accessible in browser.

**Private**:
```bash
DATABASE_URL="..."  # ❌ Not accessible in browser
```

**Public**:
```bash
NEXT_PUBLIC_API_URL="..."  # ✅ Accessible in browser
```

---

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### "API connection refused"
```bash
# Verify backend is running
curl http://localhost:3001/api/health

# Start backend
cd ../backend
npm run dev
```

### "Module not found"
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

### "Tailwind classes not applying"
```bash
# Check tailwind.config.ts content paths
content: [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
]
```

---

## 📖 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Radix UI Docs](https://www.radix-ui.com)

---

**Version**: 2.0.0
**Last Updated**: 2025-10-17
