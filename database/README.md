# 💾 Database Layer - CRM Immobiliare

## Overview

Questo modulo centralizza tutto il layer database dell'applicazione, condiviso tra:
- **Backend Next.js** (via Prisma ORM)
- **Frontend Next.js** (via Prisma Client)
- **AI Tools Python** (via SQLAlchemy)
- **Scraping Module** (accesso diretto SQLite o SQLAlchemy)

**Database**: SQLite (sviluppo) → PostgreSQL/MySQL (produzione futura)

**Località Centralizzata**: `database/prisma/dev.db`

## Struttura

```
database/
├── prisma/                  # Prisma ORM (TypeScript/Node.js)
│   ├── schema.prisma        # ⭐ Schema database (fonte di verità)
│   ├── migrations/          # Migration history (git-ignored)
│   ├── seed.ts              # Seed data (SOLO dati fittizi)
│   └── dev.db               # SQLite database (git-ignored)
│
├── python/                  # SQLAlchemy Models (Python)
│   ├── models.py            # Modelli Python mirror di Prisma
│   ├── database.py          # Utilities connessione DB
│   ├── __init__.py          # Package exports
│   └── README.md            # Documentazione utilizzo Python
│
└── scripts/                 # Script automazione database
    ├── migrate.sh           # Migration script (Linux/Mac)
    ├── migrate.bat          # Migration script (Windows)
    └── reset.sh             # Database reset con backup
```

## Database Schema

Il database utilizza **Prisma Schema** come fonte di verità. Vedi [prisma/schema.prisma](prisma/schema.prisma) per dettagli completi.

### Modelli Principali

#### 1. UserProfile
Profilo dell'agente immobiliare (applicazione single-user).

**Campi Chiave**:
- `fullName`, `email`, `phone` - Dati personali
- `agencyName`, `agencyVat`, `agencyAddress` - Dati agenzia
- `settings` - Configurazioni (JSON): commissioni, orari, auto-match

**Relazioni**: Nessuna (single-user, profilo isolato)

---

#### 2. Contact
Contatti unificati: clienti in cerca, proprietari, lead.

**Campi Chiave**:
- `code` - Codice univoco (CNT-2025-0001)
- `fullName`, `primaryEmail`, `primaryPhone` - Anagrafica
- `entityType` - Tipo: person, company
- `city`, `province`, `latitude`, `longitude` - Localizzazione
- `budgetMin`, `budgetMax` - Budget ricerca (se cerca casa)
- `status` - active, inactive, archived, blacklist
- `source` - Provenienza: website, referral, cold_call, census, portal
- `leadScore` - Punteggio qualità lead (0-100)
- `importance` - Priorità: low, normal, high, vip
- `privacyFirstContact`, `privacyExtended`, `privacyMarketing` - GDPR

**Relazioni**:
- `ownedProperties[]` → Property (proprietà possedute)
- `requests[]` → Request (richieste di ricerca)
- `matches[]` → Match (proposte inviate)
- `activities[]` → Activity (interazioni/appuntamenti)

**Indici**: code, fullName, phone, email, city, status, source, importance

---

#### 3. Building
Censimento edifici (condomini, palazzine).

**Campi Chiave**:
- `code` - Codice univoco (BLD-2025-0001)
- `street`, `civic`, `city`, `province` - Indirizzo completo
- `cadastralSheet`, `cadastralParticle` - Dati catastali edificio
- `yearBuilt`, `totalFloors`, `totalUnits` - Info edificio
- `hasElevator`, `condition` - Caratteristiche
- `lastSurveyDate`, `nextSurveyDue` - Censimento
- `administratorName`, `administratorPhone` - Condominio

**Relazioni**:
- `properties[]` → Property (unità immobiliari nell'edificio)
- `activities[]` → Activity (visite censimento, contatti)

**Indici**: code, city+street+civic, nextSurveyDue

---

#### 4. Property
Immobili completi (da mandato diretto, censimento, scraping).

**Campi Chiave**:
- `code` - Codice univoco (PROP-2025-0001)
- `status` - draft, available, option, sold, rented, suspended, archived
- `source` - direct_mandate, census, web_scraping, cadastre
- `contractType` - sale, rent
- `propertyType` - apartment, villa, commercial, garage, land
- `city`, `zone`, `latitude`, `longitude` - Localizzazione
- `sqmCommercial`, `sqmLivable`, `rooms`, `bedrooms`, `bathrooms` - Dimensioni
- `priceSale`, `priceRentMonthly`, `priceMinAcceptable` - Prezzi
- `estimatedValue`, `estimatedDaysToSell` - Valutazione AI
- `hasElevator`, `hasParking`, `hasGarden`, etc. - Features booleane
- `condition`, `energyClass`, `heatingType` - Caratteristiche
- `mandateType`, `mandateStartDate`, `mandateEndDate` - Incarico
- `viewsCount`, `inquiriesCount`, `visitsCount`, `daysOnMarket` - Statistiche
- `photosCount`, `hasProfessionalPhotos`, `hasVirtualTour` - Media

**Relazioni**:
- `owner` → Contact (proprietario)
- `building` → Building (edificio di appartenenza)
- `matches[]` → Match (proposte generate)
- `activities[]` → Activity (visite, foto, valutazioni)

**Indici**: code, ownerContactId, buildingId, status, contractType, propertyType, city, zone, priceSale, priceRentMonthly, sqmCommercial, rooms, bedrooms, status+contractType, needsInternalVisit, mandateEndDate

---

#### 5. Request
Richieste di ricerca immobile (da clienti).

**Campi Chiave**:
- `code` - Codice univoco (REQ-2025-0001)
- `requestType` - search_buy, search_rent, valuation
- `status` - active, paused, satisfied, cancelled
- `urgency` - low, medium, high
- `contractType` - sale, rent
- `searchCities`, `searchZones` - Location (JSON array)
- `searchRadiusKm`, `centerLatitude`, `centerLongitude` - Ricerca geografica
- `propertyTypes` - Tipologie accettate (JSON array)
- `priceMin`, `priceMax` - Budget
- `sqmMin`, `sqmMax`, `roomsMin`, `bedroomsMin` - Dimensioni
- `requiresElevator`, `requiresParking`, `requiresGarden` - Features richieste
- `excludeGroundFloor`, `excludeTopFloorNoElevator` - Esclusioni
- `minCondition`, `minEnergyClass` - Requisiti qualità
- `moveDate`, `expiresAt` - Temporizzazione

**Relazioni**:
- `contact` → Contact (cliente richiedente)
- `matches[]` → Match (proposte generate per questa richiesta)
- `activities[]` → Activity (invio proposte, feedback)

**Indici**: code, contactId, status, requestType, contractType, expiresAt

---

#### 6. Match
Matching property-request con scoring AI.

**Campi Chiave**:
- `scoreTotal` - Punteggio totale (0-100)
- `scoreLocation`, `scorePrice`, `scoreSize`, `scoreFeatures` - Punteggi parziali
- `status` - suggested, selected, sent, viewed, interested, visited, rejected, offered
- `clientReaction` - positive, negative, neutral
- `rejectionReason` - too_expensive, too_small, wrong_location
- `sentDate`, `viewedDate`, `visitedDate` - Timeline

**Relazioni**:
- `request` → Request (richiesta origine)
- `property` → Property (immobile proposto)
- `contact` → Contact (cliente, per display rapido)

**Indici**: requestId+propertyId (unique), requestId, propertyId, scoreTotal, status, requestId+scoreTotal, requestId+status

---

#### 7. Activity
Timeline/CRM completo (chiamate, email, visite, task).

**Campi Chiave**:
- `activityType` - call_in, call_out, email_in, email_out, sms, whatsapp, viewing, meeting, valuation, survey, photo_session, note, task, offer_made, contract_signed, etc.
- `status` - scheduled, completed, cancelled, no_show
- `priority` - low, normal, high, urgent
- `scheduledAt`, `completedAt`, `dueDate` - Temporizzazione
- `title`, `description`, `outcome` - Contenuto
- `details` - Dettagli specifici (JSON)
- `reminderEnabled`, `reminderMinutesBefore` - Reminder

**Relazioni Polimorfiche**:
- `contact` → Contact (opzionale)
- `property` → Property (opzionale)
- `request` → Request (opzionale)
- `building` → Building (opzionale)

**Indici**: contactId, propertyId, requestId, buildingId, activityType, status, scheduledAt, completedAt, dueDate, priority

---

#### 8. Tag
Sistema di tagging universale.

**Campi Chiave**:
- `name`, `slug` - Nome e slug univoco
- `category` - property_feature, contact_type, source, status
- `color`, `icon` - UI
- `isSystem` - Tag di sistema (non eliminabile)

**Relazioni**:
- `entityTags[]` → EntityTag (associazioni tag-entità)

---

#### 9. EntityTag
Relazioni polimorfiche tag-entità.

**Campi Chiave**:
- `entityType` - contact, property, activity, request
- `entityId` - ID entità taggata

**Relazioni**:
- `tag` → Tag

**Indici**: tagId+entityType+entityId (unique), tagId, entityType+entityId

---

#### 10. AuditLog
Change tracking automatico.

**Campi Chiave**:
- `entityType`, `entityId`, `entityCode` - Entità modificata
- `actionType` - created, updated, deleted, status_changed
- `changedFields` - Campi modificati (JSON array)
- `oldValues`, `newValues` - Valori (JSON objects)
- `changesSummary` - Riassunto testuale

**Indici**: entityType+entityId, entityId, changedAt, actionType

## Setup Iniziale

### 1. Setup Prisma (TypeScript/Node.js)

```bash
# Dalla root del progetto
cd database

# Genera Prisma Client
npx prisma generate --schema=prisma/schema.prisma

# Push schema al database (sviluppo)
npx prisma db push --schema=prisma/schema.prisma

# Seed database con dati fittizi
npx prisma db seed --schema=prisma/schema.prisma

# Apri Prisma Studio (GUI per visualizzare/modificare dati)
npx prisma studio --schema=prisma/schema.prisma
```

**Script Rapidi** (dalla root):

```bash
# Linux/Mac
./database/scripts/migrate.sh

# Windows
database\scripts\migrate.bat

# Reset database (ATTENZIONE: cancella tutti i dati)
./database/scripts/reset.sh
```

### 2. Setup SQLAlchemy (Python)

**Installazione**:

```bash
pip install sqlalchemy
```

**Configurazione**:

Crea file `.env` nella root del tuo modulo Python (o usa `config/database.env.example`):

```bash
DATABASE_URL="file:../database/prisma/dev.db"
SQL_DEBUG=false
```

**Import**:

```python
from database.python import Contact, Property, Request, Match, get_db_context

# I modelli sono già sincronizzati con Prisma
# Non serve creare migrations separate
```

Vedi [database/python/README.md](python/README.md) per esempi completi di utilizzo.

## Database Condiviso Multi-Linguaggio

Il database SQLite è condiviso tra tutti i moduli dell'applicazione:

```
📍 Località Centralizzata: database/prisma/dev.db
```

**Accesso da ogni modulo:**

| Modulo | Linguaggio | Accesso | Path Relativo |
|--------|------------|---------|---------------|
| **Frontend** | TypeScript | Prisma Client | `../database/prisma/dev.db` |
| **Backend** | TypeScript | Prisma Client | `../database/prisma/dev.db` |
| **AI Tools** | Python | SQLAlchemy | `../database/prisma/dev.db` |
| **Scraping** | Python | SQLAlchemy o SQLite3 | `../database/prisma/dev.db` |

**Configurazione** (via `.env`):

```bash
# Per Node.js/Prisma
DATABASE_URL="file:./database/prisma/dev.db"

# Per Python/SQLAlchemy
DATABASE_URL="file:../database/prisma/dev.db"
```

---

## Gestione Schema e Migrations

### Fonte di Verità: Prisma Schema

⭐ **IMPORTANTE**: `prisma/schema.prisma` è l'unica fonte di verità per lo schema database.

**Workflow per Modifiche Schema**:

1. **Modifica lo schema Prisma**:
   ```bash
   # Edita database/prisma/schema.prisma
   nano database/prisma/schema.prisma
   ```

2. **Push al database (sviluppo)**:
   ```bash
   npx prisma db push --schema=database/prisma/schema.prisma
   ```

3. **Rigenera Prisma Client**:
   ```bash
   npx prisma generate --schema=database/prisma/schema.prisma
   ```

4. **Aggiorna modelli SQLAlchemy** (Python):
   ```bash
   # Edita manualmente database/python/models.py per rispecchiare le modifiche
   nano database/python/models.py
   ```

5. **Testa le modifiche**:
   ```bash
   # Test TypeScript
   npm run build

   # Test Python
   python -c "from database.python import Contact; print('OK')"
   ```

### Migrations (Produzione)

Per produzione, usa migrations versionate:

```bash
# Crea nuova migration
npx prisma migrate dev --name add_field_to_property --schema=database/prisma/schema.prisma

# Apply migrations (production)
npx prisma migrate deploy --schema=database/prisma/schema.prisma

# Reset database (ATTENZIONE: cancella tutti i dati)
npx prisma migrate reset --schema=database/prisma/schema.prisma
```

### Mantenere Sincronizzati Prisma e SQLAlchemy

**CRITICO**: Quando modifichi `prisma/schema.prisma`, aggiorna anche `python/models.py`.

**Checklist**:
- [ ] Modificato Prisma schema
- [ ] `npx prisma db push`
- [ ] `npx prisma generate`
- [ ] Aggiornato `python/models.py` (stessi nomi campi, tipi, relazioni)
- [ ] Testato query Python
- [ ] Committato entrambi i file insieme

## Seed Data

Il seed script genera dati di esempio **SOLO FITTIZI**:

```bash
npx tsx database/prisma/seed.ts
```

**Dati generati:**
- 1 profilo utente
- 50 contatti
- 10 edifici
- 100 immobili
- 30 richieste
- 50 match
- 200 attività

## Sicurezza

### File Git-Ignored

- `*.db` - Database SQLite
- `*.db-journal` - Journal SQLite
- `migrations/` - Migration files (generati)

### Dati Sensibili

⚠️ **MAI committare database con dati reali!**

Seed data deve essere:
- Nomi fittizi
- Email generiche (`user@example.com`)
- Telefoni placeholder (`+39 XXX XXX XXXX`)
- Indirizzi pubblici

## Accesso da Codice

### 1. Frontend/Backend Next.js (TypeScript)

**Setup** (in `lib/db/index.ts`):

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Utilizzo in API Routes**:

```typescript
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/properties
export async function GET(request: Request) {
  const properties = await prisma.property.findMany({
    where: { status: 'available' },
    include: {
      owner: true,
      building: true,
      matches: {
        where: { scoreTotal: { gte: 70 } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(properties);
}

// POST /api/properties
export async function POST(request: Request) {
  const body = await request.json();

  const property = await prisma.property.create({
    data: {
      code: `PROP-${Date.now()}`,
      ...body
    }
  });

  return NextResponse.json(property, { status: 201 });
}
```

**Utilizzo in Server Components**:

```typescript
import { prisma } from '@/lib/db';

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    where: { status: 'available' }
  });

  return (
    <div>
      {properties.map(p => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
```

### 2. AI Tools (Python + SQLAlchemy)

**Setup** (già fatto in `database/python/database.py`):

```python
from database.python import Contact, Property, Request, Match, get_db_context

# Query con context manager (auto-commit)
with get_db_context() as db:
    properties = db.query(Property).filter(
        Property.status == "available",
        Property.priceSale <= 300000
    ).all()

    for prop in properties:
        print(f"{prop.code} - {prop.city} - €{prop.priceSale}")
```

**Esempio Matching AI**:

```python
from database.python import Property, Request, Match, get_db_context
from datetime import datetime

def generate_matches(request_id: str):
    with get_db_context() as db:
        # Get request
        request = db.query(Request).filter(Request.id == request_id).first()

        # Find matching properties
        properties = db.query(Property).filter(
            Property.status == "available",
            Property.contractType == request.contractType,
            Property.city.in_(json.loads(request.searchCities)),
            Property.priceSale.between(request.priceMin, request.priceMax),
            Property.sqmCommercial >= request.sqmMin
        ).all()

        # Create matches with scoring
        for prop in properties:
            score = calculate_score(request, prop)  # Your AI logic

            match = Match(
                id=f"match_{uuid4()}",
                requestId=request.id,
                propertyId=prop.id,
                contactId=request.contactId,
                scoreTotal=score,
                status="suggested"
            )
            db.add(match)

        # Auto-commit on context exit
```

**Esempio Scraping**:

```python
from database.python import Property, get_db_context
from datetime import datetime

def save_scraped_property(data: dict):
    with get_db_context() as db:
        property = Property(
            id=f"prop_{uuid4()}",
            code=f"SCRAPE-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            source="web_scraping",
            sourceUrl=data['url'],
            city=data['city'],
            priceSale=data['price'],
            sqmCommercial=data['sqm'],
            rooms=data['rooms'],
            title=data['title'],
            description=data['description'],
            status="draft",
            verified=False,
            importDate=datetime.utcnow()
        )
        db.add(property)
        # Auto-commit on context exit
```

### 3. Scraping con SQLite3 Diretto (Python)

**Solo per operazioni semplici**:

```python
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "database" / "prisma" / "dev.db"

def quick_insert_property(data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO properties (id, code, city, priceSale, status, source, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    """, (
        data['id'],
        data['code'],
        data['city'],
        data['price'],
        'draft',
        'web_scraping'
    ))

    conn.commit()
    conn.close()
```

⚠️ **Preferisci SQLAlchemy** per gestione automatica di relazioni, validazioni e transazioni.

## Performance

### Indici

Il schema include indici ottimizzati per:
- Ricerche per codice (code)
- Filtri per status
- Ricerche geografiche (city, zone)
- Range di prezzo/superficie
- Relazioni (FKs)

### Query Ottimizzate

```typescript
// ✅ GOOD - Include relations
const property = await prisma.property.findUnique({
  where: { id },
  include: { owner: true, matches: true }
});

// ❌ BAD - N+1 queries
const properties = await prisma.property.findMany();
for (const p of properties) {
  const owner = await prisma.contact.findUnique({ where: { id: p.ownerContactId } });
}
```

## Backup

### Backup Manuale

```bash
# Backup database
cp database/prisma/dev.db database/prisma/backup-$(date +%Y%m%d).db

# Restore backup
cp database/prisma/backup-20250117.db database/prisma/dev.db
```

### Backup Automatico (Docker)

Docker volumes automaticamente fanno backup:

```yaml
volumes:
  - db-data:/app/database/prisma
```

## Best Practices

### 1. Gestione Transazioni

**Prisma**:
```typescript
await prisma.$transaction(async (tx) => {
  const property = await tx.property.create({ data: propertyData });
  const activity = await tx.activity.create({
    data: {
      activityType: 'note',
      title: 'Nuovo immobile inserito',
      propertyId: property.id
    }
  });
  return { property, activity };
});
```

**SQLAlchemy**:
```python
with get_db_context() as db:
    property = Property(**property_data)
    db.add(property)
    db.flush()  # Get property.id without committing

    activity = Activity(
        activityType='note',
        title='Nuovo immobile inserito',
        propertyId=property.id
    )
    db.add(activity)
    # Auto-commit on context exit
```

### 2. Ottimizzazione Query

**Prisma - Include Relations**:
```typescript
// ✅ GOOD - Single query with includes
const property = await prisma.property.findUnique({
  where: { id },
  include: {
    owner: true,
    building: true,
    matches: {
      include: { request: { include: { contact: true } } }
    }
  }
});

// ❌ BAD - N+1 queries
const properties = await prisma.property.findMany();
for (const p of properties) {
  const owner = await prisma.contact.findUnique({ where: { id: p.ownerContactId } });
}
```

**SQLAlchemy - Eager Loading**:
```python
# ✅ GOOD - Eager loading
from sqlalchemy.orm import joinedload

properties = db.query(Property).options(
    joinedload(Property.owner),
    joinedload(Property.building),
    joinedload(Property.matches).joinedload(Match.request)
).all()

# ❌ BAD - Lazy loading (N+1)
properties = db.query(Property).all()
for prop in properties:
    owner_name = prop.owner.fullName  # Triggers separate query
```

### 3. Gestione JSON in SQLite

**Prisma**:
```typescript
// Storing JSON
await prisma.property.create({
  data: {
    highlights: JSON.stringify(['balcone', 'cantina', 'posto auto'])
  }
});

// Reading JSON
const property = await prisma.property.findUnique({ where: { id } });
const highlights = JSON.parse(property.highlights || '[]');
```

**SQLAlchemy**:
```python
import json

# Storing JSON
property.highlights = json.dumps(['balcone', 'cantina', 'posto auto'])

# Reading JSON
highlights = json.loads(property.highlights or '[]')
```

### 4. Indici Composti

Per query frequenti, aggiungi indici composti in `schema.prisma`:

```prisma
model Property {
  // ...
  @@index([city, status])           // Search available in city
  @@index([status, contractType])   // Filter by status + type
  @@index([requestId, scoreTotal])  // Best matches for request
}
```

### 5. Validazione Dati

**Prisma + Zod**:
```typescript
import { z } from 'zod';

const PropertySchema = z.object({
  city: z.string().min(1),
  priceSale: z.number().positive().optional(),
  sqmCommercial: z.number().positive().optional(),
  rooms: z.number().int().min(1).optional()
});

// In API route
const validated = PropertySchema.parse(body);
const property = await prisma.property.create({ data: validated });
```

**SQLAlchemy + Pydantic**:
```python
from pydantic import BaseModel, validator

class PropertyCreate(BaseModel):
    city: str
    priceSale: Optional[float] = None
    sqmCommercial: Optional[float] = None
    rooms: Optional[int] = None

    @validator('priceSale')
    def price_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Price must be positive')
        return v

# Usage
data = PropertyCreate(**request_data)
property = Property(**data.dict())
db.add(property)
```

---

## Troubleshooting

### "Database is locked"

**Causa**: Più processi accedono al database contemporaneamente.

**Soluzione**:
1. Chiudi tutte le connessioni attive (Prisma Studio, script Python)
2. Riavvia l'applicazione
3. Per produzione, migra a PostgreSQL

```bash
# Check processi che usano il database
lsof database/prisma/dev.db  # Linux/Mac
```

### "Table does not exist"

**Causa**: Schema non sincronizzato con database.

**Soluzione**:
```bash
# Push schema al database
npx prisma db push --schema=database/prisma/schema.prisma

# O ricrea database
./database/scripts/reset.sh
```

### "Prisma Client not found"

**Causa**: Prisma Client non generato dopo modifiche schema.

**Soluzione**:
```bash
npx prisma generate --schema=database/prisma/schema.prisma
```

### "Foreign key constraint failed"

**Causa**: Tentativo di creare record con FK a record inesistente.

**Soluzione**:
```typescript
// Verifica esistenza prima di creare
const contactExists = await prisma.contact.findUnique({
  where: { id: contactId }
});

if (!contactExists) {
  throw new Error('Contact not found');
}

const property = await prisma.property.create({
  data: { ownerContactId: contactId, ... }
});
```

### "Cannot import from database.python"

**Causa**: Modulo Python non nel PYTHONPATH.

**Soluzione**:
```bash
# Dalla root del progetto
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# O installa in editable mode
pip install -e .
```

---

## Resources

### Documentation
- [Prisma Documentation](https://www.prisma.io/docs) - Prisma ORM completo
- [SQLite Documentation](https://www.sqlite.org/docs.html) - SQLite database
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org) - Python ORM
- [Zod Documentation](https://zod.dev) - TypeScript validation
- [Pydantic Documentation](https://docs.pydantic.dev) - Python validation

### Related Files
- [database/prisma/schema.prisma](prisma/schema.prisma) - Database schema (fonte di verità)
- [database/python/README.md](python/README.md) - Python SQLAlchemy usage guide
- [config/database.env.example](../config/database.env.example) - Database configuration template
- [CLAUDE.md](../CLAUDE.md) - Linee guida progetto complete

### Scripts
- [database/scripts/migrate.sh](scripts/migrate.sh) - Database migration (Linux/Mac)
- [database/scripts/migrate.bat](scripts/migrate.bat) - Database migration (Windows)
- [database/scripts/reset.sh](scripts/reset.sh) - Database reset with backup

---

## Changelog

### 2025-01-17 - FASE 8: Standardizzazione Database
- ✅ Creato layer database centralizzato in `/database`
- ✅ Prisma schema come fonte di verità
- ✅ SQLAlchemy models mirror per Python
- ✅ Database utilities e context managers
- ✅ Script migrazione multi-platform
- ✅ Documentazione completa e best practices
