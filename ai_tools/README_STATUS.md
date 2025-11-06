# AI Tools - Status & Setup

**Status attuale**: ⚠️ Funzionale ma richiede configurazione Google API Key

---

## ✅ Cosa Funziona

- ✅ Dockerfile pronto per Railway
- ✅ FastAPI server con health check
- ✅ Database connection tramite SQLAlchemy
- ✅ Struttura agents e tools completa
- ✅ Dependencies aggiornate (datapizza-ai 0.0.9+)

## ⚠️ Cosa Richiede Configurazione

### 1. Google API Key (Obbligatorio)

Gli AI agents richiedono una Google API Key valida:

```bash
# Su Railway
GOOGLE_API_KEY=your_key_here

# Locale
echo "GOOGLE_API_KEY=your_key_here" > ai_tools/.env
```

**Ottieni la chiave**: https://aistudio.google.com/app/apikey

### 2. Database Connection

Il servizio si connette automaticamente al database PostgreSQL:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

Su Railway questo è auto-configurato con `${{crm-database.DATABASE_URL}}`.

---

## 🤖 Agents Disponibili

### 1. RAG Assistant (`/chat`)
- Assistente conversazionale con accesso al database
- Risponde a domande su immobili, clienti, richieste
- Usa RAG (Retrieval Augmented Generation)

### 2. Matching Agent (`/matching`)
- Genera match tra immobili e richieste clienti
- Scoring intelligente basato su criteri
- Restituisce top matches con reasoning

### 3. Briefing Agent (`/briefing`)
- Genera daily briefing per l'agente immobiliare
- Riassume attività, scadenze, opportunità
- Suggerisce azioni prioritarie

---

## 🚀 Deployment

### Railway

```yaml
Service: crm-ai-tools
Dockerfile: ai_tools/Dockerfile
Port: 8000
Health Check: /health

Environment:
  DATABASE_URL: ${{crm-database.DATABASE_URL}}
  GOOGLE_API_KEY: <your-key>
  PORT: 8000
```

### Docker Locale

```bash
docker build -f ai_tools/Dockerfile -t crm-ai-tools .
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e GOOGLE_API_KEY="your-key" \
  crm-ai-tools
```

### Sviluppo Locale

```bash
cd ai_tools
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

pip install -r requirements.txt

# Crea .env file
echo "DATABASE_URL=postgresql://crm_user:crm_password@localhost:5432/crm_immobiliare" > .env
echo "GOOGLE_API_KEY=your_key_here" >> .env

# Run
python main.py
```

---

## 📡 API Endpoints

### Health Check
```
GET /health
Response: {"status": "healthy"}
```

### Chat (RAG Assistant)
```
POST /chat
Body: {"message": "Mostrami le case disponibili a Milano"}
Response: {"response": "...", "sources": [...]}
```

### Generate Matches
```
POST /matching
Body: {"request_id": "req_123"}
Response: {"matches": [...]}
```

### Daily Briefing
```
GET /briefing
Response: {"briefing": "...", "actions": [...]}
```

---

## 🔧 Troubleshooting

### "GOOGLE_API_KEY not configured"

**Soluzione**: Configura la variabile d'ambiente `GOOGLE_API_KEY`

### "Connection to database failed"

**Soluzione**:
1. Verifica che PostgreSQL sia running
2. Controlla `DATABASE_URL` format
3. Su Railway, usa `${{crm-database.DATABASE_URL}}`

### "datapizza-ai import error"

**Soluzione**:
```bash
pip install --upgrade datapizza-ai datapizza-ai-clients-google
```

---

## 📚 Documentazione

- **DataPizza AI**: https://datapizza.tech
- **Google AI**: https://ai.google.dev
- **FastAPI**: https://fastapi.tiangolo.com

---

## 🎯 Prossimi Step

Per rendere gli AI agents completamente funzionali:

1. ✅ Configura Google API Key nella UI (Settings)
2. ⚠️ Testa gli endpoints via Postman o frontend
3. ⚠️ Implementa vector store (Qdrant) per RAG avanzato
4. ⚠️ Aggiungi caching per ridurre chiamate API
5. ⚠️ Implementa rate limiting

---

**Status**: Pronto per deployment, richiede solo Google API Key
**Versione**: 1.0.0
**Ultimo aggiornamento**: 2025-11-06
