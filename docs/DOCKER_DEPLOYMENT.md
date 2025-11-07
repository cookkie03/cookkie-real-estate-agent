# 🐳 Guida Deployment Docker - CRM Immobiliare

**Deploy completo con auto-aggiornamento automatico da GitHub**

---

## 📋 Indice

1. [Panoramica Sistema](#panoramica-sistema)
2. [Requisiti](#requisiti)
3. [Configurazione Iniziale](#configurazione-iniziale)
4. [Deployment su Synology NAS](#deployment-su-synology-nas)
5. [Deployment con Docker Desktop](#deployment-con-docker-desktop)
6. [Deployment CLI (Opzionale)](#deployment-cli-opzionale)
7. [Verifica e Monitoraggio](#verifica-e-monitoraggio)
8. [Gestione Servizi](#gestione-servizi)
9. [Backup e Restore](#backup-e-restore)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Panoramica Sistema

### Architettura

Il sistema è composto da **4 servizi Docker** orchestrati con Docker Compose:

| Servizio | Tecnologia | Porta | Descrizione |
|----------|-----------|-------|-------------|
| **database** | PostgreSQL 16 | 5432 | Database applicazione |
| **app** | Next.js 14 | 3000 | Frontend + Backend API |
| **ai-tools** | Python FastAPI | 8000 | AI Agents (RAG, Matching, Briefing) |
| **watchtower** | Watchtower | - | Auto-aggiornamento container |

### Come Funziona l'Auto-Aggiornamento

```
┌──────────────────┐
│  Push su main    │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ GitHub Actions   │ ◄── Build immagini Docker
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  GHCR (Registry) │ ◄── Push immagini taggate :latest
└────────┬─────────┘
         │
         v
┌──────────────────┐
│   Watchtower     │ ◄── Controlla ogni 5 minuti
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Auto-Update      │ ◄── Aggiorna container automaticamente
└──────────────────┘
```

**Risultato**: Ogni push al branch `main` aggiorna automaticamente i container in produzione entro 5 minuti, **senza intervento manuale**.

### Dati Persistenti

I seguenti dati sopravvivono agli aggiornamenti grazie ai Docker Volumes:

- ✅ Database PostgreSQL (dati CRM, contatti, proprietà, etc.)
- ✅ File caricati dagli utenti (immagini, documenti)
- ✅ Backup del database

---

## ✅ Requisiti

### Hardware

- **RAM**: Minimo 2GB, consigliati 4GB+
- **Storage**: 20GB+ spazio libero
- **CPU**: 2+ core consigliati

### Software

**Opzione 1: Synology NAS**
- DSM 7.0 o superiore
- Container Manager installato (Package Center)
- Accesso SSH (opzionale, per troubleshooting)

**Opzione 2: Server/PC con Docker Desktop**
- Windows 10/11 64-bit o macOS 10.15+
- Docker Desktop installato ([scarica qui](https://www.docker.com/products/docker-desktop))

**Opzione 3: Server Linux (CLI)**
- Ubuntu 20.04+, Debian 11+, o simili
- Docker Engine 20.10+ installato
- Docker Compose 2.0+ installato

---

## 🔧 Configurazione Iniziale

### Passo 1: Scaricare il Progetto

**Opzione A: Download ZIP**
1. Vai su https://github.com/cookkie03/cookkie-real-estate-agent
2. Click su **Code** → **Download ZIP**
3. Estrai in una cartella (es: `crm-immobiliare`)

**Opzione B: Git Clone (se hai Git installato)**
```bash
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent
```

### Passo 2: Configurare File .env

1. **Copia il file template**:
   - Duplica il file `.env.example`
   - Rinominalo in `.env`

2. **Genera i secrets** (necessari per sicurezza):

   **Su Windows** (PowerShell):
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

   **Su Mac/Linux** (Terminale):
   ```bash
   openssl rand -base64 32
   ```

   Esegui il comando **2 volte** per ottenere 2 secrets diversi.

3. **Modifica il file .env** con un editor di testo:

   ```bash
   # ⚠️ OBBLIGATORIO: Cambia la password del database
   POSTGRES_PASSWORD=LA_TUA_PASSWORD_SICURA

   # ⚠️ OBBLIGATORIO: Incolla i 2 secrets generati
   SESSION_SECRET=primo_secret_generato
   NEXTAUTH_SECRET=secondo_secret_generato

   # ⚠️ OBBLIGATORIO: URL della tua applicazione
   # Sviluppo/Test locale:
   NEXTAUTH_URL=http://localhost:3000
   # O produzione (con tuo dominio):
   # NEXTAUTH_URL=https://crm.tuo-dominio.com

   # ⚠️ OBBLIGATORIO: API Keys per funzionalità AI
   GOOGLE_API_KEY=tua_chiave_google_ai
   OPENROUTER_API_KEY=tua_chiave_openrouter
   ```

4. **Dove ottenere le API Keys**:
   - **Google AI (Gemini)**: https://aistudio.google.com/app/apikey (gratuito)
   - **OpenRouter**: https://openrouter.ai/keys (pay-as-you-go)

---

## 📦 Deployment su Synology NAS

### Prerequisiti

1. **Installare Container Manager**:
   - Apri **Package Center**
   - Cerca "**Container Manager**"
   - Clicca **Installa**

2. **Preparare i file**:
   - Carica la cartella `crm-immobiliare` su Synology tramite File Station
   - Posizionala in una cartella accessibile (es: `/docker/crm-immobiliare`)

### Deployment con GUI

#### 1. Aprire Container Manager

1. Apri **Container Manager** dal menu DSM
2. Vai alla sezione **Progetto** (Project)

#### 2. Creare Nuovo Progetto

1. Clicca **Crea** → **Crea progetto**
2. Configura:
   - **Nome progetto**: `crm-immobiliare`
   - **Percorso**: Seleziona la cartella dove hai caricato i file
   - **Origine**: `docker-compose.yml`

#### 3. Configurare Variabili d'Ambiente

Nella schermata di configurazione:

1. Clicca su **Impostazioni avanzate**
2. Vai alla tab **Variabili d'ambiente**
3. Aggiungi le variabili dal tuo file `.env`:

   ```
   POSTGRES_PASSWORD=la_tua_password
   SESSION_SECRET=primo_secret
   NEXTAUTH_SECRET=secondo_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_API_KEY=tua_chiave
   OPENROUTER_API_KEY=tua_chiave
   GITHUB_REPOSITORY_OWNER=cookkie03
   ```

#### 4. Configurare Porte (se necessario)

Se le porte 3000, 5432, 8000 sono già in uso sul tuo NAS:

1. Nella tab **Port Settings**
2. Modifica le porte esterne:
   - Database: `5432` → `15432` (esempio)
   - App: `3000` → `13000` (esempio)
   - AI Tools: `8000` → `18000` (esempio)

#### 5. Avviare il Progetto

1. Clicca **Avanti** → **Fatto**
2. Il sistema scaricherà le immagini Docker (prima volta: ~5-10 minuti)
3. I container si avvieranno automaticamente

#### 6. Verificare lo Stato

1. In Container Manager → **Progetto**
2. Vedi lo stato `crm-immobiliare`:
   - ✅ **Running** = Tutto OK
   - ⚠️ **Starting** = In avvio (aspetta 1-2 minuti)
   - ❌ **Error** = Vedi [Troubleshooting](#troubleshooting)

3. Clicca sul progetto per vedere i singoli container:
   - `crm-database` - Running
   - `crm-app` - Running
   - `crm-ai-tools` - Running
   - `crm-watchtower` - Running

#### 7. Accedere all'Applicazione

Apri il browser e vai su:
```
http://[IP-NAS]:3000
```

Esempio: `http://192.168.1.100:3000`

### Gestione da Synology

**Vedere i log**:
1. Container Manager → Progetto → `crm-immobiliare`
2. Clicca su un container
3. Tab **Log**

**Riavviare**:
1. Seleziona il progetto
2. **Azione** → **Riavvia**

**Fermare**:
1. Seleziona il progetto
2. **Azione** → **Stop**

**Rimuovere** (mantiene i dati):
1. **Azione** → **Elimina**
2. ⚠️ Lascia **deselezionato** "Elimina anche i volumi"

---

## 🖥️ Deployment con Docker Desktop

### Prerequisiti

1. **Installare Docker Desktop**:
   - Scarica da: https://www.docker.com/products/docker-desktop
   - Installa e avvia Docker Desktop
   - Aspetta che sia "Running" (icona verde)

2. **Preparare i file**:
   - Scarica e estrai il progetto in una cartella locale
   - Es: `C:\Users\TuoNome\crm-immobiliare`

### Deployment con GUI

#### 1. Aprire Docker Desktop

1. Avvia Docker Desktop
2. Aspetta che l'icona in basso-sinistra sia verde (Engine running)

#### 2. Importare il Progetto

**Metodo A: File Explorer**
1. Apri la cartella del progetto
2. Click destro su `docker-compose.yml`
3. **Open with** → **Docker Desktop**

**Metodo B: Da Docker Desktop**
1. Click su **Images** → **Remote repositories**
2. Oppure usa il tab **Containers** → **+ (Create)**

#### 3. Configurare con file .env

Docker Desktop legge automaticamente il file `.env` nella stessa cartella di `docker-compose.yml`.

1. Assicurati che `.env` sia configurato correttamente
2. Verifica che sia nella stessa cartella di `docker-compose.yml`

#### 4. Avviare con CLI integrata

Docker Desktop non ha una GUI completa per Compose, quindi usa il terminale integrato:

1. **Apri il terminale** di Docker Desktop:
   - Click sull'icona **CLI** in alto a destra
   - Oppure apri **PowerShell/Terminal** e naviga nella cartella progetto

2. **Avvia i servizi**:
   ```bash
   docker-compose up -d
   ```

3. **Verifica lo stato**:
   ```bash
   docker-compose ps
   ```

#### 5. Monitorare da GUI

1. Vai su **Containers** in Docker Desktop
2. Vedi i 4 container del progetto:
   - `crm-database`
   - `crm-app`
   - `crm-ai-tools`
   - `crm-watchtower`

3. Per ogni container puoi:
   - ▶️ Start/Stop
   - 📋 Vedere i log (click sul container)
   - 🔧 Aprire terminal/bash
   - 📊 Monitorare CPU/RAM

#### 6. Accedere all'Applicazione

Apri il browser:
```
http://localhost:3000
```

### Gestione da Docker Desktop

**Vedere i log**:
1. **Containers** → Click sul container
2. **Logs** tab

**Riavviare un container**:
1. Hover sul container
2. Click sui 3 puntini → **Restart**

**Fermare tutto**:
1. Seleziona i container
2. Click **Stop**

**Rimuovere** (mantiene i dati):
1. Stop dei container
2. Click sui 3 puntini → **Delete**
3. Lascia deselezionato "Remove volumes"

---

## 💻 Deployment CLI (Opzionale)

Per utenti avanzati o server Linux senza GUI.

### Installazione Docker (se non presente)

**Ubuntu/Debian**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

**Verifica installazione**:
```bash
docker --version
docker-compose --version
```

### Deploy

```bash
# 1. Clona repository
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent

# 2. Configura environment
cp .env.example .env
nano .env  # Modifica i valori

# 3. Avvia servizi
docker-compose up -d

# 4. Verifica stato
docker-compose ps

# 5. Vedi logs
docker-compose logs -f
```

### Comandi Utili

```bash
# Vedere logs specifici
docker-compose logs -f app
docker-compose logs -f watchtower

# Riavviare un servizio
docker-compose restart app

# Fermare tutto
docker-compose down

# Fermare E rimuovere volumi (⚠️ CANCELLA DATI!)
docker-compose down -v

# Aggiornare manualmente le immagini
docker-compose pull
docker-compose up -d

# Vedere risorse utilizzate
docker stats
```

---

## ✅ Verifica e Monitoraggio

### Health Check

Dopo l'avvio, verifica che tutto funzioni:

**1. Check Application Health**
```bash
# Risposta attesa: {"success":true,"status":"healthy",...}
curl http://localhost:3000/api/health
```

**2. Check Database**
```bash
docker-compose exec database pg_isready -U crm_user
# Risposta attesa: crm_user - accepting connections
```

**3. Check AI Tools**
```bash
curl http://localhost:8000/health
# Risposta attesa: {"status":"healthy"}
```

### Stato Container

**GUI (Docker Desktop/Synology)**:
- Tutti i container devono essere **Running** (verde)
- Health status: **Healthy**

**CLI**:
```bash
docker-compose ps

# Risultato atteso:
# NAME              STATUS              PORTS
# crm-app           Up (healthy)        0.0.0.0:3000->3000/tcp
# crm-database      Up (healthy)        0.0.0.0:5432->5432/tcp
# crm-ai-tools      Up (healthy)        0.0.0.0:8000->8000/tcp
# crm-watchtower    Up
```

### Verificare Auto-Update

**Watchtower sta funzionando?**

GUI:
1. Apri i log di `crm-watchtower`
2. Cerca: `Checking images for updates`

CLI:
```bash
docker-compose logs watchtower | grep "Checking"
```

Dovresti vedere check ogni 5 minuti.

---

## 🔧 Gestione Servizi

### Aggiungere Nuovi Servizi

Il sistema è progettato per essere scalabile. Per aggiungere servizi:

1. **Modifica `docker-compose.yml`**:
   ```yaml
   services:
     # ... servizi esistenti ...

     nuovo-servizio:
       image: ghcr.io/cookkie03/nuovo-servizio:latest
       container_name: crm-nuovo-servizio
       pull_policy: always
       environment:
         DATABASE_URL: postgresql://${POSTGRES_USER}...
       ports:
         - "9000:9000"
       networks:
         - crm_network
       restart: unless-stopped
       labels:
         - "com.centurylinklabs.watchtower.enable=true"
   ```

2. **Riapplica configurazione**:
   ```bash
   docker-compose up -d
   ```

Watchtower monitorerà automaticamente anche il nuovo servizio.

### Rimuovere Servizi

1. Rimuovi il servizio da `docker-compose.yml`
2. Riapplica:
   ```bash
   docker-compose up -d
   ```
3. Rimuovi container orfano:
   ```bash
   docker-compose down --remove-orphans
   ```

---

## 💾 Backup e Restore

### Backup Automatico

I dati sono già persistiti nei Docker Volumes, ma è consigliato backup regolare.

**Synology**: Usa "Hyper Backup" per backup automatico della cartella `/docker/crm-immobiliare`

**Script Backup Database** (Linux/Mac):

```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="$HOME/crm-backups"
mkdir -p $BACKUP_DIR

docker-compose exec -T database pg_dump -U crm_user crm_immobiliare > \
  "$BACKUP_DIR/crm_backup_$(date +%Y%m%d_%H%M%S).sql"

# Mantieni solo ultimi 30 backup
find $BACKUP_DIR -name "crm_backup_*.sql" -mtime +30 -delete
```

**Cron per backup giornaliero** (2:00 AM):
```bash
crontab -e
# Aggiungi:
0 2 * * * /path/to/backup-db.sh
```

### Restore da Backup

```bash
# Stop applicazione
docker-compose stop app ai-tools

# Restore database
docker-compose exec -T database psql -U crm_user crm_immobiliare < backup_file.sql

# Restart
docker-compose start app ai-tools
```

### Backup Completo dei Volumi

```bash
# Backup di tutti i volumi
docker run --rm \
  -v crm_postgres_data:/source/postgres \
  -v crm_app_uploads:/source/uploads \
  -v crm_app_backups:/source/backups \
  -v $(pwd):/backup \
  alpine tar czf /backup/crm_full_backup_$(date +%Y%m%d).tar.gz /source

# Restore
docker run --rm \
  -v crm_postgres_data:/source/postgres \
  -v crm_app_uploads:/source/uploads \
  -v crm_app_backups:/source/backups \
  -v $(pwd):/backup \
  alpine tar xzf /backup/crm_full_backup_20240615.tar.gz -C /
```

---

## 🐛 Troubleshooting

### Container non si avvia

**Sintomi**: Container in stato **Error** o **Exited**

**Diagnosi**:
```bash
# Vedi errori nei log
docker-compose logs [nome-servizio]

# Esempio:
docker-compose logs app
```

**Soluzioni comuni**:

1. **Database non pronto**: Aspetta 30 secondi e riavvia
   ```bash
   docker-compose restart app
   ```

2. **Variabili .env mancanti**: Verifica `.env` completo

3. **Porte già in uso**:
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -i :3000
   ```
   Soluzione: Cambia porta in `docker-compose.yml` o ferma servizio che usa quella porta

### Watchtower non aggiorna

**Sintomi**: Immagini nuove su GitHub ma container vecchi

**Diagnosi**:
```bash
docker-compose logs watchtower
```

**Soluzioni**:

1. **Verifica label**:
   ```bash
   docker inspect crm-app | grep watchtower.enable
   # Deve mostrare: "com.centurylinklabs.watchtower.enable": "true"
   ```

2. **Forza update manuale**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

3. **Restart Watchtower**:
   ```bash
   docker-compose restart watchtower
   ```

4. **Immagini GHCR non accessibili**: Verifica che le immagini siano pubbliche su GitHub

### Database connection error

**Sintomi**: App non si connette al database

**Diagnosi**:
```bash
# Test connessione database
docker-compose exec database pg_isready -U crm_user
```

**Soluzioni**:

1. **Password errata in .env**: Verifica `POSTGRES_PASSWORD` sia uguale in `DATABASE_URL`

2. **Database non avviato**:
   ```bash
   docker-compose up -d database
   docker-compose logs database
   ```

3. **Reset completo** (⚠️ CANCELLA DATI):
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Spazio disco pieno

**Sintomi**: `no space left on device`

**Diagnosi**:
```bash
# Spazio usato da Docker
docker system df

# Spazio disco
df -h
```

**Soluzioni**:

1. **Cleanup immagini vecchie**:
   ```bash
   docker system prune -a
   ```

2. **Cleanup volumi non usati** (⚠️ ATTENZIONE):
   ```bash
   docker volume prune
   ```

3. **Cleanup tutto** (⚠️ MANTIENI SOLO VOLUMI ATTIVI):
   ```bash
   docker system prune -a --volumes
   ```

### Performance lente

**Diagnosi**:
```bash
# Risorse usate
docker stats

# Vedi container che consumano più risorse
```

**Soluzioni**:

1. **Limita risorse** (modifica `docker-compose.yml`):
   ```yaml
   services:
     app:
       # ... config esistente ...
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 1G
   ```

2. **Aumenta RAM server/NAS**

3. **Ottimizza database** (se molto grande):
   ```bash
   docker-compose exec database psql -U crm_user crm_immobiliare -c "VACUUM ANALYZE;"
   ```

### Logs Utili

```bash
# Tutti i servizi (ultimi 100 righe)
docker-compose logs --tail=100

# Segui logs in tempo reale
docker-compose logs -f

# Solo errori
docker-compose logs | grep -i error

# Logs di un servizio specifico
docker-compose logs -f app
docker-compose logs -f database
docker-compose logs -f watchtower
```

---

## 📞 Supporto

### Risorse

- **Documentazione progetto**: [GitHub Wiki](https://github.com/cookkie03/cookkie-real-estate-agent/wiki)
- **Issues**: [GitHub Issues](https://github.com/cookkie03/cookkie-real-estate-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cookkie03/cookkie-real-estate-agent/discussions)

### Segnalare un Problema

Quando apri una issue includi:

1. **Environment**:
   - OS (Windows/Mac/Linux/Synology DSM)
   - Docker version: `docker --version`
   - Docker Compose version: `docker-compose --version`

2. **Logs**:
   ```bash
   docker-compose logs > logs.txt
   ```
   Allega il file `logs.txt`

3. **Configurazione**:
   - File `docker-compose.yml` (rimuovi dati sensibili)
   - File `.env` (⚠️ RIMUOVI password e API keys!)

4. **Descrizione chiara** del problema e passi per riprodurlo

---

## 🎉 Conclusione

Hai ora un sistema CRM Immobiliare completamente dockerizzato con:

✅ Auto-aggiornamento automatico da GitHub
✅ Dati persistenti e sicuri
✅ Scalabilità per aggiungere/rimuovere servizi
✅ Monitoraggio e health checks
✅ Backup e restore semplici
✅ Compatibile con Synology, Docker Desktop, e server Linux

**Ogni push al branch `main` aggiorna automaticamente la tua installazione!**

---

**Made with ❤️ by Luca M. & Claude Code**
