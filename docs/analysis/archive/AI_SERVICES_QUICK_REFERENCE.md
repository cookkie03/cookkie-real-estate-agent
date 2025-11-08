# AI Services Quick Reference Card

## Current Configuration

### ✅ ACTIVE SERVICE: Google Gemini (Google AI Studio)

| Property | Value |
|----------|-------|
| **Service Name** | Google Gemini |
| **Provider** | Google AI Studio |
| **API Key Env Var** | `GOOGLE_API_KEY` |
| **Model** | `gemini-1.5-pro` |
| **Status** | PRIMARY (Required) |
| **Agents Using It** | RAG, Matching, Briefing |
| **Retry Logic** | ✅ Exponential backoff (3 retries) |
| **Documentation** | ✅ Complete |

### ❌ INACTIVE SERVICE: OpenRouter

| Property | Value |
|----------|-------|
| **Service Name** | OpenRouter |
| **Status** | NOT IMPLEMENTED |
| **In Docker Compose?** | ⚠️ YES (but unused) |
| **In .env templates?** | ✅ NO (correct) |
| **Code Implementation** | ❌ NO |
| **Planned** | YES (future feature) |

---

## Setup Checklist

### For Google Gemini (Required)

```bash
# 1. Get API Key
Visit: https://aistudio.google.com/app/apikey

# 2. Add to environment
export GOOGLE_API_KEY="your-api-key-here"

# 3. Verify configuration
grep GOOGLE_API_KEY .env*
grep GOOGLE_API_KEY ai_tools/.env

# 4. Start services
docker-compose up -d
# OR
npm run dev:all
```

### For OpenRouter

**NOT NEEDED** - Do not set OPENROUTER_API_KEY

---

## File Locations

### Configuration Files

| File | Contains | Status |
|------|----------|--------|
| `.env.example` | Google API key (required) | ✅ |
| `ai_tools/.env.example` | Google API key (required) | ✅ |
| `config/.env.global.example` | Google API key (required) | ✅ |
| `docker-compose.yml` | Google + OpenRouter (⚠️ remove OpenRouter) | ⚠️ |

### Code Files Using Google API

| File | Purpose | Status |
|------|---------|--------|
| `ai_tools/app/agents/rag_assistant.py` | Chat assistant | ✅ Active |
| `ai_tools/app/agents/matching_agent.py` | Property matching | ✅ Active |
| `ai_tools/app/agents/briefing_agent.py` | Daily briefing | ✅ Active |
| `ai_tools/app/agents/rag_assistant_new.py` | Alternative implementation | ✅ Available |
| `scraping/ai/semantic_extractor.py` | Web scraping AI | ✅ Configured |

---

## Issues Found

### ⚠️ ISSUE 1: Unused OPENROUTER_API_KEY in Docker Compose
**File**: `docker-compose.yml` (lines 68, 111)
**Fix**: Remove these lines from app and ai-tools services
```yaml
# DELETE:
OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:-}
```

### ⚠️ ISSUE 2: Misleading Documentation
**Files**: `GEMINI.md`, `DOCKER_DEPLOYMENT.md`
**Fix**: Clarify OpenRouter is "future feature, not yet implemented"

---

## Environment Variables

### Required for AI Features

```bash
# Google Gemini (REQUIRED)
GOOGLE_API_KEY=your_actual_api_key_here
GOOGLE_MODEL=gemini-1.5-pro              # Optional, has default
```

### DO NOT SET

```bash
# OpenRouter is NOT used - do not set
# OPENROUTER_API_KEY=xxx

# These are unnecessary and cause confusion
```

### Optional

```bash
# Only if you want to test alternative implementations
EMBEDDING_MODEL=models/text-embedding-004
```

---

## Verification Commands

### Check Google API Key Configuration

```bash
# Check if variable is set
echo $GOOGLE_API_KEY

# Check in .env files
grep GOOGLE_API_KEY .env*
grep GOOGLE_API_KEY ai_tools/.env

# Check in config templates
grep GOOGLE_API_KEY config/*.example
```

### Verify No OpenRouter Usage

```bash
# Should find NO results
grep -r "OPENROUTER\|openrouter" ai_tools/ scraping/ frontend/ \
  --include="*.py" --include="*.ts" --include="*.js"

# Check docker-compose (should only find 2 unused instances)
grep -n "OPENROUTER" docker-compose.yml
```

### Test AI Services

```bash
# Check if services are running
curl http://localhost:8000/health     # AI service
curl http://localhost:3000/api/health # App service

# Check AI status
curl http://localhost:8000/ai/status
```

---

## Troubleshooting

### Google API Key Not Working

```bash
# 1. Verify key is set
echo "Key length: ${#GOOGLE_API_KEY}"

# 2. Test with curl
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}'

# 3. Check API is enabled in Google Cloud Console
# https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
```

### Services Not Starting

```bash
# 1. Check logs
docker-compose logs -f ai-tools
docker-compose logs -f app

# 2. Verify environment variables
docker-compose config | grep GOOGLE

# 3. Restart services
docker-compose down
docker-compose up -d
```

---

## Future Roadmap

### Planned Features
- [ ] OpenRouter integration (FUTURE)
- [ ] Multiple model selection
- [ ] Model switching based on use case
- [ ] Cost optimization logic

### Current Limitations
- Only Google Gemini supported
- No automatic fallback service
- No multi-provider support yet

---

## Quick Links

- **Get Google API Key**: https://aistudio.google.com/app/apikey
- **Gemini Pricing**: https://ai.google.dev/pricing
- **DataPizza AI Docs**: https://datapizza.ai/docs
- **Google Generative AI Docs**: https://ai.google.dev/docs

---

## Summary

| Aspect | Status |
|--------|--------|
| **Primary AI Service** | ✅ Google Gemini |
| **Configuration** | 🟡 Mostly correct (1 issue: remove unused OpenRouter) |
| **Code Implementation** | ✅ All agents working |
| **Documentation** | 🟡 Mostly clear (1 issue: clarify OpenRouter status) |
| **Production Ready** | ✅ Yes (after removing OpenRouter config) |

---

**Last Updated**: 2025-11-08  
**Next Review**: After implementing fixes
