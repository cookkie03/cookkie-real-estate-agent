# Frontend Migration TODO

## Obiettivo
Sostituire mockData con chiamate API reali al backend.

## Status
- ✅ API Client creato (`src/lib/api-client.ts`)
- ⏳ Componenti da migrare

## Files da Aggiornare

### 1. Dashboard Components

**File**: `src/app/page.tsx`
```typescript
// ❌ BEFORE
import { mockFeedEvents } from '@/lib/mockData'

// ✅ AFTER
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

const { data: activities } = useQuery({
  queryKey: ['activities'],
  queryFn: api.activities.getRecent
})
```

### 2. Properties Page

**File**: `src/app/immobili/page.tsx`
```typescript
// ❌ BEFORE
import { mockProperties } from '@/lib/mockData'

// ✅ AFTER
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

const { data: properties } = useQuery({
  queryKey: ['properties'],
  queryFn: api.properties.getAll
})
```

### 3. Clients Page

**File**: `src/app/clienti/page.tsx`
```typescript
// Stesso pattern per contacts
const { data: contacts } = useQuery({
  queryKey: ['contacts'],
  queryFn: api.contacts.getAll
})
```

### 4. Search/Chat Page

**File**: `src/app/search/page.tsx`
```typescript
// ❌ BEFORE
// Direct Gemini API call

// ✅ AFTER
import { aiApi } from '@/lib/api-client'

const response = await aiApi.chat(message)
```

## Quick Migration Script

```bash
# Find all mockData imports
cd frontend
grep -r "from '@/lib/mockData'" src/

# Replace with API client
# Manual replacement for each component
```

## Testing Checklist

- [ ] Dashboard loads with real data
- [ ] Properties page shows database properties
- [ ] Clients page shows database contacts
- [ ] Search/Chat calls AI backend
- [ ] CRUD operations work
- [ ] Error handling works

## Notes

- `mockData.ts` può rimanere per ora (dati statici UI)
- Migrare un componente alla volta
- Testare ogni componente dopo migrazione
- Backend deve essere running su porta 3001
