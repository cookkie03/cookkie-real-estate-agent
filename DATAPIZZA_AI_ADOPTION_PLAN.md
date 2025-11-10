# 🍕 PIANO ADOZIONE DATAPIZZA AI + MODEL SELECTOR

## STATO ATTUALE ✅

La codebase **già usa DataPizza AI correttamente**:
- ✅ `datapizza.agents.Agent` per tutti gli agent
- ✅ `datapizza.clients.google.GoogleClient` per Google Gemini
- ✅ `datapizza.tools.tool` decorator per tool functions
- ✅ DataPizza AI v0.0.9 in requirements

**File che usano DataPizza AI:**
1. `ai_tools/app/agents/crm_chatbot.py` - CRM Assistant
2. `ai_tools/app/agents/rag_assistant.py` - RAG Assistant
3. `ai_tools/app/tools/db_query_tool.py` - Database tools
4. `ai_tools/app/tools/property_search_tool.py` - Search tools
5. `ai_tools/app/tools/contact_search_tool.py` - Contact tools

## PROBLEMI DA RISOLVERE ⚠️

### 1. API Key Hardcoded
**Problema**: Alcuni file usano `os.getenv("GOOGLE_API_KEY")` invece del sistema dinamico

**Soluzione**: Aggiornare a `get_google_api_key()` da `config_dynamic.py`

### 2. Modello Hardcoded
**Problema**: Modello hardcoded in codice o config statico

**Soluzione**: Modello configurabile da database + GUI selector

### 3. No Model Versioning
**Problema**: Non c'è gestione versioni modelli (flash, flash-exp, pro, ecc.)

**Soluzione**: Selector con preset modelli Google Gemini

---

## IMPLEMENTAZIONE 🚀

### STEP 1: Aggiornare Config System
- [x] `config_dynamic.py` - Già fatto per API key
- [ ] Estendere per supportare `model_name`
- [ ] Priorità: DB > ENV > Default

### STEP 2: GUI Model Selector
- [ ] Component `ModelSelector.tsx` in Settings
- [ ] Preset modelli:
  * `gemini-2.0-flash-exp` (Default) - Latest experimental
  * `gemini-2.0-flash-thinking-exp-1219` - With reasoning
  * `gemini-1.5-flash-latest` - Stable
  * `gemini-1.5-pro-latest` - Pro version
  * Custom input

### STEP 3: Database Schema
- [ ] Aggiungere a `UserProfile.settings`:
  * `googleAiModel: string` (default: "gemini-2.0-flash-exp")

### STEP 4: API Endpoints
- [ ] Estendere `/api/settings/api-key` per includere model
- [ ] Endpoint `/api/settings/ai-model`

### STEP 5: Update Agent Files
- [ ] `crm_chatbot.py` - Usare dynamic model
- [ ] `rag_assistant.py` - Usare dynamic model
- [ ] `orchestrator.py` - Usare dynamic config

---

## BEST PRACTICES DATAPIZZA AI 📚

### ✅ Già Implementate
1. **Agent Creation**: Uso corretto di `Agent(name, client, tools)`
2. **Tool Decorator**: `@tool` per auto-documentation
3. **Google Client**: `GoogleClient` per Gemini API
4. **System Prompts**: Prompt dettagliati per ogni agent

### 🔄 Da Migliorare
1. **Observability**: Abilitare OpenTelemetry tracing
2. **Error Handling**: Aggiungere retry logic con DataPizza
3. **Multi-Agent**: Usare `agent.can_call()` per hierarchical tasks

---

## TIMELINE ⏱️

- ✅ **Fase 1**: Config dinamico API key (COMPLETATO)
- 🔄 **Fase 2**: Model selector GUI (IN CORSO)
- ⏳ **Fase 3**: Update agent files
- ⏳ **Fase 4**: Testing completo

---

## NOTE TECNICHE 🔧

**DataPizza AI Architecture:**
```python
# Pattern attuale (corretto)
from datapizza.agents import Agent
from datapizza.clients.google import GoogleClient

client = GoogleClient(api_key=api_key, model=model_name)
agent = Agent(name="assistant", client=client, tools=tools)
response = agent.run(prompt)
```

**Vantaggi DataPizza AI vs LangChain:**
- ✅ Meno astrazione, più controllo
- ✅ Vendor-agnostic (facile switch provider)
- ✅ Built-in OpenTelemetry tracing
- ✅ API-first design
- ✅ Production-ready

**Modelli Google Gemini Supportati:**
- `gemini-2.0-flash-exp` - Latest experimental (VELOCE, tool calling ottimo)
- `gemini-2.0-flash-thinking-exp` - Con reasoning interno
- `gemini-1.5-flash` - Stable, production-ready
- `gemini-1.5-pro` - Migliori capacità, più lento/costoso
- `gemini-1.5-flash-8b` - Ultra veloce, economico

---

## CONCLUSIONE ✨

La codebase è **già ben strutturata con DataPizza AI**.

Gli aggiornamenti proposti miglioreranno:
1. Flessibilità (model selector)
2. UX (configurazione GUI)
3. Consistenza (dynamic config ovunque)
