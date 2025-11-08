# CRM Immobiliare - Python AI Backend

Backend Python con DataPizza AI Framework per funzionalità AI avanzate.

## 🚀 Architettura

```
Next.js (Frontend)  →  FastAPI (AI Backend)  →  SQLite Database
                                              ↓
                                         Qdrant (Vector Store)
                                              ↓
                                      Google Gemini (AI)
```

## 📦 Setup

### 1. Creazione Virtual Environment

```bash
cd python_ai

# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Installazione Dipendenze

```bash
pip install -r requirements.txt
```

### 3. Configurazione Environment

```bash
# Copia template
cp .env.example .env

# Modifica .env con le tue API keys
# IMPORTANTE: Aggiungi la tua GOOGLE_API_KEY da https://aistudio.google.com/
```

### 4. Avvio Server

```bash
# Development con auto-reload
uvicorn main:app --reload --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

Il server sarà disponibile su: `http://localhost:8000`

API Docs (Swagger): `http://localhost:8000/docs`

## 🤖 Agenti AI Disponibili

### 1. RAG Assistant Agent
**Endpoint**: `POST /ai/chat`

Chat intelligente con accesso al database tramite RAG.

**Esempio**:
```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Mostrami appartamenti a Corbetta sotto 200k"}]}'
```

### 2. AI Matching Agent
**Endpoint**: `POST /ai/matching/enhance`

Matching AI-powered tra immobili e richieste clienti.

**Esempio**:
```bash
curl -X POST http://localhost:8000/ai/matching/enhance \
  -H "Content-Type: application/json" \
  -d '{"request_id": "req_123", "property_ids": ["prop_456", "prop_789"]}'
```

### 3. Daily Briefing Agent
**Endpoint**: `GET /ai/briefing/daily`

Genera briefing giornaliero personalizzato.

**Esempio**:
```bash
curl http://localhost:8000/ai/briefing/daily
```

### 4. Document Processing Agent
**Endpoint**: `POST /ai/documents/ingest`

Elabora e indicizza documenti (PDF, DOCX).

**Esempio**:
```bash
curl -X POST http://localhost:8000/ai/documents/ingest \
  -F "file=@contratto.pdf" \
  -F "entity_type=property" \
  -F "entity_id=prop_123"
```

## 📂 Struttura Progetto

```
python_ai/
├── main.py                    # FastAPI entry point
├── requirements.txt           # Dipendenze Python
├── .env.example              # Template variabili ambiente
├── README.md                 # Questa documentazione
│
├── app/
│   ├── __init__.py
│   ├── config.py             # Configurazione da .env
│   ├── database.py           # SQLAlchemy connection
│   ├── models.py             # SQLAlchemy models (mirror Prisma)
│   │
│   ├── agents/               # DataPizza AI Agents
│   │   ├── __init__.py
│   │   ├── rag_assistant.py
│   │   ├── matching_agent.py
│   │   ├── briefing_agent.py
│   │   └── document_agent.py
│   │
│   ├── tools/                # Custom DataPizza Tools
│   │   ├── __init__.py
│   │   ├── db_query_tool.py
│   │   ├── property_search_tool.py
│   │   └── contact_search_tool.py
│   │
│   ├── pipelines/            # DataPizza Pipelines
│   │   ├── __init__.py
│   │   ├── ingestion_pipeline.py
│   │   └── rag_pipeline.py
│   │
│   ├── routers/              # FastAPI routes
│   │   ├── __init__.py
│   │   ├── chat.py
│   │   ├── matching.py
│   │   ├── briefing.py
│   │   └── documents.py
│   │
│   └── utils/
│       ├── __init__.py
│       └── tracing.py
│
└── .cache/                   # Cache directory (git-ignored)
```

## 🔧 Comandi Utili

```bash
# Formattazione codice
black app/

# Testing
pytest

# Verifica dipendenze
pip list

# Aggiornamento dipendenze
pip install --upgrade -r requirements.txt
```

## 🗄️ Database

Il backend Python accede allo stesso database SQLite usato da Prisma:

- **Path**: `../prisma/dev.db`
- **ORM**: SQLAlchemy (models mirror Prisma schema)
- **Accesso**: Read/Write condiviso con Next.js

## 🔍 Vector Store (Qdrant)

### Opzione 1: In-Memory (Development)
```bash
# Nel .env
QDRANT_MODE=memory
```

### Opzione 2: Docker (Production)
```bash
# Avvia Qdrant
docker run -p 6333:6333 -v $(pwd)/.cache/qdrant:/qdrant/storage qdrant/qdrant

# Nel .env
QDRANT_MODE=server
QDRANT_HOST=localhost
QDRANT_PORT=6333
```

## 📊 Observability

### OpenTelemetry Tracing

Il backend include tracing completo per debugging:

```python
from datapizza.tracing import ContextTracing

with ContextTracing().trace("my_operation"):
    result = agent.run(query)
```

### Logs

Logs strutturati in JSON o console (configurabile via `LOG_FORMAT` in `.env`).

## 🔐 Sicurezza

- ✅ Tutte le API keys in `.env` (git-ignored)
- ✅ Validazione input con Pydantic
- ✅ CORS configurato per localhost:3000
- ✅ Rate limiting (TODO)
- ✅ Authentication (TODO - Fase futura)

## 🐛 Troubleshooting

### Errore: "Module datapizza not found"
```bash
pip install -r requirements.txt
```

### Errore: "Database locked"
SQLite non supporta concorrenza elevata. Soluzioni:
- Usa timeout più alto in `database.py`
- Considera migrazione a PostgreSQL per produzione

### Errore: "Google API Key invalid"
Verifica che `GOOGLE_API_KEY` in `.env` sia corretta.

## 📚 Risorse

- [DataPizza AI Docs](https://docs.datapizza.ai)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Google AI Studio](https://aistudio.google.com)
- [Qdrant Docs](https://qdrant.tech/documentation)

## 🤝 Integrazione con Next.js

Il frontend Next.js chiama questo backend tramite API proxy:

```typescript
// src/app/api/ai/chat/route.ts
const response = await fetch('http://localhost:8000/ai/chat', {
  method: 'POST',
  body: JSON.stringify({ messages }),
});
```

Vedi documentazione Next.js per dettagli.
