# Architecture Overview

## System Architecture

CRM Immobiliare is built as a **monorepo** using a **Clean Architecture** approach with **Domain-Driven Design (DDD)** principles.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Web)                     │
│              React + Next.js + TypeScript            │
│         TanStack Query + Zustand + Tailwind          │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP/REST + WebSocket
┌─────────────────▼───────────────────────────────────┐
│                Backend API (Future)                  │
│                  NestJS + TypeScript                 │
│         Prisma + Redis + BullMQ + Socket.io          │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    │             │             │             │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐    ┌───▼────┐
│SQLite/│    │ AI    │    │MinIO  │    │Google  │
│Postgre│    │Tools  │    │(S3)   │    │APIs    │
│  SQL  │    │Python │    │       │    │        │
└───────┘    └───────┘    └───────┘    └────────┘
```

## Technology Stack

### Frontend (23 core dependencies)
- **React 18.3.1** - UI library
- **Next.js 14.2.18** - React framework
- **TypeScript 5.8.3** - Type safety
- **TanStack Query 5.17.0** - Data fetching
- **Zustand 4.4.7** - State management
- **Tailwind CSS 3.4.0** - Styling
- **Lucide React 0.312.0** - Icons
- **Framer Motion 11.0.0** - Animations

### Backend (Future - NestJS)
- **NestJS 10.3.0** - Backend framework
- **Prisma 5.8.0** - ORM
- **Passport 0.7.0** - Authentication
- **Socket.io 4.6.0** - Real-time communication
- **ioredis 5.3.2** - Redis client

### AI & Tools
- **Google Generative AI** - Gemini AI
- **Playwright 1.41.0** - Web scraping
- **Python FastAPI** - AI service backend

### Infrastructure
- **BullMQ 5.1.0** - Job queue
- **MinIO 7.1.3** - Object storage
- **prom-client 15.1.0** - Metrics

## Architectural Patterns

### 1. Clean Architecture (Onion Architecture)

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  (Controllers, Components, DTOs)        │
│  ↓ depends on                           │
├─────────────────────────────────────────┤
│         APPLICATION LAYER               │
│  (Services, Use Cases, Workers)         │
│  ↓ depends on                           │
├─────────────────────────────────────────┤
│         DOMAIN LAYER                    │
│  (Entities, Value Objects, Algorithms)  │
│  ↑ NO dependencies (pure business)      │
├─────────────────────────────────────────┤
│         INFRASTRUCTURE LAYER            │
│  (Repos, Adapters, DB, Cache, Queue)   │
│  → implements interfaces from Domain    │
└─────────────────────────────────────────┘
```

**Key Principle**: Dependencies point inward. The Domain layer is at the center and has NO dependencies.

### 2. Domain-Driven Design (DDD)

#### Bounded Contexts

- **Properties Context** - Real estate listings, buildings
- **Clients Context** - Contacts, leads, preferences
- **Matching Context** - AI-powered matching algorithm
- **Scraping Context** - Web scraping orchestration
- **AI Context** - AI agents and tools
- **Integrations Context** - External services (Gmail, Calendar, WhatsApp)
- **Analytics Context** - Reports and statistics
- **Tasks Context** - Activities and task management

#### Communication Between Contexts

- **Domain Events** - Asynchronous communication
- **Shared Kernel** - Shared types (packages/shared-types)
- **Anti-Corruption Layer** - Adapters for external dependencies

### 3. Feature-First Organization (Frontend)

```
features/
├── properties/
│   ├── components/     # UI components
│   ├── hooks/          # Custom hooks
│   ├── store/          # Zustand state
│   ├── api/            # API calls
│   └── pages/          # Routes
├── clients/
│   └── ...
└── ...
```

Each feature is self-contained and includes everything it needs.

## Data Flow

### Write Operation (Create Property)

```
User Input → Component → API Hook → Backend API → Service → Repository → Database
```

### Read Operation (Load Properties)

```
Database → Repository → Service → Backend API → API Hook → Component → UI
```

### Real-time Update (WebSocket)

```
Backend Event → WebSocket Gateway → Frontend Listener → State Update → UI Re-render
```

## Security Layers

1. **API Layer**: JWT validation, rate limiting, CORS
2. **Data Layer**: Encrypted fields, audit logging
3. **Infrastructure**: TLS, secrets management, network isolation

## Scalability Considerations

- **Horizontal Scaling**: Stateless API servers
- **Database**: Connection pooling, read replicas
- **Caching**: Redis for frequently accessed data
- **Background Jobs**: BullMQ for async operations
- **File Storage**: MinIO for scalable object storage

## Monitoring & Observability

- **Metrics**: Prometheus metrics
- **Logging**: Structured logging
- **Tracing**: Request correlation IDs
- **Health Checks**: /health endpoint

## Next Steps

See individual ADRs (Architecture Decision Records) for specific design decisions.
