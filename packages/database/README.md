# @crm-immobiliare/database

Database package for CRM Immobiliare - Provides Prisma schema, client, and types.

## Features

- **Single Source of Truth**: Prisma schema defines all database entities
- **Type Safety**: Auto-generated TypeScript types
- **Singleton Client**: Optimized connection pooling
- **Migrations**: Version-controlled schema changes

## Usage

```typescript
import { prisma } from '@crm-immobiliare/database';

// Use the client
const properties = await prisma.property.findMany();
```

## Scripts

- `npm run generate` - Generate Prisma client
- `npm run push` - Push schema to database
- `npm run studio` - Open Prisma Studio
- `npm run seed` - Seed database with test data
- `npm run migrate` - Create and apply migrations

## Database Models

- **UserProfile** - User/agent profile
- **Contact** - Unified contacts (clients, owners, leads)
- **Building** - Building census
- **Property** - Real estate listings
- **Request** - Client search requests
- **Match** - AI-powered property-request matching
- **Activity** - CRM timeline (calls, visits, emails)
- **Tag** - Universal tagging system
- **CustomFieldDefinition** - User-defined fields
- **ScrapingJob/Session** - Web scraping
- **AgentConversation/Task/Memory** - AI agents
- **IntegrationAuth** - OAuth credentials
- **MessageLog** - Email/WhatsApp messages
- **CalendarSync** - Google Calendar sync

## Environment Variables

Required `.env` variables:

```env
DATABASE_URL="file:./dev.db"  # SQLite for dev
# DATABASE_URL="postgresql://..." # PostgreSQL for production
```
