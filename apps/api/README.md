# CRM Immobiliare - Backend API

Backend NestJS per CRM Immobiliare con Clean Architecture e Domain-Driven Design.

## 🏗️ Architettura

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│     PRESENTATION LAYER              │
│  (Controllers, DTOs, Gateways)      │
│  ↓ depends on                       │
├─────────────────────────────────────┤
│     APPLICATION LAYER               │
│  (Services, Use Cases, Workers)     │
│  ↓ depends on                       │
├─────────────────────────────────────┤
│     DOMAIN LAYER                    │
│  (Entities, Value Objects)          │
│  ↑ NO dependencies (pure business)  │
├─────────────────────────────────────┤
│     INFRASTRUCTURE LAYER            │
│  (Repositories, Adapters, DB)       │
│  → implements interfaces from Domain│
└─────────────────────────────────────┘
```

### Directory Structure

```
src/
├── main.ts                 # Application bootstrap
├── app.module.ts           # Root module
│
├── core/                   # Framework layer
│   ├── config/             # Environment validation
│   ├── middleware/         # Logger, correlation-id
│   ├── filters/            # Exception handling
│   ├── interceptors/       # Response transformation
│   └── guards/             # JWT authentication
│
├── shared/                 # Shared infrastructure
│   ├── database/           # Prisma service
│   ├── cache/              # Redis service
│   ├── queue/              # BullMQ service
│   ├── storage/            # MinIO service
│   └── websocket/          # Socket.io gateway
│
└── modules/                # Feature modules (DDD)
    ├── auth/               ✅ COMPLETE - JWT + Google OAuth
    ├── properties/         ✅ COMPLETE - Property CRUD
    ├── clients/            ✅ COMPLETE - Client CRUD
    ├── matching/           🔴 SKELETON - To be implemented
    ├── scraping/           🔴 SKELETON - To be implemented
    ├── ai-assistant/       🔴 SKELETON - To be implemented
    ├── integrations/       🔴 SKELETON - To be implemented
    ├── analytics/          🔴 SKELETON - To be implemented
    └── tasks/              🔴 SKELETON - To be implemented
```

## ✅ Implemented Features (Phase 1)

### Core Layer
- ✅ Environment validation with Joi
- ✅ Request logging middleware
- ✅ Correlation ID tracking
- ✅ Global exception filter
- ✅ Response transformation interceptor
- ✅ JWT authentication guard

### Shared Infrastructure
- ✅ Prisma database integration
- ✅ Redis caching service
- ✅ BullMQ job queue
- ✅ MinIO object storage
- ✅ Socket.io WebSocket gateway

### Auth Module
- ✅ JWT token generation & validation
- ✅ Google OAuth integration
- ✅ User repository
- ✅ Auth controllers & strategies

### Properties Module
- ✅ Property entity (domain)
- ✅ Properties service (application)
- ✅ Property repository (infrastructure)
- ✅ Properties controller (presentation)
- ✅ Full CRUD operations
- ✅ Map bounding box queries

### Clients Module
- ✅ Client entity (domain)
- ✅ Clients service (application)
- ✅ Client repository (infrastructure)
- ✅ Clients controller (presentation)
- ✅ Full CRUD operations

## 🔴 To Be Implemented (Phase 2-5)

### Phase 2: Business Logic
- [ ] **Matching Module**
  - [ ] 7-component scoring algorithm
  - [ ] Zone scorer (peso: 25%)
  - [ ] Budget scorer (peso: 20%)
  - [ ] Type scorer (peso: 15%)
  - [ ] Surface scorer (peso: 15%)
  - [ ] Availability scorer (peso: 10%)
  - [ ] Priority scorer (peso: 10%)
  - [ ] Affinity scorer (peso: 5%)
  - [ ] Match result aggregation

- [ ] **AI Toolkit Package** (`packages/ai-toolkit/`)
  - [ ] Create package structure
  - [ ] Datapizza AI wrapper
  - [ ] Base agent class
  - [ ] 5 specialized agents
  - [ ] 11 custom tools

- [ ] **AI Assistant Module**
  - [ ] AI orchestrator service
  - [ ] Agent wrappers
  - [ ] Chat controller
  - [ ] WebSocket chat gateway

- [ ] **Scraping Module**
  - [ ] Portal parsers (immobiliare.it, casa.it, idealista.it)
  - [ ] Playwright browser automation
  - [ ] Session management
  - [ ] BullMQ worker for background scraping
  - [ ] WebSocket for progress updates

### Phase 3: Integrations
- [ ] **Integrations Module**
  - [ ] Gmail sync & parsing
  - [ ] Google Calendar bidirectional sync
  - [ ] WhatsApp webhook handling
  - [ ] Background sync workers
  - [ ] Message processing queue

- [ ] **Analytics Module**
  - [ ] Property statistics
  - [ ] Client statistics
  - [ ] Report generation
  - [ ] Data aggregation queries

- [ ] **Tasks Module**
  - [ ] Activity CRUD
  - [ ] Urgency calculation
  - [ ] Task assignment
  - [ ] Deadline tracking

### Phase 4: Infrastructure
- [ ] Testing
  - [ ] Unit tests (Jest)
  - [ ] Integration tests
  - [ ] E2E tests
  - [ ] Test coverage reports

- [ ] CI/CD
  - [ ] GitHub Actions workflows
  - [ ] Automated testing
  - [ ] Docker build & deploy
  - [ ] Environment management

- [ ] Documentation
  - [ ] OpenAPI/Swagger complete
  - [ ] API documentation
  - [ ] Development guide
  - [ ] Deployment guide

## 🚀 Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or SQLite for dev)
- Redis 7
- MinIO (optional for local dev)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Generate Prisma client
pnpm prisma:generate

# Push database schema
pnpm prisma:push

# Start development server
pnpm start:dev
```

### Scripts

```bash
pnpm start          # Start production
pnpm start:dev      # Start development (watch mode)
pnpm start:debug    # Start debug mode
pnpm build          # Build for production
pnpm lint           # Lint code
pnpm test           # Run tests
pnpm test:watch     # Run tests in watch mode
pnpm test:cov       # Test coverage
```

### Environment Variables

See `.env.example` for all required configuration.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `REDIS_HOST` - Redis host
- `MINIO_ENDPOINT` - MinIO endpoint

## 📚 API Documentation

Once running, visit:
- Swagger UI: http://localhost:3001/api/docs
- API endpoint: http://localhost:3001/api

## 🏗️ Module Template

Each feature module follows this structure:

```
module-name/
├── module.ts                     # NestJS module definition
├── domain/                       # Business logic (NO dependencies)
│   ├── entities/
│   │   └── entity.ts
│   ├── value-objects/
│   │   └── value-object.ts
│   └── interfaces/
│       └── repository.interface.ts
├── application/                  # Use cases & services
│   ├── services/
│   │   └── service.ts
│   └── use-cases/
│       └── use-case.ts
├── infrastructure/               # Technical implementations
│   ├── repositories/
│   │   └── repository.ts
│   └── adapters/
│       └── adapter.ts
├── presentation/                 # API layer
│   ├── controllers/
│   │   └── controller.ts
│   └── dto/
│       └── dto.ts
└── tests/                        # Tests
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🔗 Related Packages

- `@crm-immobiliare/database` - Prisma schema & client
- `@crm-immobiliare/shared-types` - Types, DTOs, enums
- `@crm-immobiliare/utils` - Shared utilities
- `@crm-immobiliare/ai-toolkit` - AI agents & tools (to be created)

## 📖 References

- [NestJS Documentation](https://docs.nestjs.com)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD](https://martinfowler.com/tags/domain%20driven%20design.html)
- Architecture docs: `../../docs/architecture/`
