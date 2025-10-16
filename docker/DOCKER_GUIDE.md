# 🐳 Docker - Guida Completa

## ⚡ Quick Start (1 Comando)

### Windows
```bash
run.bat
```

### Linux/Mac
```bash
./run.sh
```

Scegli l'opzione **[1] Docker** e il sistema si avvierà automaticamente!

---

## 🎯 Comandi Principali

### Avvio Completo
```bash
docker-compose up --build -d
```

### Ferma Tutto
```bash
docker-compose down
```

### Visualizza Logs
```bash
docker-compose logs -f
```

---

## 📦 Cosa Include

- ✅ **Python Backend** (FastAPI + DataPizza AI) - Porta 8000
- ✅ **Next.js Frontend** - Porta 3000
- ✅ **Database SQLite** - Condiviso tra i servizi
- ✅ **Health Checks** - Monitoraggio automatico

---

## 📊 Endpoints

- http://localhost:3000 - Frontend
- http://localhost:8000/docs - API Docs interattiva

---

## 🔧 Troubleshooting

### "Port already in use"
```bash
docker-compose down
```

### Rebuild completo
```bash
docker-compose down -v
docker-compose up --build
```

Vedi documentazione completa per dettagli avanzati.
