# Backend API - CRM Immobiliare

**Next.js 14 App Router** - API Backend per CRM Immobiliare

**Port**: 3001

---

## 🚀 Quick Start

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp ../config/backend.env.example .env

# Configure .env (set DATABASE_URL, etc.)

# Generate Prisma client
npx prisma generate --schema=../database/prisma/schema.prisma

# Start development server
npm run dev
```

Server disponibile su: http://localhost:3001

---

## 📦 Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM + SQLite (shared con altri moduli)
- **Validation**: Zod
- **Runtime**: Node.js 20+

---

## 📁 Struttura

```
backend/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── health/       # Health check endpoint
│   │   │   ├── chat/         # Chat endpoint
│   │   │   └── ai/           # AI proxy endpoints
│   │   │       ├── chat/
│   │   │       ├── matching/
│   │   │       └── briefing/
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Info page
│   └── lib/
│       ├── db/               # Prisma client
│       ├── api/              # API utilities
│       └── validation/       # Zod schemas
├── .env                      # Environment variables (git-ignored)
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md                 # This file
```

---

## 🔌 API Endpoints

### Health Check
```bash
GET http://localhost:3001/api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T12:00:00Z"
}
```

### AI Proxy Endpoints

#### Chat (RAG Assistant)
```bash
POST http://localhost:3001/api/ai/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Mostrami appartamenti a Milano" }
  ]
}
```

Proxy to: `http://localhost:8000/ai/chat`

#### Matching
```bash
POST http://localhost:3001/api/ai/matching
```

Proxy to: `http://localhost:8000/ai/matching`

#### Daily Briefing
```bash
POST http://localhost:3001/api/ai/briefing
```

Proxy to: `http://localhost:8000/ai/briefing`

---

## ⚙️ Configuration

### Environment Variables

**File**: `.env`
**Template**: `../config/backend.env.example`

```bash
# Database (shared with all modules)
DATABASE_URL="file:../database/prisma/dev.db"

# Server
PORT=3001
NODE_ENV=development

# AI Tools Integration
PYTHON_AI_URL="http://localhost:8000"

# Google AI (optional)
GOOGLE_API_KEY=""
```

---

## 🗄️ Database

### Prisma Setup

```bash
# Generate Prisma client
npx prisma generate --schema=../database/prisma/schema.prisma

# Push schema to database
cd ../database/prisma && npx prisma db push

# Open Prisma Studio
cd ../database/prisma && npx prisma studio
```

### Database Path

Il backend usa il database centralizzato:
```
../database/prisma/dev.db
```

Shared con frontend, ai_tools e scraping.

---

## 🛠️ Development

### Scripts NPM

```bash
# Development (porta 3001)
npm run dev

# Build production
npm run build

# Start production server
npm start

# Linting
npm run lint

# Prisma commands
npm run prisma:generate   # Generate client
npm run prisma:push       # Push schema
npm run prisma:studio     # Open Studio
```

### Hot Reload

Il server supporta hot reload automatico in development mode.

---

## 🧪 Testing

```bash
# Unit tests (future)
npm test

# Integration tests (future)
npm run test:integration

# E2E tests (future)
npm run test:e2e
```

---

## 📚 API Documentation

### Adding New Endpoints

1. **Create route file**:
```typescript
// src/app/api/myroute/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Process request
  return NextResponse.json({ success: true });
}
```

2. **Add validation** (optional):
```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  email: z.string().email()
});

const validated = schema.parse(body);
```

3. **Use Prisma** (if needed):
```typescript
import { prisma } from '@/lib/db';

const users = await prisma.user.findMany();
```

---

## 🐳 Docker

### Build Image

```bash
docker build -t crm-backend .
```

### Run Container

```bash
docker run -p 3001:3001 \
  -e DATABASE_URL="file:./dev.db" \
  -e PYTHON_AI_URL="http://ai-tools:8000" \
  crm-backend
```

### Docker Compose

```bash
# From project root
docker-compose -f config/docker-compose.yml up backend
```

---

## 🔒 Security

### Environment Variables
- ❌ **MAI** committare `.env`
- ✅ Usa `../config/backend.env.example` come template
- ✅ `.env` è git-ignored

### API Security (Future)
- [ ] Rate limiting
- [ ] Authentication (JWT)
- [ ] CORS configuration
- [ ] Input validation (Zod)

---

## 🐛 Troubleshooting

### "Port 3001 already in use"
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### "Database not found"
```bash
# Verify database exists
ls ../database/prisma/dev.db

# If not, create it
cd ../database/prisma
npx prisma db push
```

### "Prisma client not generated"
```bash
npx prisma generate --schema=../database/prisma/schema.prisma
```

### "AI Tools connection refused"
```bash
# Verify AI Tools is running
curl http://localhost:8000/health

# Start AI Tools
cd ../ai_tools
python main.py
```

---

## 📖 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Zod Docs](https://zod.dev)

---

**Version**: 2.0.0
**Last Updated**: 2025-10-17
