# 🚀 CRM Immobiliare - Deployment Quick Start

**Deploy CRM Immobiliare with auto-updates in 5 minutes!**

---

## ⚡ Quick Deploy (Production)

### 1. Configure Environment

```bash
# Copy template and edit with your values
cp .env.production.example .env
nano .env
```

**Required variables**:
- `POSTGRES_PASSWORD` - Strong database password
- `SESSION_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production domain
- `GOOGLE_API_KEY` - Get from https://aistudio.google.com/app/apikey
- `OPENROUTER_API_KEY` - Get from https://openrouter.ai/keys

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Check Status

```bash
docker-compose ps
docker-compose logs -f
```

### 4. Access Application

- **App**: http://localhost:3000
- **AI Tools**: http://localhost:8000
- **Health Check**: http://localhost:3000/api/health

---

## 🔄 Auto-Update System

**How it works**:
1. Push code to `main` branch
2. GitHub Actions builds and pushes Docker images to GHCR
3. Watchtower detects new images (checks every 5 minutes)
4. Containers are automatically updated with zero configuration

**Monitor updates**:
```bash
docker-compose logs -f watchtower
```

---

## 🛠️ Development Mode

Use `docker-compose.dev.yml` for local development:

```bash
docker-compose -f docker-compose.dev.yml up
```

Differences from production:
- Builds images locally (no GHCR pull)
- No Watchtower (not needed for dev)
- Development-friendly settings

---

## 📊 Common Commands

```bash
# View logs
docker-compose logs -f app

# Restart service
docker-compose restart app

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data!)
docker-compose down -v

# Check disk usage
docker system df

# Cleanup old images
docker system prune -a
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
docker-compose logs app
```

### Database connection error
```bash
docker-compose exec database pg_isready -U crm_user
```

### Out of disk space
```bash
docker system prune -a --volumes
```

---

## 📚 Full Documentation

For complete setup, security, monitoring, and troubleshooting:
- **[Docker Deployment Guide](docs/DOCKER_DEPLOYMENT.md)** - Complete guide
- **[Project Documentation](docs/)** - All project docs

---

## 🆘 Need Help?

- [GitHub Issues](https://github.com/cookkie03/cookkie-real-estate-agent/issues)
- [Full Deployment Guide](docs/DOCKER_DEPLOYMENT.md)

---

**Made with ❤️ by Luca M. & Claude Code**
