# AI Services Configuration Audit Report
**Date**: 2025-11-08  
**Project**: CRM Immobiliare (Real Estate Agent CRM)  
**Status**: ⚠️ CONFIGURATION ISSUE DETECTED

---

## Executive Summary

The CRM Immobiliare project has a **PRIMARY AI SERVICE** (Google Gemini) correctly implemented across all agents and code, but the **Docker Compose configuration** incorrectly includes an unused `OPENROUTER_API_KEY` variable that conflicts with the documented setup.

### Key Findings
- ✅ **Google AI Studio (Gemini)**: PRIMARY, fully implemented, all agents using it
- ⚠️ **OpenRouter**: Defined in Docker Compose but NOT USED anywhere
- ✅ **Environment Files**: Correctly specify only Google API key
- ⚠️ **Documentation**: Minor inconsistencies in deployment docs
- ✅ **Code**: All AI agents properly configured with Google API

**Risk Level**: MEDIUM - Configuration will still work, but misleading for operators

---

## 1. Google AI Studio API Key Usage

### Status: ✅ PRIMARY SERVICE (Correct Implementation)

#### 1.1 Configuration Files Defining Google API Key

| File | Status | Details |
|------|--------|---------|
| `.env.example` (Root) | ✅ Required | `GOOGLE_API_KEY=` (line 52) - Only AI service mentioned |
| `ai_tools/.env.example` | ✅ Required | `GOOGLE_API_KEY=your_google_ai_api_key_here` (line 23) |
| `config/.env.global.example` | ✅ Required | `GOOGLE_API_KEY="your_google_api_key_here"` (line 23) |
| `frontend/.env.local` | ✅ Optional | `NEXT_PUBLIC_GOOGLE_API_KEY=""` (optional for direct access) |

#### 1.2 Environment Variable Validation

**Configuration in `ai_tools/app/config.py`**:
```python
google_api_key: str = Field(
    ...,
    alias="GOOGLE_API_KEY",
    description="Google AI Studio API Key"
)
```
- ✅ Marked as **required** (`...` = no default)
- ✅ Properly aliased from environment variable
- ✅ Used by all AI agents during initialization

#### 1.3 Actual Usage in Code

**Files using GOOGLE_API_KEY**:

1. **RAG Assistant Agent** (`ai_tools/app/agents/rag_assistant.py`):
   ```python
   client = GoogleClient(
       api_key=settings.google_api_key,  # Line 74
       model=settings.google_model,
       temperature=settings.ai_temperature,
   )
   ```

2. **Matching Agent** (`ai_tools/app/agents/matching_agent.py`):
   ```python
   client = GoogleClient(
       api_key=settings.google_api_key,  # Line 121
       model=settings.google_model,
   )
   ```

3. **Briefing Agent** (`ai_tools/app/agents/briefing_agent.py`):
   ```python
   client = GoogleClient(
       api_key=settings.google_api_key,  # Line 201
       model=settings.google_model,
   )
   ```

4. **RAG Assistant (New - Direct Implementation)** (`ai_tools/app/agents/rag_assistant_new.py`):
   ```python
   genai.configure(api_key=settings.google_api_key)  # Line 184
   self.model = genai.GenerativeModel(
       model_name=settings.google_model,
       ...
   )
   ```

5. **Scraping Semantic Extractor** (`scraping/ai/semantic_extractor.py`):
   ```python
   self.api_key = api_key or os.getenv("GOOGLE_API_KEY")  # Line 33
   ```

6. **Settings API Route** (`frontend/src/app/api/settings/route.ts`):
   ```typescript
   googleApiKey: process.env.GOOGLE_API_KEY ? '***' + process.env.GOOGLE_API_KEY?.slice(-4) : null
   ```

#### 1.4 Model Configuration

**Default Model**: `gemini-1.5-pro`

Configured in:
- `ai_tools/.env.example`: `GOOGLE_MODEL=gemini-1.5-pro`
- `config/.env.global.example`: `GOOGLE_MODEL="gemini-1.5-pro"`
- `ai_tools/app/config.py`: Default = `"gemini-1.5-pro"`

#### 1.5 AI Agents Implementation

| Agent | File | Status | Client Type | Retry Logic |
|-------|------|--------|-------------|-------------|
| RAG Assistant | `rag_assistant.py` | ✅ Active | GoogleClient (DataPizza) | ✅ Yes |
| Matching Agent | `matching_agent.py` | ✅ Active | GoogleClient (DataPizza) | ✅ Yes |
| Briefing Agent | `briefing_agent.py` | ✅ Active | GoogleClient (DataPizza) | ✅ Yes |
| RAG Assistant (New) | `rag_assistant_new.py` | ✅ Available | google.generativeai | N/A |

**Note**: Agents in main.py are currently disabled but configured correctly:
```python
# from app.routers import chat  # Temporarily disabled
# from app.routers import matching, briefing  # Temporarily disabled
```

#### 1.6 Retry & Fallback Logic

**File**: `ai_tools/app/utils.py`

Implemented with exponential backoff for Google AI:
```python
def retry_with_exponential_backoff(
    max_retries: int = None,
    base_delay: int = None,
)
```

**Retry Configuration** (from `.env`):
- `AI_MAX_RETRIES=3` (default)
- `AI_RETRY_DELAY=2` (base delay in seconds)
- Exponential backoff: `delay = base_delay * (2 ** attempt)`

**Status**: ✅ Retry logic exists but **only for Google AI** - no fallback to another service

---

## 2. OpenRouter Integration

### Status: ⚠️ MISCONFIGURED (Unused but present)

#### 2.1 OpenRouter in Docker Compose

**Location**: `docker-compose.yml` (lines 68, 111)

```yaml
# APP Service (line 68)
OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:-}

# AI-TOOLS Service (line 111)
OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:-}
```

**Problem**: Defined but not used anywhere in the code!

#### 2.2 OpenRouter in Code

**Search Results**:
- ❌ No references in Python code (`ai_tools/`, `scraping/`)
- ❌ No references in TypeScript code (`frontend/src/`)
- ❌ Not imported or used in any agent
- ❌ Not configured in any .env file template

#### 2.3 OpenRouter in Documentation

**GEMINI.md** (line 59):
```typescript
"llm": "OpenRouter API",             // External API calls only
```
**Note**: Listed as "Future Integrations (Not Yet Implemented)"

**DOCKER_DEPLOYMENT.md** (mentions it):
```
OPENROUTER_API_KEY=tua_chiave_openrouter
```
But provides no actual implementation guidance.

#### 2.4 OpenRouter Verdict

| Aspect | Status |
|--------|--------|
| **Code Usage** | ❌ NONE |
| **Active Implementation** | ❌ NO |
| **Fallback Logic** | ❌ DOES NOT EXIST |
| **Configuration Files** | ⚠️ Only in docker-compose.yml |
| **Environment Templates** | ✅ Not listed (correct) |
| **Documentation** | ⚠️ Listed as "future feature" |

---

## 3. Environment Configuration Analysis

### 3.1 Root Level Configuration

**File**: `.env.example`
```
GOOGLE_API_KEY=                    # Line 52 - REQUIRED
# No OPENROUTER_API_KEY            # Correct - not needed
```

**Status**: ✅ CORRECT

### 3.2 AI Tools Configuration

**File**: `ai_tools/.env.example`
```
GOOGLE_API_KEY=your_google_ai_api_key_here          # Line 23 - REQUIRED
GOOGLE_MODEL=gemini-1.5-pro                          # Line 26
# No OPENROUTER_API_KEY                              # Correct
```

**Status**: ✅ CORRECT

### 3.3 Global Configuration Template

**File**: `config/.env.global.example`
```
GOOGLE_API_KEY="your_google_api_key_here"           # Line 23 - REQUIRED
GOOGLE_MODEL="gemini-1.5-pro"                        # Line 24
# No OPENROUTER_API_KEY                              # Correct
```

**Status**: ✅ CORRECT

### 3.4 Frontend Configuration

**File**: `frontend/.env.local` (implied from config/README.md)
```
NEXT_PUBLIC_GOOGLE_API_KEY=""      # Optional for direct API access
# No OPENROUTER_API_KEY
```

**Status**: ✅ CORRECT

### 3.5 Docker Compose Environment

**File**: `docker-compose.yml`

APP Service (lines 66-68):
```yaml
# API Keys
GOOGLE_API_KEY: ${GOOGLE_API_KEY:-}
OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:-}  # ⚠️ UNUSED
```

AI-Tools Service (lines 109-111):
```yaml
# API Keys
GOOGLE_API_KEY: ${GOOGLE_API_KEY:-}
OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:-}  # ⚠️ UNUSED
```

**Status**: ⚠️ INCORRECT - OPENROUTER_API_KEY should be removed

---

## 4. Code Implementation Details

### 4.1 DataPizza AI Framework

**Purpose**: Unified AI agent framework using various backends

**Imports**:
```python
from datapizza.agents import Agent
from datapizza.clients.google import GoogleClient
```

**Current Version**: `datapizza-ai>=0.0.9`, `datapizza-ai-clients-google>=0.0.2`

**Status**: ✅ Correctly configured for Google only

### 4.2 Google Generative AI Library

**Purpose**: Direct access to Gemini API (fallback or alternative implementation)

**Imports**:
```python
import google.generativeai as genai
```

**Current Version**: `google-generativeai>=0.8.3`

**Usage**:
- Used in `rag_assistant_new.py` for direct implementation
- Used in `scraping/ai/semantic_extractor.py` as fallback option

**Status**: ✅ Correctly configured

### 4.3 No Multi-Service Selection Logic

**Verified**: No conditional logic checking for OpenRouter availability
```python
# ✅ All agents simply use:
client = GoogleClient(api_key=settings.google_api_key, ...)

# ❌ No code like:
# if OPENROUTER_API_KEY:
#     use_openrouter()
# else:
#     use_google()
```

---

## 5. Dependencies Analysis

### 5.1 AI-Related Dependencies

**From `ai_tools/requirements.txt`**:

```
# AI Framework - Google Focused
datapizza-ai>=0.0.9                    # Primary framework
datapizza-ai-clients-google>=0.0.2     # Google integration
google-generativeai>=0.8.3             # Fallback/direct access

# Vector Store
qdrant-client>=1.12.1                  # RAG support

# Framework & Validation
fastapi>=0.115.0
pydantic>=2.10.5
```

**Status**: ✅ All dependencies are Google-focused, no OpenRouter SDK

---

## 6. Documentation Alignment

### 6.1 CLAUDE.md

**AI Service Instructions** (lines 47-52 in root .env.example):
```
# ⚠️ API KEYS (OBBLIGATORIO PER FEATURES AI)
# ⚠️ Google AI (Gemini) - Richiesto per tutte le funzionalità AI
# Ottieni la chiave su: https://aistudio.google.com/app/apikey
# Usata per: RAG Assistant, Matching, Briefing, Ricerca Semantica
GOOGLE_API_KEY=
```

**Status**: ✅ CORRECT - Only Google mentioned

**Checklist** (line 118):
```
# [ ] GOOGLE_API_KEY aggiunto (unica API key necessaria!)
```

**Status**: ✅ CORRECT - "Unica API key" = only API key needed

### 6.2 GEMINI.md

**Section**: Future Integrations (line 59)
```typescript
"llm": "OpenRouter API",             // External API calls only
```

**Status**: ⚠️ MISLEADING - Listed as future but incorrectly present in docker-compose.yml

### 6.3 config/README.md

**Google AI Section** (lines 67-71):
```bash
### Google AI (Required)
GOOGLE_API_KEY="your_key_here"
```
Ottieni la chiave su: https://aistudio.google.com/app/apikey

**Status**: ✅ CORRECT - Only Google mentioned, no OpenRouter

### 6.4 ai_tools/README.md

**Setup Section** (line 44):
```
# Modifica .env con le tue API keys
# IMPORTANTE: Aggiungi la tua GOOGLE_API_KEY da https://aistudio.google.com/
```

**Status**: ✅ CORRECT - Only Google mentioned

---

## 7. Configuration Hierarchy Analysis

### 7.1 PRIMARY vs FALLBACK (Intended vs Actual)

**Intended Hierarchy**:
```
Primary Service:   Google Gemini (Google AI Studio API)
Fallback Service:  None (no fallback implemented)
Optional Service:  OpenRouter (future integration - NOT IMPLEMENTED)
```

**Current Implementation**:
```
Primary Service:   Google Gemini ✅
Fallback Service:  None ✅
Optional Service:  OpenRouter (INCORRECTLY defined in Docker Compose) ⚠️
```

### 7.2 Service Priority

| Service | Primary | Fallback | Optional | Status |
|---------|---------|----------|----------|--------|
| Google Gemini | ✅ YES | N/A | N/A | ✅ Correctly implemented |
| OpenRouter | ❌ NO | ❌ NO | ✅ YES | ⚠️ Wrongly in docker-compose |

---

## 8. Identified Issues

### Issue #1: ⚠️ MEDIUM PRIORITY
**Title**: `OPENROUTER_API_KEY` in Docker Compose is Unused  
**Location**: `docker-compose.yml` (lines 68, 111)  
**Impact**: Confusing for operators, suggests OpenRouter is configured when it's not  
**Fix Required**: Remove OPENROUTER_API_KEY from docker-compose.yml

### Issue #2: ⚠️ LOW PRIORITY
**Title**: Inconsistent Documentation References  
**Location**: `GEMINI.md` mentions OpenRouter, `DOCKER_DEPLOYMENT.md` references it  
**Impact**: May confuse new developers about available services  
**Fix Required**: Clarify that OpenRouter is "future feature, not yet implemented"

### Issue #3: ✅ NO ISSUE
**Title**: Code Implementation  
**Impact**: All agents correctly use Google API  
**Status**: CORRECT - No action needed

### Issue #4: ✅ NO ISSUE
**Title**: Environment Templates  
**Impact**: All .env templates correctly specify only Google API key  
**Status**: CORRECT - No action needed

---

## 9. Service Configuration Summary

### Google AI Studio (Primary Service)

**Configuration Status**: ✅ CORRECT

```
Environment Variables:
  ✅ GOOGLE_API_KEY       (Required)
  ✅ GOOGLE_MODEL         (Default: gemini-1.5-pro)

Implementation:
  ✅ RAG Assistant Agent   (rag_assistant.py)
  ✅ Matching Agent        (matching_agent.py)
  ✅ Briefing Agent        (briefing_agent.py)
  ✅ Scraping Extractor    (semantic_extractor.py)
  
Retry Logic:
  ✅ Exponential backoff   (3 retries, 2s base delay)

Documentation:
  ✅ CLAUDE.md             (Correctly documented)
  ✅ config/README.md      (Correctly documented)
  ✅ ai_tools/README.md    (Correctly documented)
```

### OpenRouter (Not Implemented)

**Configuration Status**: ⚠️ MISCONFIGURED

```
Environment Variables:
  ⚠️ OPENROUTER_API_KEY   (In docker-compose, not used)

Implementation:
  ❌ No agents use it
  ❌ No fallback logic
  ❌ No import statements
  ❌ No configuration in code

Documentation:
  ⚠️ GEMINI.md lists as "Future Integration"
  ⚠️ DOCKER_DEPLOYMENT.md mentions it
  ❌ No other docs reference it
```

---

## 10. Recommendations

### HIGH PRIORITY

**Action 1**: Remove OpenRouter from docker-compose.yml
```yaml
# REMOVE these lines from both app and ai-tools services:
# OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:-}
```

**Reason**: Prevents confusion and reduces unnecessary configuration

### MEDIUM PRIORITY

**Action 2**: Clarify in GEMINI.md
```markdown
Add note:
"OpenRouter is listed as a future integration in this file, 
but is NOT yet implemented. Currently, only Google Gemini (Gemini 1.5 Pro) 
is supported as the AI service."
```

**Action 3**: Update DOCKER_DEPLOYMENT.md
Remove or clarify references to OpenRouter as it's not functional

### LOW PRIORITY (Informational)

**Action 4**: Add AI Service Configuration documentation
Create a new file: `docs/AI_SERVICES_CONFIG.md` with:
- Current service: Google Gemini
- How to change models
- Future integration plans
- Fallback strategy

---

## 11. Verification Checklist

### Configuration Verification
- ✅ Google API key marked as REQUIRED in all config files
- ✅ All environment templates specify only Google API key
- ✅ All agents initialized with GoogleClient
- ✅ Retry logic exists for Google API failures
- ⚠️ OpenRouter incorrectly present in docker-compose.yml

### Code Verification
- ✅ RAG Assistant uses GoogleClient (rag_assistant.py)
- ✅ Matching Agent uses GoogleClient (matching_agent.py)
- ✅ Briefing Agent uses GoogleClient (briefing_agent.py)
- ✅ Scraping uses google.generativeai (semantic_extractor.py)
- ✅ No conditional logic for service selection
- ✅ No fallback to OpenRouter anywhere

### Documentation Verification
- ✅ CLAUDE.md correctly documents Google API only
- ✅ config/README.md correctly documents Google API only
- ✅ ai_tools/README.md correctly documents Google API only
- ⚠️ GEMINI.md mentions OpenRouter as future feature
- ⚠️ DOCKER_DEPLOYMENT.md references OpenRouter

---

## Conclusion

**Overall Status**: 🟡 MOSTLY CORRECT with minor configuration issue

The CRM Immobiliare project correctly implements **Google Gemini as the PRIMARY AI service** across all agents and code. However, the **Docker Compose configuration includes an unused `OPENROUTER_API_KEY`** variable that should be removed to avoid confusion.

**Recommendation**: Remove OPENROUTER_API_KEY from docker-compose.yml and update documentation to clarify that OpenRouter is a planned future integration, not currently available.

---

**Report Generated**: 2025-11-08  
**Auditor**: Claude Code Analysis  
**Next Review**: After implementing recommended fixes
