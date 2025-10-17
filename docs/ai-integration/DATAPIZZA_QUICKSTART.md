# DataPizza AI - Quick Start Guide 🚀

Guida rapida per avviare il sistema AI in 5 minuti.

## ⚡ Setup Rapido

### 1. Setup Backend Python (2 minuti)

```bash
# Vai nella directory python_ai
cd python_ai

# Crea virtual environment
python -m venv .venv

# Attiva environment (Windows)
.venv\Scripts\activate
# Oppure (Linux/Mac)
source .venv/bin/activate

# Installa dipendenze
pip install -r requirements.txt

# Configura environment
cp .env.example .env
```

**Modifica `python_ai/.env`** e aggiungi la tua **Google API Key**:
```bash
GOOGLE_API_KEY=your_api_key_from_google_ai_studio
```

> 🔑 Ottieni la chiave su: https://aistudio.google.com/app/apikey

### 2. Setup Frontend Next.js (1 minuto)

Modifica `.env.local` nella root e aggiungi:
```bash
PYTHON_AI_URL=http://localhost:8000
GOOGLE_API_KEY=your_api_key_from_google_ai_studio
```

### 3. Avvio Sistema (1 minuto)

**Terminale 1 - Python Backend:**
```bash
cd python_ai
.venv\Scripts\activate  # o source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminale 2 - Next.js Frontend:**
```bash
npm run dev
```

### 4. Verifica Installazione (30 secondi)

```bash
# Test Backend Python
curl http://localhost:8000/health

# Test Next.js
curl http://localhost:3000/api/ai/chat
```

✅ Se entrambi rispondono senza errori, sei pronto!

---

## 🎯 Primi Test

### Test 1: Chat Intelligente

Apri il browser: `http://localhost:3000`

Vai nella sezione **Ricerca** o **Chat** e prova:
- "Mostrami tutti gli appartamenti disponibili a Corbetta"
- "Chi sono i clienti VIP?"
- "Trova immobili con giardino sotto 300k"

### Test 2: Daily Briefing

```bash
curl http://localhost:8000/ai/briefing/daily
```

Riceverai un briefing dettagliato con:
- Attività del giorno
- Priorità
- Opportunità da cogliere
- Alert e scadenze

### Test 3: AI Matching

```bash
curl -X POST http://localhost:8000/ai/matching/enhance \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "richiesta_esistente",
    "property_id": "immobile_esistente",
    "algorithmic_score": 80
  }'
```

---

## 🔧 Comandi Utili

### Backend Python

```bash
# Avvia server development
cd python_ai
uvicorn main:app --reload --port 8000

# Avvia server production
uvicorn main:app --host 0.0.0.0 --port 8000

# Visualizza API docs
# Apri: http://localhost:8000/docs

# Test health
curl http://localhost:8000/health
```

### Frontend Next.js

```bash
# Development
npm run dev

# Build production
npm run build
npm start
```

---

## 📊 Dashboard API (Swagger)

Apri nel browser: **http://localhost:8000/docs**

Troverai l'interfaccia interattiva con tutti gli endpoint:
- `POST /ai/chat/` - RAG Assistant
- `POST /ai/matching/enhance` - AI Matching
- `GET /ai/briefing/daily` - Daily Briefing

Puoi testare tutti gli endpoint direttamente dal browser!

---

## 🐛 Problemi Comuni

### ❌ "Module datapizza not found"

```bash
cd python_ai
pip install -r requirements.txt
```

### ❌ "Backend AI non raggiungibile"

Verifica che il server Python sia attivo:
```bash
curl http://localhost:8000/health
```

### ❌ "Google API Key invalid"

1. Verifica che la chiave sia corretta in `python_ai/.env`
2. Testa la chiave su https://aistudio.google.com
3. Riavvia il server Python

### ❌ Port già in uso

```bash
# Trova e uccidi processo sulla porta 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

---

## 📚 Prossimi Passi

1. ✅ Leggi la **documentazione completa**: `DATAPIZZA_SETUP.md`
2. ✅ Esplora gli **agenti AI** in `python_ai/app/agents/`
3. ✅ Personalizza i **system prompts** per il tuo caso d'uso
4. ✅ Aggiungi **custom tools** per funzionalità specifiche
5. ✅ Integra **Qdrant** per ricerca semantica avanzata

---

## 💡 Tips

- **Sviluppo**: Usa `--reload` per hot-reload del backend Python
- **Logs**: Aumenta log level con `LOG_LEVEL=DEBUG` in `.env`
- **Performance**: Abbassa `AI_TEMPERATURE` per risposte più deterministiche
- **Cache**: I risultati sono cachati automaticamente in `python_ai/.cache/`

---

## 🆘 Supporto

Problemi? Controlla:
1. Logs Python: Visibili nel terminale dove hai avviato `uvicorn`
2. Logs Next.js: Nel terminale `npm run dev`
3. API Docs: http://localhost:8000/docs
4. Documentazione completa: `DATAPIZZA_SETUP.md`

---

## ✨ Feature Highlights

### RAG Assistant
- 🤖 Chat in linguaggio naturale
- 🔍 Accesso completo al database CRM
- 📊 Statistiche e insights automatici
- 🎯 7 custom tools specializzati

### AI Matching
- 🧠 Analisi semantica delle preferenze
- 💬 Motivi match in linguaggio naturale
- 💡 Suggerimenti per presentazione immobili
- ⚡ Integrazione con algoritmo esistente

### Daily Briefing
- 📅 Panoramica giornata automatica
- 🎯 Priorità e opportunità
- ⚠️ Alert e scadenze
- 📈 Metriche performance

---

**Buon lavoro con DataPizza AI! 🍕🤖**
