# 🚀 Quick Start - CRM Immobiliare AI

## ⚡ 1 Comando per Avviare Tutto

### Con Docker (RACCOMANDATO) 🐳

**Windows:**
```bash
docker-start.bat
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

**Oppure manualmente:**
```bash
docker-compose up
```

**✅ Fatto! Il sistema è pronto su:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### Senza Docker (Manuale)

**Windows:**
```bash
start-ai-system.bat
```

**Linux/Mac:**
```bash
chmod +x start-ai-system.sh
./start-ai-system.sh
```

---

## 🎯 Test Immediato

1. Apri: **http://localhost:3000**
2. Clicca sulla **search bar** (grande, al centro)
3. Scrivi: `Mostrami appartamenti a Corbetta sotto 200k`
4. Premi ENTER

**L'AI interrogherà il database e ti risponderà! 🤖**

---

## 📋 Prerequisiti

### Con Docker
- ✅ Docker Desktop installato
- ✅ Google API Key (già configurata)
- ✅ Nient'altro!

### Senza Docker
- ✅ Node.js 20+
- ✅ Python 3.11+
- ✅ Google API Key (già configurata)

---

## 🛠️ Comandi Principali

### Docker

```bash
# Avvia
docker-compose up

# Ferma
docker-compose down

# Logs
docker-compose logs -f

# Riavvia
docker-compose restart

# Rebuild
docker-compose build
```

### Manuale

```bash
# Terminal 1 - Python Backend
cd python_ai
.venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000

# Terminal 2 - Next.js Frontend
npm run dev
```

---

## 🔍 Verifica Funzionamento

```bash
# Backend Python
curl http://localhost:8000/health

# Frontend Next.js
curl http://localhost:3000/api/health

# Test AI Chat
curl -X POST http://localhost:8000/ai/chat/ \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Quanti immobili abbiamo?"}]}'
```

---

## 📚 Guide Dettagliate

- **Docker:** `DOCKER_GUIDE.md`
- **Setup Completo:** `DATAPIZZA_SETUP.md`
- **Sistema AI:** `AI_SYSTEM_READY.md`

---

## ❓ Problemi?

### Backend non risponde

```bash
# Verifica container
docker-compose ps

# Visualizza logs
docker-compose logs python-backend
```

### Frontend non carica

```bash
# Riavvia
docker-compose restart nextjs-frontend

# Visualizza logs
docker-compose logs nextjs-frontend
```

### Database vuoto

```bash
# Accedi al container
docker-compose exec nextjs-frontend /bin/sh

# Esegui seed
npx prisma db seed
```

---

**🎉 Il sistema è pronto! Buon lavoro! 🚀**

**Per domande:** Consulta `DOCKER_GUIDE.md` o `DATAPIZZA_SETUP.md`
