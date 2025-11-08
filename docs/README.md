# 📚 Documentazione CRM Immobiliare

Indice completo della documentazione del progetto.

---

## 📖 Documentazione Attiva

### Quick Start e Setup

1. **[GETTING_STARTED.md](GETTING_STARTED.md)** - Guida rapida per iniziare con lo sviluppo locale
2. **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Guida completa per deployment con Docker

### Architettura e Technical Design

3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architettura completa del sistema (moduli, pattern, design)
4. **[TECH_STACK_AND_IMPROVEMENTS.md](TECH_STACK_AND_IMPROVEMENTS.md)** - Stack tecnologico dettagliato e proposte di miglioramento

---

## 📋 Struttura Documentazione

```
docs/
├── README.md                          # Questo file - Indice documentazione
├── GETTING_STARTED.md                 # Quick start guide
├── DOCKER_DEPLOYMENT.md               # Docker deployment guide
├── ARCHITECTURE.md                    # System architecture
├── TECH_STACK_AND_IMPROVEMENTS.md     # Tech stack overview
│
└── archive/                           # Documentazione archiviata (storica)
    ├── ai-integration/                # Guide AI integration obsolete
    ├── reorganization/                # Report riorganizzazione repository
    ├── setup/                         # Guide setup obsolete
    └── analysis/archive/              # Report analisi obsoleti
```

---

## 🗄️ Documentazione Archiviata

I seguenti documenti sono stati archiviati in `docs/archive/` perché:
- Riferiscono a strutture di directory obsolete (es: `python_ai/` → ora `ai_tools/`)
- Sono report di sessioni specifiche completate
- Contengono informazioni superate dalle versioni correnti

### Categorie Archiviate

- **`archive/ai-integration/`** - Guide setup DataPizza AI (riferimenti a `python_ai/` obsoleti)
- **`archive/reorganization/`** - Report delle 9 fasi di riorganizzazione repository (completata)
- **`archive/setup/`** - Guide setup e migrazione obsolete
- **`archive/analysis/`** - Report analisi e planning specifici di sessioni passate

**Nota**: I documenti archiviati sono mantenuti per riferimento storico ma non devono essere usati come guida principale. Consultare sempre CLAUDE.md e i README dei singoli moduli per informazioni aggiornate.

---

## 🔍 Come Navigare la Documentazione

### Per iniziare con il progetto
→ Leggi **[GETTING_STARTED.md](GETTING_STARTED.md)**

### Per capire l'architettura
→ Leggi **[ARCHITECTURE.md](ARCHITECTURE.md)**

### Per deployment con Docker
→ Leggi **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)**

### Per linee guida di sviluppo
→ Leggi **[/CLAUDE.md](/CLAUDE.md)** (nella root del progetto)

### Per documentazione modulo-specifica
→ Consulta i README nei singoli moduli:
- `frontend/README.md`
- `ai_tools/README.md`
- `database/README.md`
- `scraping/README.md`

---

## 📝 Versioning

- **Versione**: 4.0.0
- **Ultimo Aggiornamento**: 2025-11-08
- **Stato**: Documentazione pulita e organizzata

---

## 🎯 Linee Guida per Nuova Documentazione

Quando crei nuova documentazione:

1. **Documentazione permanente** → Mettila nella root di `docs/`
2. **Guide specifiche di modulo** → Mettile nel README del modulo specifico
3. **Report temporanei** → Non crearli, o se necessari eliminali dopo l'uso
4. **Report di analisi completate** → Archivia in `docs/archive/analysis/`

**Regola d'oro**: Mantieni `docs/` snella con solo documentazione permanente e utile.

---

**Mantenuto da**: Luca M. & Claude Code
**Repository**: [cookkie-real-estate-agent](https://github.com/cookkie03/cookkie-real-estate-agent)
