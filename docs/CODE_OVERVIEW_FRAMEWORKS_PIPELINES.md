# 📖 Panoramica Codice - Framework & Pipeline

**CRM Immobiliare - Analisi Tecnica Completa**

Versione: 3.2.0
Data: 2025-11-10
Stato: Production Ready

---

## 📑 Indice

1. [Architettura Generale](#architettura-generale)
2. [Framework Utilizzati](#framework-utilizzati)
3. [Pipeline & Flussi di Dati](#pipeline--flussi-di-dati)
4. [Esempi Pratici di Pipeline](#esempi-pratici-di-pipeline)
5. [Tool e Agenti AI](#tool-e-agenti-ai)
6. [Database Schema & Migrations](#database-schema--migrations)
7. [Deployment & Docker](#deployment--docker)

---

## 🏗️ Architettura Generale

### Struttura a 3 Servizi

Il CRM Immobiliare è organizzato in 3 servizi containerizzati che comunicano tra loro:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                       │
│                  (React Components)                     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│              APP - Next.js 14 (Port 3000)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  FRONTEND (React + Tailwind + shadcn/ui)        │   │
│  │  - Pages & Components                           │   │
│  │  - Client-side State (React Query)              │   │
│  │  - UI/UX Layer                                  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  BACKEND API (Next.js API Routes)              │   │
│  │  - /api/properties/*                            │   │
│  │  - /api/contacts/*                              │   │
│  │  - /api/requests/*                              │   │
│  │  - /api/matches/*                               │   │
│  │  - Prisma ORM (TypeScript)                      │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────┬────────────────────┬───────────────────┘
                 │                    │ HTTP Proxy
                 │                    ▼
                 │    ┌───────────────────────────────────┐
                 │    │  AI TOOLS - Python (Port 8000)   │
                 │    │  ┌──────────────────────────────┐│
                 │    │  │ FastAPI Server               ││
                 │    │  │ - DataPizza AI Framework     ││
                 │    │  │ - Google Gemini 2.0 Flash    ││
                 │    │  │ - Custom Tools (11+)         ││
                 │    │  │ - Scraping Engine (Playwright)││
                 │    │  └──────────────────────────────┘│
                 │    └────────────┬──────────────────────┘
                 │                 │
                 ▼                 ▼
┌────────────────────────────────────────────────────────┐
│         DATABASE - PostgreSQL 16 (Port 5432)           │
│         - Prisma Client (Node.js/TypeScript)           │
│         - SQLAlchemy (Python)                          │
│         - 18 Models (Contacts, Properties, etc.)       │
└────────────────────────────────────────────────────────┘
```

### Comunicazione tra Servizi

```typescript
// Frontend → Backend API (Next.js interno)
const properties = await fetch('/api/properties')

// Backend API → AI Tools (HTTP Proxy)
const response = await fetch('http://ai-tools:8000/ai/chat', {
  method: 'POST',
  body: JSON.stringify({ messages })
})

// Entrambi → Database
// - Next.js usa Prisma Client
// - Python usa SQLAlchemy
```

---

## 🛠️ Framework Utilizzati

### 1. Frontend Stack

#### **Next.js 14.2.18** (App Router)
- **Ruolo**: Framework React full-stack
- **Features usate**:
  - App Router (src/app/)
  - Server Components
  - API Routes (backend interno)
  - Streaming SSR
  - Image Optimization

**Esempio struttura:**
```
frontend/src/app/
├── (pages)/          # Pages con layout condiviso
│   ├── dashboard/
│   ├── immobili/
│   ├── contatti/
│   └── mappa/
├── api/              # Backend API Routes
│   ├── properties/route.ts
│   ├── contacts/route.ts
│   └── ai/chat/route.ts
└── layout.tsx        # Root layout
```

#### **React 18.3.1** + **TypeScript 5.8.3**
- **Ruolo**: Libreria UI e type safety
- **Patterns usati**:
  - Hooks (useState, useEffect, custom hooks)
  - Context API (Theme provider)
  - Suspense & Error Boundaries
  - Server Components per performance

#### **Tailwind CSS 3.4.17** + **shadcn/ui**
- **Ruolo**: Styling system + component library
- **Components**: 40+ componenti Radix UI customizzati
  - Button, Dialog, Select, Table, Toast, etc.
  - Dark mode support (next-themes)
  - Responsive design

**Esempio componente shadcn/ui:**
```typescript
// frontend/src/components/ui/button.tsx
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const Button = ({ className, variant, size, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

#### **TanStack React Query 5.83.0**
- **Ruolo**: Data fetching, caching, synchronization
- **Setup**:
```typescript
// frontend/src/app/providers.tsx
<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>
```

#### **React Hook Form 7.61.1** + **Zod 3.25.76**
- **Ruolo**: Form validation e schema validation
- **Pattern**:
```typescript
const formSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
})
```

---

### 2. Backend Stack (Next.js)

#### **Prisma ORM 6.19.0**
- **Ruolo**: Database ORM + migrations
- **Setup**:
  - Schema: `database/prisma/schema.prisma`
  - Client: Auto-generated TypeScript types
  - Migrations: `prisma migrate dev`

**Esempio API Route:**
```typescript
// frontend/src/app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const properties = await prisma.property.findMany({
    where: { status: 'available' },
    include: { owner: true, building: true },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    data: properties
  })
}
```

---

### 3. AI Backend Stack (Python)

#### **FastAPI 0.115+**
- **Ruolo**: REST API framework per AI services
- **Features**:
  - Async/await support
  - Automatic OpenAPI docs (/docs)
  - Pydantic validation
  - CORS middleware

**Esempio router:**
```python
# ai_tools/app/routers/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    messages: List[Message]
    context: Optional[Dict] = None

@router.post("/")
async def chat(request: ChatRequest):
    result = run_crm_chatbot(
        messages=request.messages,
        context=request.context
    )
    return ChatResponse(**result)
```

#### **DataPizza AI Framework**
- **Ruolo**: Framework per AI Agents con tool calling
- **Componenti**:
  - `Agent`: Orchestratore principale
  - `GoogleClient`: Client per Gemini API
  - `@tool`: Decorator per tool functions
  - Built-in tracing & observability

**Architettura DataPizza:**
```python
from datapizza.agents import Agent
from datapizza.clients.google import GoogleClient
from datapizza.tools import tool

# 1. Definire tools
@tool
def query_properties_tool(city: str, max_price: float) -> str:
    """Search properties by city and price"""
    # Query database
    results = db.query(Property).filter(...)
    return json.dumps(results)

# 2. Creare agent con tools
agent = Agent(
    name="crm_chatbot",
    client=GoogleClient(api_key=API_KEY, model="gemini-2.0-flash-exp"),
    system_prompt=SYSTEM_PROMPT,
    tools=[query_properties_tool, ...]
)

# 3. Eseguire agent
response = agent.run("Trova appartamenti a Milano sotto 200k")
```

#### **Google Gemini 2.0 Flash**
- **Ruolo**: Large Language Model
- **Capabilities**:
  - Native function calling
  - 1M token context
  - Multimodal (text + images)
  - Fast inference

#### **SQLAlchemy 2.0+**
- **Ruolo**: Python ORM (mirror di Prisma schema)
- **Setup**:
```python
# ai_tools/app/models.py
from sqlalchemy.orm import DeclarativeBase

class Property(Base):
    __tablename__ = "properties"
    id = Column(String, primary_key=True)
    code = Column(String, unique=True)
    city = Column(String)
    # ... mirror Prisma schema
```

#### **Playwright** (per web scraping)
- **Ruolo**: Browser automation anti-detection
- **Features**:
  - Headless Chrome/Firefox
  - Session persistence
  - Cookie management
  - Anti-bot evasion

---

### 4. Database Stack

#### **PostgreSQL 16** (Production)
- **Ruolo**: Database relazionale principale
- **Features utilizzate**:
  - JSONB columns (settings, filters)
  - Full-text search (tsvector)
  - Indexes compositi
  - Foreign keys con cascade

#### **SQLite** (Development)
- **Ruolo**: Database locale per sviluppo
- **File**: `database/prisma/dev.db`

---

## 🔄 Pipeline & Flussi di Dati

### Pipeline 1: Chat RAG Assistant

**Flusso completo della chat AI con accesso al database:**

```
USER INPUT
   │
   ▼
┌─────────────────────────────────────────────────┐
│ Frontend: Chat Component                        │
│ frontend/src/app/assistente/page.tsx           │
│ - User types message                            │
│ - Send via API call                             │
└────────────┬────────────────────────────────────┘
             │ POST /api/ai/chat
             ▼
┌─────────────────────────────────────────────────┐
│ Next.js API Route (Proxy)                       │
│ frontend/src/app/api/ai/chat/route.ts          │
│ - Validate input                                │
│ - Forward to Python AI backend                  │
└────────────┬────────────────────────────────────┘
             │ POST http://ai-tools:8000/ai/chat
             ▼
┌─────────────────────────────────────────────────┐
│ FastAPI Router                                  │
│ ai_tools/app/routers/chat.py                   │
│ - Parse ChatRequest                             │
│ - Call run_crm_chatbot()                        │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ DataPizza Agent                                 │
│ ai_tools/app/agents/crm_chatbot.py             │
│                                                 │
│ 1. Agent riceve user message                    │
│ 2. LLM (Gemini) analizza query                  │
│ 3. LLM decide quali tools chiamare              │
│ 4. Agent esegue tool calls in parallelo         │
│    ↓                                            │
│    ├─→ query_properties_tool(city="Milano")     │
│    ├─→ calculate_property_scores_tool(req_id)   │
│    └─→ get_market_insights_tool(city="Milano")  │
│                                                 │
│ 5. Tools accedono al database via SQLAlchemy    │
│    ↓                                            │
└────┼────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│ Database (PostgreSQL)                           │
│ - Query execution                               │
│ - Return results to tools                       │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ Agent continua                                  │
│                                                 │
│ 6. LLM riceve tool results                      │
│ 7. LLM sintetizza risposta finale               │
│ 8. Return formatted response                    │
└────────────┬────────────────────────────────────┘
             │
             ▼
USER RECEIVES ANSWER
```

**Codice semplificato della pipeline:**

```python
# STEP 1: Agent setup con tools
agent = Agent(
    name="crm_chatbot",
    client=GoogleClient(model="gemini-2.0-flash-exp"),
    system_prompt=SYSTEM_PROMPT,
    tools=[
        query_properties_tool,
        calculate_property_scores_tool,
        get_market_insights_tool,
        # ... altri 8 tools
    ]
)

# STEP 2: User message
user_msg = "Trova i migliori 3 appartamenti per la richiesta REQ-001"

# STEP 3: Agent execution (automatic tool calling)
response = agent.run(user_msg)
# Internamente:
# - LLM capisce che serve calculate_property_scores_tool
# - Agent chiama il tool: calculate_property_scores_tool(request_id="REQ-001", limit=3)
# - Tool query il DB e ritorna JSON con properties scored
# - LLM formatta la risposta per l'utente

# STEP 4: Return response
return {"content": response.text, "success": True}
```

---

### Pipeline 2: Property Matching Algorithm

**Scoring deterministico property-request:**

```
REQUEST INPUT (REQ-001)
   │ {city: "Milano", priceMax: 250000, rooms: 3, ...}
   ▼
┌──────────────────────────────────────────────────┐
│ 1. Load Request from DB                          │
│    request = db.query(Request).filter(id=REQ001) │
└────────────┬─────────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────┐
│ 2. Find Candidate Properties                     │
│    properties = db.query(Property).filter(       │
│      status="available",                         │
│      contractType=request.contractType           │
│    )                                             │
└────────────┬─────────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────┐
│ 3. PropertyScorer.get_sorted_matches()           │
│    ai_tools/app/services/property_scorer.py     │
│                                                  │
│    FOR EACH property:                            │
│      ┌─────────────────────────────────────┐    │
│      │ SCORE CALCULATION (7 components)    │    │
│      │                                      │    │
│      │ 1. Location (25%)                   │    │
│      │    - City match: 15%                │    │
│      │    - Zone match: 10%                │    │
│      │                                      │    │
│      │ 2. Price Range (20%)                │    │
│      │    - Within budget: 100%            │    │
│      │    - Slightly over: 80%             │    │
│      │    - Way over: 0%                   │    │
│      │                                      │    │
│      │ 3. Property Type (15%)              │    │
│      │    - Exact match: 100%              │    │
│      │    - Compatible: 50%                │    │
│      │                                      │    │
│      │ 4. Size Match (15%)                 │    │
│      │    - sqm within range               │    │
│      │                                      │    │
│      │ 5. Rooms Match (10%)                │    │
│      │    - rooms/bedrooms count           │    │
│      │                                      │    │
│      │ 6. Features Match (10%)             │    │
│      │    - elevator, parking, garden...   │    │
│      │                                      │    │
│      │ 7. Condition Match (5%)             │    │
│      │    - excellent, good, fair...       │    │
│      │                                      │    │
│      │ TOTAL SCORE: 0-100                  │    │
│      └─────────────────────────────────────┘    │
└────────────┬─────────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────┐
│ 4. Sort by Total Score (DESC)                    │
│    Filter by min_score (default: 60)            │
│    Return top N matches                          │
└────────────┬─────────────────────────────────────┘
             ▼
OUTPUT: Sorted Match List
[
  {
    property_id: "prop_123",
    total_score: 92,
    components: {location: 23, price: 20, type: 15, ...},
    match_reasons: ["Città corretta", "Prezzo ideale", ...],
    mismatch_reasons: ["Manca giardino richiesto"]
  },
  ...
]
```

**Codice del scorer:**

```python
# ai_tools/app/services/property_scorer.py
class PropertyScorer:
    WEIGHTS = {
        "location": 0.25,
        "price": 0.20,
        "type": 0.15,
        "size": 0.15,
        "rooms": 0.10,
        "features": 0.10,
        "condition": 0.05
    }

    def calculate_score(self, property: Property, request: Request) -> dict:
        scores = {}
        reasons = {"match": [], "mismatch": []}

        # 1. Location score
        location_score = 0
        if property.city in request.searchCities:
            location_score += 15
            reasons["match"].append(f"Città corretta: {property.city}")

        if property.zone in request.searchZones:
            location_score += 10
            reasons["match"].append(f"Zona richiesta: {property.zone}")

        scores["location"] = location_score

        # 2. Price score
        price = property.priceSale or property.priceRentMonthly
        if request.priceMin <= price <= request.priceMax:
            scores["price"] = 20
            reasons["match"].append(f"Prezzo nel budget: €{price:,}")
        elif price > request.priceMax:
            overage = (price - request.priceMax) / request.priceMax
            if overage < 0.1:  # 10% tolerance
                scores["price"] = 16
            else:
                scores["price"] = 0
                reasons["mismatch"].append(f"Prezzo troppo alto: €{price:,}")

        # ... altri 5 componenti ...

        # Total score
        total = sum(scores.values())

        return {
            "total_score": total,
            "components": scores,
            "match_reasons": reasons["match"],
            "mismatch_reasons": reasons["mismatch"]
        }
```

---

### Pipeline 3: Web Scraping (Playwright)

**Scraping immobili da portali con anti-detection:**

```
USER REQUEST
   │ "Scrapa appartamenti a Milano da Immobiliare.it"
   ▼
┌──────────────────────────────────────────────────┐
│ Frontend: Scraping Page                          │
│ frontend/src/app/scraping/page.tsx              │
│ - User selects portal, city, filters            │
│ - Click "Avvia Scraping"                         │
└────────────┬─────────────────────────────────────┘
             │ POST /api/ai/scraping/start
             ▼
┌──────────────────────────────────────────────────┐
│ FastAPI Router                                   │
│ ai_tools/app/routers/scraping.py                │
│ - Create ScrapingJob in DB                       │
│ - Start async scraping task                      │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│ Playwright Browser Automation                    │
│                                                  │
│ 1. LOAD SESSION                                  │
│    - Load browser profile from volume            │
│    - Restore cookies & localStorage              │
│    - Set realistic user-agent                    │
│    - Random viewport size                        │
│                                                  │
│ 2. NAVIGATE TO PORTAL                            │
│    browser = await playwright.chromium.launch()  │
│    page = await browser.new_page()               │
│    await page.goto("https://immobiliare.it")    │
│                                                  │
│ 3. SEARCH WITH FILTERS                           │
│    - Fill search form (city, price, rooms)       │
│    - Click search button                         │
│    - Wait for results                            │
│                                                  │
│ 4. PAGINATE & EXTRACT                            │
│    FOR each page (1 to max_pages):               │
│      - Extract listings                          │
│      - Parse: title, price, sqm, address...      │
│      - Extract images URLs                       │
│      - Follow detail page for full data          │
│      - Random delay (2-5 sec) anti-detection     │
│                                                  │
│ 5. DEDUPLICATE & SAVE                            │
│    - Check if property already exists            │
│    - Geocode address → lat/lng                   │
│    - Create Property in DB (source="web_scraping")│
│    - Update ScrapingJob status                   │
│                                                  │
│ 6. SAVE SESSION                                  │
│    - Save cookies to volume                      │
│    - Update session metrics                      │
└────────────┬─────────────────────────────────────┘
             ▼
DATABASE
   │ New properties saved with source="web_scraping"
   ▼
FRONTEND UPDATES
   │ Real-time progress via polling or WebSocket
```

**Codice scraping:**

```python
# ai_tools/app/services/scraper.py
from playwright.async_api import async_playwright

async def scrape_portal(portal: str, city: str, filters: dict):
    async with async_playwright() as p:
        # 1. Launch browser with anti-detection
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )

        # 2. Create context with saved session
        context = await browser.new_context(
            user_agent=get_random_user_agent(),
            viewport={'width': 1920, 'height': 1080},
            storage_state='sessions/immobiliare_it.json'
        )

        page = await context.new_page()

        # 3. Navigate to search results
        search_url = build_search_url(portal, city, filters)
        await page.goto(search_url)

        # 4. Extract listings
        listings = []
        for page_num in range(1, filters.get('max_pages', 5) + 1):
            # Wait for results
            await page.wait_for_selector('.listing-item')

            # Extract data
            items = await page.query_selector_all('.listing-item')
            for item in items:
                listing = {
                    'title': await item.inner_text('.listing-title'),
                    'price': extract_price(await item.inner_text('.listing-price')),
                    'city': city,
                    'sqm': extract_number(await item.inner_text('.listing-sqm')),
                    'rooms': extract_number(await item.inner_text('.listing-rooms')),
                    'url': await item.get_attribute('href')
                }
                listings.append(listing)

            # Go to next page
            next_btn = await page.query_selector('.pagination-next')
            if next_btn:
                await next_btn.click()
                await asyncio.sleep(random.uniform(2, 5))  # Anti-detection
            else:
                break

        # 5. Save session
        await context.storage_state(path='sessions/immobiliare_it.json')
        await browser.close()

        return listings
```

---

### Pipeline 4: CRUD Operations (REST API)

**Standard CRUD flow per entità (Properties, Contacts, etc.):**

```
CLIENT REQUEST
   │ GET /api/properties?status=available&city=Milano
   ▼
┌──────────────────────────────────────────────────┐
│ Next.js API Route                                │
│ frontend/src/app/api/properties/route.ts        │
│                                                  │
│ export async function GET(request: NextRequest) │
│   // 1. Parse query params                       │
│   const { searchParams } = new URL(request.url)  │
│   const status = searchParams.get('status')      │
│   const city = searchParams.get('city')          │
│                                                  │
│   // 2. Validate with Zod                        │
│   const schema = z.object({                      │
│     status: z.enum(['available', 'sold']),       │
│     city: z.string().optional()                  │
│   })                                             │
│   const params = schema.parse({status, city})    │
│                                                  │
│   // 3. Query with Prisma                        │
│   const properties = await prisma.property       │
│     .findMany({                                  │
│       where: {                                   │
│         status: params.status,                   │
│         city: params.city ? {                    │
│           contains: params.city,                 │
│           mode: 'insensitive'                    │
│         } : undefined                            │
│       },                                         │
│       include: {                                 │
│         owner: true,                             │
│         building: true,                          │
│         matches: true                            │
│       },                                         │
│       orderBy: { createdAt: 'desc' },            │
│       take: 100                                  │
│     })                                           │
│                                                  │
│   // 4. Transform data                           │
│   const transformed = properties.map(p => ({     │
│     ...p,                                        │
│     price: p.priceSale || p.priceRentMonthly,   │
│     ownerName: p.owner?.fullName                │
│   }))                                            │
│                                                  │
│   // 5. Return JSON response                     │
│   return NextResponse.json({                     │
│     success: true,                               │
│     data: transformed,                           │
│     count: transformed.length                    │
│   })                                             │
└────────────┬─────────────────────────────────────┘
             ▼
DATABASE (Prisma → PostgreSQL)
   │ SELECT * FROM properties
   │ WHERE status = 'available' AND city ILIKE '%Milano%'
   │ ORDER BY created_at DESC LIMIT 100
   ▼
RESPONSE TO CLIENT
{
  "success": true,
  "data": [...],
  "count": 42
}
```

**POST Example (Create Property):**

```typescript
// frontend/src/app/api/properties/route.ts
export async function POST(request: NextRequest) {
  // 1. Parse body
  const body = await request.json()

  // 2. Validate with Zod
  const schema = z.object({
    street: z.string().min(2),
    city: z.string(),
    propertyType: z.enum(['apartment', 'villa', 'office']),
    priceSale: z.number().positive().optional(),
    // ... more fields
  })

  const validated = schema.parse(body)

  // 3. Generate unique code
  const code = await generatePropertyCode()  // PROP-2025-0042

  // 4. Geocode address
  const { latitude, longitude } = await geocodeAddress(
    `${validated.street}, ${validated.city}`
  )

  // 5. Create in database with Prisma
  const property = await prisma.property.create({
    data: {
      code,
      ...validated,
      latitude,
      longitude,
      status: 'draft',
      source: 'direct_mandate',
      createdAt: new Date()
    }
  })

  // 6. Audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Property',
      entityId: property.id,
      action: 'create',
      newValues: property
    }
  })

  // 7. Return created resource
  return NextResponse.json({
    success: true,
    data: property
  }, { status: 201 })
}
```

---

## 🤖 Tool e Agenti AI

### Tool Architecture

Il sistema AI utilizza il pattern **Tool Calling** di DataPizza:

```python
from datapizza.tools import tool

@tool
def tool_name(param1: str, param2: int) -> str:
    """
    Tool description for LLM.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        JSON string with results
    """
    # 1. Access database
    db = SessionLocal()
    results = db.query(Model).filter(...)

    # 2. Process data
    processed = process_results(results)

    # 3. Return as JSON string
    return json.dumps({
        "success": True,
        "data": processed
    })
```

### 11 Tools Disponibili

#### 1. **Database Query Tools** (5 tools)

```python
# 1. query_properties_tool
@tool
def query_properties_tool(
    city: str = None,
    status: str = "available",
    contract_type: str = None,
    min_price: float = None,
    max_price: float = None,
    min_rooms: int = None,
    limit: int = 20
) -> str:
    """Search properties with SQL filters"""
    # Complex Prisma-like query with filters

# 2. query_contacts_tool
@tool
def query_contacts_tool(
    status: str = "active",
    importance: str = None,
    city: str = None,
    limit: int = 20
) -> str:
    """Search contacts/clients"""

# 3. query_requests_tool
@tool
def query_requests_tool(
    status: str = "active",
    contract_type: str = None,
    limit: int = 20
) -> str:
    """Search client requests"""

# 4. property_search_tool (semantic)
@tool
def property_search_tool(query: str, limit: int = 10) -> str:
    """Semantic search using embeddings"""
    # Uses vector similarity search

# 5. contact_search_tool (semantic)
@tool
def contact_search_tool(query: str, limit: int = 10) -> str:
    """Semantic search for contacts"""
```

#### 2. **Business Intelligence Tools** (4 tools)

```python
# 6. calculate_property_scores_tool ⭐
@tool
def calculate_property_scores_tool(
    request_id: str,
    min_score: int = 60,
    limit: int = 10
) -> str:
    """
    Calculate best matches using 7-component scoring:
    - Location (25%)
    - Price (20%)
    - Type (15%)
    - Size (15%)
    - Rooms (10%)
    - Features (10%)
    - Condition (5%)
    """
    scorer = PropertyScorer()
    matches = scorer.get_sorted_matches(request, properties)
    return json.dumps(matches)

# 7. analyze_portfolio_tool
@tool
def analyze_portfolio_tool(status: str = "available") -> str:
    """Portfolio statistics and insights"""
    # Returns: total, by_city, by_type, avg_price, insights

# 8. get_urgent_actions_tool
@tool
def get_urgent_actions_tool(days_ahead: int = 7) -> str:
    """Get urgent activities and deadlines"""
    # Returns: upcoming activities, overdue tasks

# 9. get_market_insights_tool
@tool
def get_market_insights_tool(city: str, property_type: str = None) -> str:
    """Market analysis for city/zone"""
    # Returns: supply, demand, avg prices, trends
```

#### 3. **Detail Tools** (2 tools)

```python
# 10. get_contact_details_tool
@tool
def get_contact_details_tool(contact_id: str) -> str:
    """Full contact profile with relationships"""
    # Includes: profile, requests, matches, activities

# 11. query_matches_tool
@tool
def query_matches_tool(
    request_id: str = None,
    property_id: str = None,
    status: str = None
) -> str:
    """Query existing matches"""
```

---

## 🗄️ Database Schema & Migrations

### Schema Overview (18 Models)

```prisma
// database/prisma/schema.prisma

// CORE ENTITIES
model UserProfile      // Profilo agente immobiliare
model Contact          // Clienti, proprietari, lead
model Property         // Immobili
model Building         // Edifici (census)
model Request          // Richieste di ricerca

// RELATIONSHIPS
model Match            // Match property-request con scoring
model Activity         // Timeline CRM (calls, visits, emails)

// TAXONOMY
model Tag              // Universal tagging system
model EntityTag        // Polymorphic M2M tags

// COMPLIANCE
model AuditLog         // Change tracking

// CUSTOM FIELDS
model CustomFieldDefinition  // User-defined fields
model CustomFieldValue       // Values storage

// WEB SCRAPING
model ScrapingJob      // Job persistence
model ScrapingSession  // Browser session storage
model ScrapingSource   // Dynamic source config

// AI AGENTS
model AgentConversation  // Chat sessions
model AgentTask          // Individual AI tasks
model AgentMemory        // AI learning & patterns
```

### Key Relationships

```
Contact (1) ──────→ (N) Property [owner]
Contact (1) ──────→ (N) Request
Contact (1) ──────→ (N) Match
Contact (1) ──────→ (N) Activity

Property (1) ─────→ (N) Match
Property (N) ─────→ (1) Building

Request (1) ──────→ (N) Match

Match (N) ────────→ (1) Request
Match (N) ────────→ (1) Property
Match (N) ────────→ (1) Contact

Activity (N) ─────→ (1) Contact (optional)
Activity (N) ─────→ (1) Property (optional)
Activity (N) ─────→ (1) Building (optional)
```

### Migration Workflow

```bash
# 1. Edit schema
vim database/prisma/schema.prisma

# 2. Generate Prisma Client
cd database/prisma
npx prisma generate

# 3. Create migration (development)
npx prisma migrate dev --name add_urgency_fields

# 4. Push to database (development quick)
npx prisma db push

# 5. Production migration
npx prisma migrate deploy

# 6. Seed database
npx tsx seed.ts
```

---

## 🐳 Deployment & Docker

### Docker Compose Architecture

```yaml
# docker-compose.yml
version: '3.9'

services:
  # 1. DATABASE
  database:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: crm_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: crm_immobiliare

  # 2. APP (Next.js Frontend + Backend API)
  app:
    image: ghcr.io/cookkie03/crm-immobiliare-app:latest
    ports: ["3000:3000"]
    depends_on:
      database: {condition: service_healthy}
    volumes:
      - app_uploads:/app/public/uploads
      - app_backups:/app/backups
      - app_logs:/app/logs
    environment:
      DATABASE_URL: postgresql://crm_user:pass@database:5432/crm
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}

  # 3. AI TOOLS (Python FastAPI)
  ai-tools:
    image: ghcr.io/cookkie03/crm-immobiliare-ai:latest
    ports: ["8000:8000"]
    depends_on:
      database: {condition: service_healthy}
    volumes:
      - ai_cache:/app/.cache
      - scraping_profiles:/app/.playwright-profiles
      - qdrant_storage:/app/.qdrant
    environment:
      DATABASE_URL: postgresql://crm_user:pass@database:5432/crm
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}

  # 4. WATCHTOWER (Auto-update)
  watchtower:
    image: containrrr/watchtower:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      WATCHTOWER_POLL_INTERVAL: 300  # 5 min
      WATCHTOWER_CLEANUP: "true"

volumes:
  postgres_data:
  app_uploads:
  app_backups:
  app_logs:
  ai_cache:
  scraping_profiles:
  qdrant_storage:
```

### Deployment Pipeline

```
DEVELOPER
   │ git push to main branch
   ▼
┌─────────────────────────────────────────────────┐
│ GitHub Actions CI/CD                            │
│ .github/workflows/deploy.yml                    │
│                                                 │
│ 1. Build Docker images                          │
│    - docker build -t app:latest frontend/       │
│    - docker build -t ai:latest ai_tools/        │
│                                                 │
│ 2. Push to GitHub Container Registry            │
│    - ghcr.io/cookkie03/crm-app:latest          │
│    - ghcr.io/cookkie03/crm-ai:latest           │
└────────────┬────────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────┐
│ Watchtower (running on server)                  │
│ - Poll GitHub Container Registry every 5 min    │
│ - Detect new image                              │
│ - Pull new image                                │
│ - Stop old container                            │
│ - Start new container                           │
│ - Volumes persist (data safe)                   │
└─────────────────────────────────────────────────┘
```

---

## 📊 Esempi Pratici di Pipeline

### Esempio 1: User cerca appartamento

**Scenario**: Utente apre la chat e scrive "Trova appartamenti a Milano sotto 250k con 3 locali"

**Pipeline completa:**

1. **Frontend** (`frontend/src/app/assistente/page.tsx`)
   ```typescript
   const sendMessage = async (content: string) => {
     const response = await fetch('/api/ai/chat', {
       method: 'POST',
       body: JSON.stringify({
         messages: [...history, { role: 'user', content }]
       })
     })
     const data = await response.json()
     setMessages([...messages, data])
   }
   ```

2. **Next.js Proxy** (`frontend/src/app/api/ai/chat/route.ts`)
   ```typescript
   export async function POST(request: NextRequest) {
     const body = await request.json()

     // Forward to Python AI
     const aiResponse = await fetch('http://ai-tools:8000/ai/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(body)
     })

     return NextResponse.json(await aiResponse.json())
   }
   ```

3. **FastAPI Router** (`ai_tools/app/routers/chat.py`)
   ```python
   @router.post("/")
   async def chat(request: ChatRequest):
       result = run_crm_chatbot(request.messages)
       return ChatResponse(**result)
   ```

4. **DataPizza Agent** (`ai_tools/app/agents/crm_chatbot.py`)
   ```python
   agent = Agent(
       client=GoogleClient(model="gemini-2.0-flash-exp"),
       tools=[query_properties_tool, ...]
   )

   response = agent.run(
       "Trova appartamenti a Milano sotto 250k con 3 locali"
   )
   # LLM calls: query_properties_tool(
   #   city="Milano",
   #   property_type="apartment",
   #   max_price=250000,
   #   min_rooms=3
   # )
   ```

5. **Tool Execution** (`ai_tools/app/tools/db_query_tool.py`)
   ```python
   @tool
   def query_properties_tool(...):
       db = SessionLocal()
       properties = db.query(Property).filter(
           Property.city == "Milano",
           Property.propertyType == "apartment",
           Property.priceSale <= 250000,
           Property.rooms >= 3,
           Property.status == "available"
       ).limit(20).all()

       return json.dumps([{
           "id": p.id,
           "title": p.title,
           "price": p.priceSale,
           "rooms": p.rooms,
           "sqm": p.sqmCommercial
       } for p in properties])
   ```

6. **LLM Response Generation**
   ```
   Gemini 2.0 riceve tool result e genera:

   "Ho trovato 12 appartamenti a Milano sotto €250.000 con almeno 3 locali:

   1. **Trilocale in Porta Romana** - €235.000
      - 80 mq, 3 locali, 2° piano con ascensore

   2. **Appartamento luminoso in Loreto** - €248.000
      - 95 mq, 4 locali, ottimo stato

   ... (altri 10 risultati)

   💡 Vuoi che ti mostri i dettagli di qualcuno specifico?"
   ```

7. **Response to User**
   - Frontend riceve la risposta formattata
   - Mostra in chat con markdown rendering
   - User può fare follow-up questions

---

### Esempio 2: Calcolo Best Matches

**Scenario**: L'agente ha una richiesta (REQ-001) e vuole i 5 migliori match

**Pipeline:**

1. **User Input** (via chat o UI diretta)
   ```
   "Trova i migliori 5 appartamenti per la richiesta REQ-001"
   ```

2. **Agent Tool Selection**
   ```python
   # LLM decides to use calculate_property_scores_tool
   # instead of query_matches_tool (which shows existing matches)
   ```

3. **Tool Execution**
   ```python
   @tool
   def calculate_property_scores_tool(request_id="REQ-001", limit=5):
       # 1. Load request
       request = db.query(Request).get("REQ-001")
       # request.searchCities = ["Milano", "Monza"]
       # request.priceMax = 300000
       # request.rooms = 3

       # 2. Find candidates
       properties = db.query(Property).filter(
           Property.status == "available",
           Property.contractType == request.contractType
       ).all()  # 150 properties

       # 3. Score each
       scorer = PropertyScorer()
       scored = []
       for prop in properties:
           score_data = scorer.calculate_score(prop, request)
           if score_data["total_score"] >= 60:  # min threshold
               scored.append({
                   "property": prop,
                   "score": score_data
               })

       # 4. Sort & limit
       scored.sort(key=lambda x: x["score"]["total_score"], reverse=True)
       return scored[:5]
   ```

4. **Scoring Algorithm** (`ai_tools/app/services/property_scorer.py`)
   ```python
   def calculate_score(prop: Property, req: Request) -> dict:
       components = {}

       # Location (max 25 points)
       if prop.city in req.searchCities:
           components["location"] = 15
       if prop.zone in req.searchZones:
           components["location"] += 10

       # Price (max 20 points)
       price = prop.priceSale
       if req.priceMin <= price <= req.priceMax:
           components["price"] = 20
       elif price < req.priceMax * 1.1:  # 10% tolerance
           components["price"] = 16
       else:
           components["price"] = 0

       # Type (max 15 points)
       if prop.propertyType in req.propertyTypes:
           components["type"] = 15

       # Size (max 15 points)
       if req.sqmMin <= prop.sqmCommercial <= req.sqmMax:
           components["size"] = 15

       # Rooms (max 10 points)
       if prop.rooms >= req.roomsMin:
           components["rooms"] = 10

       # Features (max 10 points)
       feature_score = 0
       if req.requiresElevator and prop.hasElevator:
           feature_score += 3
       if req.requiresParking and prop.hasParking:
           feature_score += 3
       # ... other features
       components["features"] = min(feature_score, 10)

       # Condition (max 5 points)
       condition_map = {"excellent": 5, "good": 4, "fair": 3}
       components["condition"] = condition_map.get(prop.condition, 0)

       total = sum(components.values())

       return {
           "total_score": total,
           "components": components,
           "match_reasons": build_match_reasons(components),
           "mismatch_reasons": build_mismatch_reasons(components)
       }
   ```

5. **Formatted Response**
   ```json
   {
     "success": true,
     "matches_count": 5,
     "matches": [
       {
         "property_code": "PROP-2025-0042",
         "title": "Trilocale luminoso in Porta Romana",
         "location": "Milano - Porta Romana",
         "price": 285000,
         "total_score": 92,
         "score_components": {
           "location": 25,
           "price": 20,
           "type": 15,
           "size": 15,
           "rooms": 10,
           "features": 5,
           "condition": 2
         },
         "match_reasons": [
           "Città e zona perfette",
           "Prezzo nel budget",
           "Tipologia richiesta",
           "Metratura ideale",
           "Numero locali corretto"
         ],
         "mismatch_reasons": [
           "Manca posto auto richiesto"
         ]
       },
       // ... altri 4 match
     ]
   }
   ```

6. **LLM Final Response**
   ```
   "Ecco i 5 migliori match per la richiesta REQ-001:

   🥇 **Trilocale in Porta Romana** (Score: 92/100)
      📍 Milano - Porta Romana
      💰 €285.000
      ✅ Zona perfetta, prezzo ideale, metratura ottima
      ⚠️ Manca posto auto

   🥈 **Appartamento in Loreto** (Score: 88/100)
      ...

   💡 Suggerisco di proporre i primi 3 al cliente.
   Vuoi che prepari una email di presentazione?"
   ```

---

### Esempio 3: Web Scraping + Auto-Import

**Scenario**: Importare automaticamente appartamenti da Immobiliare.it

1. **User Input** (Scraping UI)
   ```typescript
   // frontend/src/app/scraping/page.tsx
   const startScraping = async () => {
     await fetch('/api/ai/scraping/start', {
       method: 'POST',
       body: JSON.stringify({
         portal: 'immobiliare_it',
         location: 'Milano',
         contractType: 'sale',
         priceMax: 300000,
         roomsMin: 3,
         maxPages: 10
       })
     })
   }
   ```

2. **Create Scraping Job**
   ```python
   # ai_tools/app/routers/scraping.py
   @router.post("/start")
   async def start_scraping(config: ScrapingConfig):
       # Create job in DB
       job = ScrapingJob(
           portal=config.portal,
           location=config.location,
           status="queued",
           createdAt=datetime.now()
       )
       db.add(job)
       db.commit()

       # Start async task
       asyncio.create_task(run_scraping_job(job.id))

       return {"job_id": job.id, "status": "started"}
   ```

3. **Playwright Scraping**
   ```python
   async def run_scraping_job(job_id: str):
       job = db.query(ScrapingJob).get(job_id)
       job.status = "running"
       db.commit()

       async with async_playwright() as p:
           # Launch browser with anti-detection
           browser = await p.chromium.launch(
               headless=True,
               args=[
                   '--disable-blink-features=AutomationControlled',
                   '--disable-dev-shm-usage'
               ]
           )

           # Load saved session (cookies)
           context = await browser.new_context(
               storage_state='sessions/immobiliare_it.json',
               user_agent=get_random_user_agent(),
               viewport={'width': 1920, 'height': 1080}
           )

           page = await context.new_page()

           # Navigate to search
           url = f"https://www.immobiliare.it/vendita-case/milano/?prezzoMassimo=300000&locali=3"
           await page.goto(url)

           listings = []
           for page_num in range(1, job.maxPages + 1):
               # Extract listings on current page
               items = await page.query_selector_all('.in-card')

               for item in items:
                   listing = {
                       'title': await item.inner_text('.in-card__title'),
                       'price': extract_price(await item.inner_text('.in-card__price')),
                       'address': await item.inner_text('.in-card__location'),
                       'sqm': extract_sqm(await item.inner_text('.in-card__features')),
                       'rooms': extract_rooms(await item.inner_text('.in-card__features')),
                       'url': await item.get_attribute('href')
                   }
                   listings.append(listing)

               # Next page
               next_btn = await page.query_selector('a.in-pagination__button--next')
               if next_btn:
                   await next_btn.click()
                   await page.wait_for_load_state('networkidle')
                   await asyncio.sleep(random.uniform(2, 5))  # Anti-detection
               else:
                   break

           # Save session
           await context.storage_state(path='sessions/immobiliare_it.json')
           await browser.close()

           # Process listings
           job.listingsFound = len(listings)
           saved_count = 0

           for listing in listings:
               # Check if already exists
               exists = db.query(Property).filter(
                   Property.sourceUrl == listing['url']
               ).first()

               if not exists:
                   # Geocode address
                   coords = geocode_address(listing['address'])

                   # Create property
                   prop = Property(
                       code=generate_code(),
                       title=listing['title'],
                       street=extract_street(listing['address']),
                       city='Milano',
                       propertyType='apartment',
                       priceSale=listing['price'],
                       sqmCommercial=listing['sqm'],
                       rooms=listing['rooms'],
                       latitude=coords['lat'],
                       longitude=coords['lng'],
                       status='draft',
                       source='web_scraping',
                       sourceUrl=listing['url'],
                       verified=False,
                       importDate=datetime.now()
                   )
                   db.add(prop)
                   saved_count += 1

           db.commit()

           # Update job
           job.listingsSaved = saved_count
           job.status = "completed"
           job.completedAt = datetime.now()
           db.commit()
   ```

4. **Frontend Polling**
   ```typescript
   // Poll job status every 2 seconds
   useEffect(() => {
       const interval = setInterval(async () => {
           const res = await fetch(`/api/ai/scraping/jobs/${jobId}`)
           const data = await res.json()

           setProgress({
               status: data.status,
               found: data.listingsFound,
               saved: data.listingsSaved
           })

           if (data.status === 'completed') {
               clearInterval(interval)
               showSuccessToast(`Importati ${data.listingsSaved} immobili!`)
           }
       }, 2000)

       return () => clearInterval(interval)
   }, [jobId])
   ```

---

## 📈 Performance & Optimizations

### Database Indexes

```prisma
// Composite indexes for common queries
@@index([status, contractType, city])
@@index([city, zone, status])
@@index([latitude, longitude])  // Geo queries
@@index([urgencyScore])          // Map filtering
```

### Caching Strategy

1. **Next.js ISR** (Incremental Static Regeneration)
   ```typescript
   export const revalidate = 60  // Revalidate every 60s
   ```

2. **React Query** (Client-side caching)
   ```typescript
   const { data } = useQuery({
       queryKey: ['properties', filters],
       queryFn: () => fetchProperties(filters),
       staleTime: 5 * 60 * 1000  // 5 minutes
   })
   ```

3. **AI Cache** (Python)
   - HTTP responses cached in `/app/.cache`
   - Embeddings cached to avoid recomputation
   - Qdrant vectors persisted in volume

---

## 🎯 Conclusioni

Questa repository implementa un **CRM immobiliare enterprise-grade** con:

✅ **Stack moderno**: Next.js 14, React 18, TypeScript, Tailwind, Python FastAPI
✅ **AI nativa**: Gemini 2.0 Flash con tool calling e RAG
✅ **Architettura scalabile**: 3 servizi containerizzati con Docker
✅ **Database robusto**: PostgreSQL con 18 models e migrations
✅ **Pipeline complete**: CRUD, AI chat, matching, scraping
✅ **Production ready**: Docker Compose, auto-update, backup automatici
✅ **Developer experience**: Type safety, hot reload, documentazione completa

**Pattern architetturali chiave:**
- **Monorepo modulare** con workspace separation
- **API-first design** con OpenAPI specs
- **Tool-based AI** (no prompt engineering fragile)
- **Event-driven scraping** con job queues
- **Deterministic scoring** + AI insights
- **Full observability** con logging, tracing, audit

---

**Autore**: Claude (AI Assistant)
**Repository**: [cookkie03/cookkie-real-estate-agent](https://github.com/cookkie03/cookkie-real-estate-agent)
**Licenza**: MIT
