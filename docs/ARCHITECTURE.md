# 🏗️ Architecture - CRM Immobiliare

Architettura completa del sistema CRM Immobiliare.

## Overview

Sistema modulare multi-linguaggio con separazione netta tra:
- **Frontend** (Next.js + TypeScript)
- **Backend API** (Next.js API Routes + TypeScript)
- **AI Tools** (Python + FastAPI + DataPizza AI)
- **Scraping** (Python standalone)
- **Database** (SQLite + Prisma + SQLAlchemy)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    http://localhost:3000                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/REST
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│                  React + TypeScript + shadcn/ui              │
│                      Port: 3000                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
┌───────────────────┐   ┌──────────────────────────┐
│   Backend API     │   │      AI Tools API        │
│  (Next.js API)    │   │   (FastAPI + Python)     │
│  Port: 3001       │   │     Port: 8000           │
│                   │   │                          │
│  - CRUD APIs      │   │  - RAG Assistant         │
│  - Validation     │   │  - Matching Agent        │
│  - Auth (future)  │   │  - Briefing Agent        │
└─────────┬─────────┘   └──────────┬───────────────┘
          │                        │
          │    ┌───────────────────┘
          │    │
          ▼    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│              SQLite (dev) / PostgreSQL (prod)                │
│                                                              │
│  Prisma ORM (TypeScript) + SQLAlchemy (Python)              │
│                                                              │
│  Models: Property, Contact, Request, Match, Activity, etc.  │
└─────────────────────────────────────────────────────────────┘
                        ▲
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                   Scraping Module                            │
│                   (Python standalone)                        │
│                                                              │
│  Scrapers: Immobiliare.it, Casa.it, Idealista.it           │
│  Scheduling: APScheduler (daily/weekly)                     │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Module

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- React 18
- shadcn/ui (Radix UI)
- Tailwind CSS
- React Query (TanStack Query)

**Directory Structure:**
```
frontend/
├── src/
│   ├── app/                  # Pages (App Router)
│   │   ├── page.tsx          # Homepage
│   │   ├── search/           # AI Search page
│   │   ├── agenda/           # Calendar
│   │   ├── immobili/         # Properties management
│   │   ├── clienti/          # Clients management
│   │   └── ...
│   │
│   ├── components/           # React Components
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── features/         # Feature components
│   │   │   ├── dashboard/
│   │   │   ├── immobili/
│   │   │   └── clienti/
│   │   └── layouts/          # Layout components
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useProperties.ts
│   │   ├── useContacts.ts
│   │   └── useAIChat.ts
│   │
│   └── lib/                  # Utilities
│       ├── api-client.ts     # API client (fetch/axios)
│       └── utils.ts
```

**Communication:**
- Backend API: HTTP REST (port 3001)
- AI Tools API: HTTP REST (port 8000)
- State: React Query (cache + refetch)

### 2. Backend API Module

**Tech Stack:**
- Next.js 14 API Routes
- TypeScript
- Prisma ORM
- Zod (validation)

**Directory Structure:**
```
backend/
├── src/
│   ├── app/api/              # API Routes
│   │   ├── properties/
│   │   │   └── route.ts      # GET, POST /api/properties
│   │   ├── contacts/
│   │   │   └── route.ts      # GET, POST /api/contacts
│   │   ├── requests/
│   │   ├── matches/
│   │   └── activities/
│   │
│   └── lib/
│       ├── db/               # Database layer
│       │   ├── index.ts      # Prisma client
│       │   └── helpers.ts    # Query helpers
│       │
│       └── validation/       # Zod schemas
│           └── schemas.ts
```

**API Pattern:**
```typescript
// src/app/api/properties/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { propertySchema } from '@/lib/validation/schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  const properties = await prisma.property.findMany({
    where: city ? { city } : {},
    include: { owner: true }
  });

  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Validate
  const validated = propertySchema.parse(body);

  // Create
  const property = await prisma.property.create({
    data: validated
  });

  return NextResponse.json(property, { status: 201 });
}
```

### 3. AI Tools Module

**Tech Stack:**
- FastAPI
- Python 3.11+
- DataPizza AI Framework
- Google Gemini API
- SQLAlchemy
- Qdrant (vector store)

**Directory Structure:**
```
ai_tools/
├── app/
│   ├── agents/               # AI Agents
│   │   ├── rag_assistant.py      # Chat con DB access
│   │   ├── matching_agent.py     # Property-Request matching
│   │   └── briefing_agent.py     # Daily briefing
│   │
│   ├── tools/                # Custom Tools
│   │   ├── db_query_tool.py
│   │   ├── property_search_tool.py
│   │   └── contact_search_tool.py
│   │
│   ├── routers/              # API Endpoints
│   │   ├── chat.py           # POST /ai/chat
│   │   ├── matching.py       # POST /ai/matching/run
│   │   └── briefing.py       # POST /ai/briefing/generate
│   │
│   ├── config.py             # Pydantic settings
│   ├── database.py           # DB connection
│   └── models.py             # Pydantic models
│
└── main.py                   # FastAPI app
```

**Agent Pattern:**
```python
from datapizza_ai import Agent
from app.tools.db_query_tool import DBQueryTool

rag_agent = Agent(
    name="RAG Assistant",
    description="AI assistant con accesso database immobiliare",
    tools=[
        DBQueryTool(),
        PropertySearchTool(),
        ContactSearchTool()
    ],
    llm=google_llm,
    temperature=0.7
)

# Usage
response = await rag_agent.run(
    "Mostrami tutti gli appartamenti a Milano sotto 200k"
)
```

### 4. Scraping Module

**Tech Stack:**
- Python 3.11+
- httpx (async HTTP)
- BeautifulSoup4 (parsing)
- APScheduler (scheduling)

**Directory Structure:**
```
scraping/
├── portals/                  # Portal scrapers
│   ├── base_scraper.py       # Base class
│   ├── immobiliare_it.py
│   ├── casa_it.py
│   └── idealista_it.py
│
├── common/                   # Shared utilities
│   ├── cache.py              # Cache manager
│   ├── rate_limiter.py       # Rate limiting
│   └── validators.py         # Data validation
│
├── config.py                 # Settings
└── cli.py                    # CLI interface
```

**Scraper Pattern:**
```python
from scraping.portals.base_scraper import BaseScraper

class ImmobiliareItScraper(BaseScraper):
    portal_name = "immobiliare_it"
    base_url = "https://www.immobiliare.it"
    rate_limit = 1.0

    def scrape_search(self, city: str, **kwargs):
        # Fetch search results
        html = self.fetch(f"{self.base_url}/vendita/{city}")

        # Parse listings
        listings = self.parse_listing_list(html)

        # Save to database
        for listing in listings:
            self.save_to_database(listing)

        return listings
```

### 5. Database Layer

**Tech Stack:**
- SQLite (development)
- PostgreSQL (production - future)
- Prisma ORM (TypeScript)
- SQLAlchemy (Python)

**Schema:**
```prisma
model Property {
  id       String @id @default(cuid())
  code     String @unique

  // Location
  city     String
  address  String
  lat      Float
  lon      Float

  // Details
  price    Float
  sqm      Float
  rooms    Int

  // Relations
  owner    Contact? @relation(...)
  matches  Match[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Contact {
  id         String @id @default(cuid())
  fullName   String
  email      String
  phone      String

  // Relations
  properties Property[]
  requests   Request[]
  matches    Match[]
}

model Match {
  id          String @id
  propertyId  String
  requestId   String

  scoreTotal  Int  // 0-100
  status      String

  property    Property @relation(...)
  request     Request @relation(...)
}
```

**Access Patterns:**

*TypeScript (Backend):*
```typescript
import { prisma } from '@/lib/db';

const properties = await prisma.property.findMany({
  where: {
    city: 'Milano',
    priceSale: { lte: 200000 }
  },
  include: { owner: true }
});
```

*Python (AI Tools):*
```python
from sqlalchemy.orm import Session
from database.python.models import Property

properties = session.query(Property)\
    .filter(Property.city == 'Milano')\
    .filter(Property.price_sale <= 200000)\
    .all()
```

## Communication Patterns

### Frontend → Backend API

**Protocol**: HTTP REST
**Format**: JSON

```typescript
// Frontend
const properties = await fetch('http://localhost:3001/api/properties')
  .then(r => r.json());

// Backend
export async function GET() {
  const data = await prisma.property.findMany();
  return NextResponse.json(data);
}
```

### Frontend → AI Tools

**Protocol**: HTTP REST
**Format**: JSON

```typescript
// Frontend
const response = await fetch('http://localhost:8000/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Mostrami immobili a Milano"
  })
});

const result = await response.json();
```

### AI Tools → Database

**Protocol**: SQL (via SQLAlchemy)

```python
# Direct SQL access
from app.database import get_db_session

session = get_db_session()
properties = session.query(Property).filter_by(city='Milano').all()
```

### Scraping → Database

**Protocol**: SQL (via SQLite3 o SQLAlchemy)

```python
# Insert scraped data
property = Property(
    code=generate_code(),
    source='web_scraping',
    sourceUrl=listing_url,
    city='Milano',
    price=200000,
    ...
)
session.add(property)
session.commit()
```

## Data Flow

### 1. User Query Flow (AI Search)

```
User (Browser)
    │
    │ 1. Enter query: "Appartamenti a Milano sotto 200k"
    ▼
Frontend (React)
    │
    │ 2. POST /ai/chat {"message": "..."}
    ▼
AI Tools (FastAPI)
    │
    │ 3. Agent processes with LLM
    │ 4. Agent calls DBQueryTool
    ▼
Database (SQLite)
    │
    │ 5. Query: SELECT * FROM properties WHERE city='Milano' AND price < 200000
    │ 6. Returns results
    ▼
AI Tools (FastAPI)
    │
    │ 7. LLM formats response in Italian
    ▼
Frontend (React)
    │
    │ 8. Display formatted response
    ▼
User (Browser)
```

### 2. CRUD Flow (Create Property)

```
User (Browser)
    │
    │ 1. Fill property form
    ▼
Frontend (React)
    │
    │ 2. POST /api/properties {"title": "...", "price": 200000, ...}
    ▼
Backend API (Next.js)
    │
    │ 3. Validate with Zod
    │ 4. prisma.property.create(...)
    ▼
Database (SQLite)
    │
    │ 5. INSERT INTO properties ...
    │ 6. Return created record
    ▼
Backend API
    │
    │ 7. Return JSON response
    ▼
Frontend (React)
    │
    │ 8. Update UI, show success
    ▼
User (Browser)
```

### 3. Scraping Flow

```
Scheduler (Cron/APScheduler)
    │
    │ 1. Trigger daily at 06:00
    ▼
Scraping Module
    │
    │ 2. ImmobiliareItScraper.scrape_city('Milano')
    │ 3. Fetch search results (with rate limiting)
    │ 4. Parse HTML → extract listings
    │ 5. Validate data
    ▼
Database (SQLite)
    │
    │ 6. INSERT new properties
    │ 7. Mark source='web_scraping', verified=false
    ▼
(Properties now available in system)
```

### 4. Matching Flow

```
Backend API
    │
    │ 1. New Request created by user
    ▼
AI Tools (Matching Agent)
    │
    │ 2. POST /ai/matching/run {"request_id": "req_123"}
    │ 3. Agent fetches request details
    │ 4. Agent queries candidate properties
    │ 5. Calculate multi-dimensional scores
    │ 6. Generate reasoning for each match
    ▼
Database (SQLite)
    │
    │ 7. INSERT INTO matches (request_id, property_id, score, ...)
    ▼
Backend API
    │
    │ 8. Fetch matches for display
    ▼
Frontend (React)
    │
    │ 9. Show matched properties to user
    ▼
User (Browser)
```

## Security Architecture

### Authentication (Future)

```
User Login
    ↓
JWT Token issued
    ↓
Token stored in httpOnly cookie
    ↓
Every API request includes cookie
    ↓
Middleware validates token
    ↓
Request processed if valid
```

### Data Privacy (GDPR)

- **Privacy flags** in Contact model
- **Audit log** tracks all changes
- **Anonymization** for exports
- **Consent tracking** per contact

### API Security

- **Rate limiting** on all endpoints
- **Input validation** with Zod/Pydantic
- **SQL injection** prevented by ORM
- **CORS** configured properly

## Performance Considerations

### Caching

```
Frontend (React Query)
    ↓ Cache: 5 minutes
Backend API
    ↓ No cache (fresh data)
Database
    ↓ SQLite caching
AI Tools
    ↓ Cache: LLM responses, embeddings
Scraping
    ↓ Cache: 24 hours (file-based)
```

### Database Indexes

```sql
-- Optimized queries
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(priceSale);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_contacts_fullname ON contacts(fullName);
CREATE INDEX idx_matches_score ON matches(scoreTotal);
```

### Lazy Loading

- **Frontend**: React Query infinite scroll
- **Backend**: Cursor-based pagination
- **Images**: Next.js Image optimization

## Deployment Architecture

### Development

```
Local Machine
├── Frontend: localhost:3000
├── Backend: localhost:3001
├── AI Tools: localhost:8000
└── Database: ./database/prisma/dev.db
```

### Production (Docker)

```
Docker Host
├── nginx (reverse proxy) :80/:443
│   ├── /          → frontend:3000
│   ├── /api       → backend:3001
│   └── /ai        → ai_tools:8000
│
├── frontend (container)
├── backend (container)
├── ai_tools (container)
├── database (volume)
└── logs (volume)
```

### Cloud Deployment (Future)

```
Cloud Provider (AWS/GCP/Azure)
├── Load Balancer
├── Frontend (Cloud Run / App Service)
├── Backend (Cloud Run / App Service)
├── AI Tools (Cloud Run / App Service)
├── Database (Cloud SQL / RDS)
└── Storage (S3 / Cloud Storage)
```

## Monitoring & Observability

### Logging

```
All Modules
    ↓ structured logs (JSON)
logs/
├── backend/app.log
├── ai_tools/ai.log
├── scraping/scraper.log
└── frontend/access.log
```

### Tracing (OpenTelemetry)

```
Request → Frontend
    ↓ trace_id: abc123
  → Backend API
    ↓ trace_id: abc123
  → AI Tools
    ↓ trace_id: abc123
  → Database
```

### Metrics

- Request/response times
- Error rates
- Database query performance
- LLM token usage
- Scraping success rate

## Scalability

### Horizontal Scaling

- **Frontend**: Stateless, can run multiple instances
- **Backend**: Stateless, can run multiple instances
- **AI Tools**: Stateless, can run multiple instances
- **Database**: Single instance (SQLite) → migrate to PostgreSQL for scaling

### Vertical Scaling

- **Frontend**: CPU-bound (SSR)
- **Backend**: I/O-bound (database queries)
- **AI Tools**: CPU/Memory-bound (LLM inference)

### Future Improvements

1. **Database**: SQLite → PostgreSQL (production)
2. **Caching**: Add Redis layer
3. **Queue**: Add job queue (BullMQ/Celery) for async tasks
4. **CDN**: Static assets on CDN
5. **Microservices**: Split further if needed

---

**Architecture aggiornata:** 2025-01-17
**Versione:** 2.0.0 (riorganizzazione modulare)
