# DataPizza AI - Setup e Guida all'Uso

Guida completa per l'integrazione e l'utilizzo del framework DataPizza AI nel CRM Immobiliare.

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Architettura](#architettura)
3. [Setup Backend Python](#setup-backend-python)
4. [Setup Frontend Next.js](#setup-frontend-nextjs)
5. [Funzionalità AI Disponibili](#funzionalità-ai-disponibili)
6. [Utilizzo](#utilizzo)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🌟 Panoramica

Il progetto integra **DataPizza AI Framework** (Python) con l'applicazione Next.js esistente, fornendo:

- **RAG Assistant**: Chat intelligente con accesso al database CRM
- **AI-Powered Matching**: Matching semantico property-request con reasoning
- **Daily Briefing**: Briefing giornaliero automatico personalizzato
- **Vector Search**: Ricerca semantica su immobili e documenti (futuro)

### Stack Tecnologico

```
Frontend (Next.js)  →  API Proxy  →  Python Backend (FastAPI)  →  Database (SQLite)
                                              ↓
                                        Google Gemini
                                              ↓
                                      DataPizza AI Framework
```

---

## 🏗️ Architettura

```
CRM Immobiliare/
├── src/                           # Frontend Next.js
│   ├── app/api/ai/                # API proxy routes
│   │   ├── chat/route.ts          # Proxy to RAG Assistant
│   │   ├── matching/route.ts      # Proxy to Matching Agent
│   │   └── briefing/route.ts      # Proxy to Briefing Agent
│   └── hooks/                     # React Query hooks
│       ├── useAIChat.ts
│       ├── useAIMatching.ts
│       └── useAIBriefing.ts
│
└── python_ai/                     # Backend Python
    ├── main.py                    # FastAPI server
    ├── requirements.txt           # Python dependencies
    ├── .env                       # Python environment vars (GIT-IGNORED)
    ├── .env.example              # Environment template
    │
    └── app/
        ├── config.py              # Configuration
        ├── database.py            # SQLAlchemy → SQLite
        ├── models.py              # DB models (mirror Prisma)
        │
        ├── agents/                # DataPizza AI Agents
        │   ├── rag_assistant.py   # RAG chat agent
        │   ├── matching_agent.py  # Matching AI agent
        │   └── briefing_agent.py  # Daily briefing agent
        │
        ├── tools/                 # Custom DataPizza Tools
        │   ├── db_query_tool.py   # Database query tools
        │   ├── property_search_tool.py
        │   └── contact_search_tool.py
        │
        └── routers/               # FastAPI routes
            ├── chat.py            # /ai/chat endpoints
            ├── matching.py        # /ai/matching endpoints
            └── briefing.py        # /ai/briefing endpoints
```

---

## 🐍 Setup Backend Python

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

**Dipendenze principali:**
- `datapizza-ai` - Framework core
- `datapizza-ai-clients-google` - Google Gemini client
- `fastapi` - Web framework
- `sqlalchemy` - Database ORM
- `qdrant-client` - Vector store (opzionale)

### 3. Configurazione Environment

```bash
# Copia template
cp .env.example .env

# Modifica .env con editor
nano .env  # o code .env
```

**Variabili OBBLIGATORIE:**

```bash
# Database (condiviso con Next.js/Prisma)
DATABASE_URL=sqlite:///../prisma/dev.db

# Google AI Studio API Key (OBBLIGATORIA)
GOOGLE_API_KEY=your_api_key_here

# Server
HOST=127.0.0.1
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Ottieni Google API Key:**
1. Vai su [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Crea un nuovo progetto (se necessario)
3. Genera una API key
4. Copia e incolla in `.env`

### 4. Avvio Server FastAPI

```bash
# Development (con auto-reload)
uvicorn main:app --reload --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Verifica:**
- Server: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## ⚛️ Setup Frontend Next.js

### 1. Configurazione Environment

Aggiungi al file `.env.local` (root del progetto):

```bash
# Esistenti
DATABASE_URL="file:./prisma/dev.db"
GOOGLE_API_KEY="your_google_ai_api_key"

# NUOVO - Backend Python
PYTHON_AI_URL="http://localhost:8000"
```

### 2. Installazione Dipendenze

Le dipendenze sono già configurate in `package.json`. Se necessario:

```bash
npm install
```

### 3. Avvio Next.js Dev Server

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

---

## 🤖 Funzionalità AI Disponibili

### 1. RAG Assistant (Chat Intelligente)

**Endpoint**: `POST /api/ai/chat`

**Cosa fa:**
- Risponde a domande in linguaggio naturale sul database CRM
- Cerca immobili con query semantiche
- Trova clienti e le loro richieste
- Analizza match e statistiche

**Esempio di query supportate:**
- "Mostrami tutti gli appartamenti disponibili a Corbetta sotto i 200.000€"
- "Chi sono i clienti VIP che cercano casa?"
- "Trova immobili con giardino e parcheggio a Milano"
- "Quali richieste attive ho per trilocali?"
- "Dammi statistiche sugli immobili in vendita"

**Tools disponibili:**
- `query_properties_tool` - Cerca immobili con filtri
- `property_search_tool` - Ricerca semantica immobili
- `query_contacts_tool` - Cerca contatti
- `contact_search_tool` - Ricerca semantica contatti
- `query_requests_tool` - Cerca richieste clienti
- `query_matches_tool` - Trova match esistenti

---

### 2. AI-Powered Matching

**Endpoint**: `POST /api/ai/matching`

**Cosa fa:**
- Migliora il matching deterministico con analisi semantica
- Genera motivi del match in linguaggio naturale
- Identifica punti di forza da evidenziare
- Suggerisce come gestire potenziali obiezioni

**Input:**
```json
{
  "request_id": "req_123",
  "property_id": "prop_456",
  "algorithmic_score": 85
}
```

**Output:**
```json
{
  "success": true,
  "algorithmicScore": 85,
  "finalScore": 85,
  "aiAnalysis": "Questo immobile è perfetto per il cliente perché..."
}
```

---

### 3. Daily Briefing

**Endpoint**: `GET /api/ai/briefing`

**Cosa fa:**
- Genera briefing giornaliero personalizzato
- Analizza attività del giorno
- Identifica priorità e opportunità
- Segnala scadenze e urgenze

**Sezioni del briefing:**
1. 📅 Panoramica Giornata
2. 🎯 Priorità Oggi
3. 📞 Appuntamenti e Follow-up
4. 💰 Opportunità da Cogliere
5. ⚠️ Alert e Scadenze
6. 📊 Metriche Performance

---

## 💻 Utilizzo

### Frontend (React/Next.js)

#### Chat con RAG Assistant

```typescript
import { useAIChat } from '@/hooks/useAIChat';
import { useState } from 'react';

function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { mutate: sendMessage, isLoading } = useAIChat();

  const handleSend = (content: string) => {
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);

    sendMessage(
      { messages: newMessages },
      {
        onSuccess: (response) => {
          setMessages([...newMessages, {
            role: response.role,
            content: response.content
          }]);
        },
      }
    );
  };

  return (
    // UI component...
  );
}
```

#### Matching AI-Enhanced

```typescript
import { useAIMatchEnhance } from '@/hooks/useAIMatching';

function MatchDetails({ requestId, propertyId, score }) {
  const { mutate: enhance, data, isLoading } = useAIMatchEnhance();

  const handleEnhance = () => {
    enhance({
      request_id: requestId,
      property_id: propertyId,
      algorithmic_score: score
    });
  };

  return (
    <div>
      <p>Score: {score}/100</p>
      <button onClick={handleEnhance}>
        Analizza con AI
      </button>
      {data && <div>{data.aiAnalysis}</div>}
    </div>
  );
}
```

#### Daily Briefing

```typescript
import { useDailyBriefing } from '@/hooks/useAIBriefing';

function DashboardBriefing() {
  const { data, isLoading, error } = useDailyBriefing();

  if (isLoading) return <div>Generating briefing...</div>;
  if (error) return <div>Error loading briefing</div>;

  return (
    <div>
      <h2>{data.date}</h2>
      <div dangerouslySetInnerHTML={{ __html: data.briefing }} />
    </div>
  );
}
```

### Backend (Python/FastAPI)

#### Testare Direttamente con curl

**Chat:**
```bash
curl -X POST http://localhost:8000/ai/chat/ \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Mostrami appartamenti a Corbetta"}]}'
```

**Matching:**
```bash
curl -X POST http://localhost:8000/ai/matching/enhance \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "req_123",
    "property_id": "prop_456",
    "algorithmic_score": 85
  }'
```

**Briefing:**
```bash
curl http://localhost:8000/ai/briefing/daily
```

---

## 🧪 Testing

### 1. Verifica Backend Python

```bash
# Health check
curl http://localhost:8000/health

# AI Status
curl http://localhost:8000/ai/status
```

**Output atteso:**
```json
{
  "status": "ready",
  "google_model": "gemini-1.5-pro",
  "agents": {
    "rag_assistant": "ready",
    "matching_agent": "ready",
    "briefing_agent": "ready"
  }
}
```

### 2. Test Chat Agent

```bash
curl -X POST http://localhost:8000/ai/chat/ \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Quanti immobili abbiamo?"}]}'
```

### 3. Test Integrazione Next.js

```bash
# Assicurati che entrambi i server siano attivi:
# - Next.js su :3000
# - Python su :8000

# Test API proxy
curl http://localhost:3000/api/ai/chat
```

---

## 🐛 Troubleshooting

### Errore: "Module datapizza not found"

```bash
cd python_ai
pip install -r requirements.txt
```

### Errore: "Backend AI non raggiungibile"

1. Verifica che il server Python sia attivo: `curl http://localhost:8000/health`
2. Controlla il valore di `PYTHON_AI_URL` in `.env.local`
3. Verifica CORS in `python_ai/app/config.py`

### Errore: "Google API Key invalid"

1. Verifica che `GOOGLE_API_KEY` sia correttamente configurata in `python_ai/.env`
2. Testa la chiave su [Google AI Studio](https://aistudio.google.com)
3. Controlla i log del server Python per dettagli

### Errore: "Database locked"

SQLite non supporta alta concorrenza. Soluzioni:
1. Aumenta timeout in `python_ai/app/database.py`
2. Riduci il numero di richieste simultanee
3. Per produzione, considera PostgreSQL

### Chat non risponde / Timeout

1. Controlla i log Python per errori
2. Verifica connessione Google AI
3. Aumenta `AI_TIMEOUT` in `python_ai/.env`
4. Riduci `AI_MAX_TOKENS` se necessario

---

## 📊 Monitoraggio e Logs

### Logs Backend Python

Il server FastAPI stampa logs dettagliati:

```bash
# Avvia con log debug
uvicorn main:app --reload --log-level debug
```

### OpenTelemetry Tracing

Per abilitare tracing dettagliato, imposta in `python_ai/.env`:

```bash
ENABLE_TRACING=true
LOG_LEVEL=DEBUG
```

---

## 🚀 Prossimi Passi

### Funzionalità Future

1. **Document Processing Agent**: Upload e analisi PDF (contratti, planimetrie)
2. **Qdrant Vector Store**: Ricerca semantica avanzata su documenti
3. **Web Scraping AI**: Importazione automatica da portali immobiliari
4. **Voice Assistant**: Integrazione vocale con Gemini

### Ottimizzazioni

1. **Caching Avanzato**: Redis per cache AI responses
2. **Rate Limiting**: Protezione endpoint pubblici
3. **Authentication**: JWT tokens per sicurezza
4. **Database Migration**: PostgreSQL per produzione

---

## 📚 Risorse

- [DataPizza AI Docs](https://docs.datapizza.ai)
- [Google AI Studio](https://aistudio.google.com)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Query Docs](https://tanstack.com/query/latest)

---

## 🤝 Supporto

Per problemi o domande:
1. Controlla questa documentazione
2. Consulta i logs del server Python e Next.js
3. Verifica le configurazioni `.env`
4. Testa gli endpoint direttamente con curl

---

**Versione:** 1.0.0
**Data:** Ottobre 2025
**Autore:** CRM Immobiliare Team
