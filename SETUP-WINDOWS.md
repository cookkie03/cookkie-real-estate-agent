# 🚀 Setup Completo - CRM Immobiliare (Windows)

Guida passo-passo per avviare il CRM Immobiliare su Windows.

---

## 📋 Prerequisiti

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/download/win))
- **pnpm** (package manager moderno)

---

## ⚡ Setup Rapido (5 minuti)

### **1. Clona e Aggiorna Repository**

```powershell
cd C:\Users\lucam\Desktop\cookkie-real-estate-agent
git pull origin claude/senza-canc-011CV66ZcJhcuN69jgLsvi6F
```

### **2. Installa pnpm** (se non l'hai già fatto)

```powershell
npm install -g pnpm
```

Verifica installazione:
```powershell
pnpm --version  # Dovrebbe mostrare >= 10.0.0
```

### **3. Installa Dipendenze**

```powershell
pnpm install
```

**Importante**: Se vedi warning su "build scripts", esegui:
```powershell
pnpm approve-builds
```

### **4. Genera Prisma Client**

```powershell
pnpm prisma:generate
```

Questo crea il database SQLite locale e genera i TypeScript types.

### **5. Avvia il Frontend**

```powershell
pnpm dev:web
```

Apri il browser su **http://localhost:3000** 🎉

---

## 🔧 Avvio Backend API (Opzionale)

Se vuoi testare le API NestJS:

### **Terminale 1 - Frontend**
```powershell
pnpm dev:web
```

### **Terminale 2 - Backend**
```powershell
cd apps/api
pnpm start:dev
```

**API disponibili su:**
- REST API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api/docs
- Health Check: http://localhost:3001/health

---

## 📊 Gestione Database

### **Prisma Studio** (GUI per il database)
```powershell
pnpm prisma:studio
```
Apre GUI su http://localhost:5555

### **Reset Database**
```powershell
cd packages/database
pnpm prisma:push --force-reset
```

### **Migrations** (produzione)
```powershell
pnpm prisma:migrate
```

---

## 🧪 Test Completo (Utente Normale)

### **Scenario 1: Solo Frontend**

1. **Avvia applicazione**
   ```powershell
   pnpm dev:web
   ```

2. **Apri browser** → http://localhost:3000

3. **Verifica funzionalità**:
   - ✅ Landing page visibile
   - ✅ Navigazione tra sezioni
   - ✅ UI responsive

### **Scenario 2: Full Stack (Frontend + Backend)**

1. **Avvia backend**
   ```powershell
   # Terminale 1
   cd apps/api
   pnpm start:dev
   ```

2. **Avvia frontend**
   ```powershell
   # Terminale 2
   pnpm dev:web
   ```

3. **Test API**:
   - Apri http://localhost:3001/api/docs (Swagger)
   - Testa endpoint `/health`
   - Esplora API disponibili

4. **Test Frontend-Backend**:
   - Apri http://localhost:3000
   - Verifica che frontend comunichi con API

---

## 🐛 Troubleshooting

### **Errore: "concurrently not found"**
```powershell
pnpm install
```

### **Errore: "Prisma Client not found"**
```powershell
pnpm prisma:generate
```

### **Porta 3000 già in uso**
```powershell
# Cambia porta nel comando
cd apps/web
pnpm next dev -p 3001
```

### **Errore Python** (dev:ai)
Non necessario! Il servizio Python è legacy. Usa solo:
```powershell
pnpm dev:web  # invece di pnpm dev
```

### **Prisma build script warning**
```powershell
pnpm approve-builds
```
Poi seleziona Prisma e conferma.

---

## 🔄 Alternativa: Usare npm invece di pnpm

Se preferisci npm (più semplice ma più lento):

### **Opzione A - Solo Frontend (senza workspace)**
```powershell
cd apps/web
npm install
npm run dev
```

### **Opzione B - Full monorepo (richiede npm 7+)**
```powershell
# Nel root della repository
npm install  # Potrebbe funzionare con npm workspaces
npm run dev:web
```

**Nota**: Il progetto è ottimizzato per pnpm. Con npm potrebbero esserci problemi con le workspace. Se vuoi usare npm esclusivamente, chiedi una conversione completa.

---

## 📁 Struttura Progetto

```
crm-immobiliare/
├── apps/
│   ├── web/          ← Frontend Next.js (porta 3000)
│   └── api/          ← Backend NestJS (porta 3001)
├── packages/
│   ├── database/     ← Prisma schema
│   ├── ai-toolkit/   ← AI agents
│   └── shared-types/ ← TypeScript types
└── SETUP-WINDOWS.md  ← Questa guida
```

---

## 🌐 URL Principali

| Servizio | URL | Descrizione |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Applicazione web |
| Backend API | http://localhost:3001 | REST API |
| Swagger Docs | http://localhost:3001/api/docs | API documentation |
| Prisma Studio | http://localhost:5555 | Database GUI |

---

## 🎯 Comandi Utili

```powershell
# Sviluppo
pnpm dev:web          # Solo frontend
pnpm dev              # Frontend + AI (Python) - può dare errori Python
cd apps/api && pnpm start:dev  # Solo backend

# Database
pnpm prisma:generate  # Genera Prisma Client
pnpm prisma:studio    # GUI database
pnpm prisma:push      # Sincronizza schema

# Build (produzione)
pnpm build            # Build tutti i progetti
pnpm build:web        # Solo frontend

# Pulizia
pnpm clean            # Rimuove node_modules
pnpm clean:dist       # Rimuove file build
```

---

## 📝 Note Importanti

1. **SQLite vs PostgreSQL**:
   - Sviluppo locale: SQLite (nessun Docker necessario)
   - Produzione: PostgreSQL (via Docker)

2. **Python AI Service**:
   - Servizio legacy, non necessario per sviluppo
   - Usa solo `pnpm dev:web` per evitare errori Python

3. **Performance**:
   - pnpm è ~2x più veloce di npm
   - npm workspaces funzionano ma sono meno ottimizzate

4. **Docker**:
   - Non necessario per sviluppo locale
   - Richiesto solo per produzione

---

## ✅ Checklist Setup Completato

- [ ] Node.js 20+ installato
- [ ] pnpm installato globalmente
- [ ] Repository clonato e aggiornato
- [ ] Dipendenze installate (`pnpm install`)
- [ ] Prisma client generato (`pnpm prisma:generate`)
- [ ] Frontend avviato (`pnpm dev:web`)
- [ ] Browser aperto su http://localhost:3000
- [ ] Landing page visibile ✨

---

## 🆘 Supporto

Se incontri problemi:
1. Controlla la sezione Troubleshooting sopra
2. Verifica i log nel terminale
3. Riporta errori specifici con screenshot

---

**Versione**: 4.0.0 (Production Ready)
**Ultimo Aggiornamento**: 2025-11-15
**Piattaforma Testata**: Windows 11
