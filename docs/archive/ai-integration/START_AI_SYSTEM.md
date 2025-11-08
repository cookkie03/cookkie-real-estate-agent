# 🚀 Avvio Sistema AI - Guida Rapida

## ✅ Setup Completato!

La Google API Key è già configurata in:
- ✅ `.env.local` (Next.js)
- ✅ `python_ai/.env` (Python Backend)

Il sistema RAG è collegato alla search bar della homepage!

---

## 🎬 Avvia il Sistema (2 Comandi)

### Terminal 1 - Backend Python (DataPizza AI)

```bash
cd python_ai

# Windows
.venv\Scripts\activate

# Linux/Mac
# source .venv/bin/activate

# Se non hai ancora installato le dipendenze:
pip install -r requirements.txt

# Avvia il server
uvicorn main:app --reload --port 8000
```

**Output atteso:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     🚀 Starting CRM Immobiliare AI Backend...
INFO:     ✅ Database initialized
```

### Terminal 2 - Frontend Next.js

```bash
# Dalla root del progetto
npm run dev
```

**Output atteso:**
```
▲ Next.js 14.2.18
- Local:        http://localhost:3000
```

---

## 🧪 Test Funzionamento

### 1. Verifica Backend Python

Apri nel browser: **http://localhost:8000/docs**

Vedrai l'interfaccia Swagger con tutti gli endpoint AI disponibili.

Test veloce con curl:
```bash
curl http://localhost:8000/health
```

**Risposta:**
```json
{
  "status": "healthy",
  "timestamp": 1729123456.789,
  "database": "connected",
  "qdrant_mode": "memory"
}
```

### 2. Verifica Frontend

Apri: **http://localhost:3000**

### 3. Test Sistema RAG dalla Search Bar

1. Clicca sulla **barra di ricerca** nella homepage
2. Verrai reindirizzato a `/search`
3. Prova queste query:

**Query di Test:**
- "Mostrami tutti gli appartamenti disponibili a Corbetta"
- "Chi sono i clienti VIP che cercano casa?"
- "Trova immobili con giardino e parcheggio sotto 300k"
- "Quanti immobili abbiamo in vendita?"
- "Dammi statistiche sugli immobili in affitto"

**Cosa succede:**
1. La query viene inviata a `/api/ai/chat` (Next.js)
2. Next.js la inoltra a `http://localhost:8000/ai/chat/` (Python)
3. Il RAG Assistant Agent con 7 custom tools interroga il database
4. Ricevi una risposta intelligente con dati reali dal CRM!

---

## 🎯 Funzionalità Disponibili

### RAG Assistant (Chat Intelligente)

**Endpoint:** `/api/ai/chat`

**Cosa può fare:**
- ✅ Cercare immobili con filtri complessi
- ✅ Trovare clienti e le loro richieste
- ✅ Analizzare match property-request
- ✅ Generare statistiche e insights
- ✅ Rispondere a domande sul database in linguaggio naturale

**Tools disponibili per l'AI:**
1. `query_properties_tool` - Filtra immobili (città, prezzo, tipo, stanze...)
2. `property_search_tool` - Ricerca semantica immobili
3. `query_contacts_tool` - Filtra contatti/clienti
4. `contact_search_tool` - Ricerca semantica contatti
5. `get_contact_details_tool` - Dettagli completi contatto
6. `query_requests_tool` - Cerca richieste clienti
7. `query_matches_tool` - Trova match esistenti

### AI Matching (Futuro)

**Endpoint:** `/api/ai/matching`

Migliora i match con analisi semantica.

### Daily Briefing (Futuro)

**Endpoint:** `/api/ai/briefing`

Genera briefing giornaliero automatico.

---

## 🔧 Comandi Utili

### Backend Python

```bash
# Visualizza API docs interattive
# Apri: http://localhost:8000/docs

# Status AI agents
curl http://localhost:8000/ai/status

# Test chat diretto
curl -X POST http://localhost:8000/ai/chat/ \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Quanti immobili abbiamo?"}]}'
```

### Logs

**Python Backend:**
I logs sono visibili nel terminal dove hai avviato `uvicorn`. Vedrai:
- Richieste HTTP
- Query database
- Tool calls dell'AI
- Risposte generate

**Next.js:**
I logs sono nel terminal `npm run dev`.

---

## 🐛 Troubleshooting

### ❌ "Backend AI non raggiungibile"

**Causa:** Server Python non attivo o porta sbagliata.

**Soluzione:**
```bash
# Verifica che Python sia attivo
curl http://localhost:8000/health

# Se non risponde, avvia il server Python
cd python_ai
uvicorn main:app --reload --port 8000
```

### ❌ "Module datapizza not found"

**Causa:** Dipendenze Python non installate.

**Soluzione:**
```bash
cd python_ai
.venv\Scripts\activate
pip install -r requirements.txt
```

### ❌ "Google API Key invalid"

**Causa:** API Key errata o scaduta.

**Soluzione:**
1. Verifica la chiave in `python_ai/.env`
2. Testa su https://aistudio.google.com
3. Se necessario, genera una nuova chiave

### ❌ Port 8000 già in uso

**Windows:**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:8000 | xargs kill -9
```

---

## 🎨 Personalizzazione

### Modifica i System Prompts

I system prompts degli agenti AI si trovano in:
- `python_ai/app/agents/rag_assistant.py` (riga ~30)
- `python_ai/app/agents/matching_agent.py` (riga ~20)
- `python_ai/app/agents/briefing_agent.py` (riga ~20)

Puoi modificarli per adattare il comportamento dell'AI al tuo caso d'uso!

### Aggiungi Custom Tools

Crea nuovi tools in `python_ai/app/tools/` seguendo il pattern:

```python
from datapizza.tools import tool

@tool
def my_custom_tool(param: str) -> str:
    """Descrizione del tool per l'AI"""
    # La tua logica
    return result
```

Poi aggiungili all'agente in `python_ai/app/agents/rag_assistant.py`.

---

## 📚 Documentazione Completa

- **Setup Dettagliato:** `DATAPIZZA_SETUP.md`
- **Architettura:** `DATAPIZZA_INTEGRATION_SUMMARY.md`
- **Quick Start:** `DATAPIZZA_QUICKSTART.md`

---

## ✨ Riepilogo

**Cosa hai ora:**
- 🤖 Sistema RAG completo collegato alla search bar
- 📊 7 custom tools per interrogare il database
- 🧠 Google Gemini come LLM
- 🔍 Ricerca semantica in linguaggio naturale
- 🎯 Risposte basate su dati reali del CRM

**Come usarlo:**
1. Avvia Backend Python → `uvicorn main:app --reload --port 8000`
2. Avvia Frontend Next.js → `npm run dev`
3. Vai su http://localhost:3000
4. Clicca sulla search bar
5. Chiedi qualsiasi cosa: "Mostrami appartamenti a Corbetta sotto 200k"

**Il sistema AI + RAG farà il resto! 🚀**
