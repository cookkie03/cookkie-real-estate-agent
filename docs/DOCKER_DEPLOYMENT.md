# 🐳 Docker Deployment Guide - CRM Immobiliare

**Complete guide for deploying CRM Immobiliare with Docker, auto-updates, and production-ready configuration.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Auto-Update System](#auto-update-system)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This deployment uses Docker Compose with **automatic updates via Watchtower**:

- **4 Services**: PostgreSQL, Next.js App, AI Tools, Watchtower
- **Auto-update**: Watchtower monitors GitHub Container Registry (GHCR) every 5 minutes
- **Zero-downtime**: Graceful container restart after updates
- **Data persistence**: PostgreSQL data, uploads, and backups survive updates

### How It Works

```
GitHub Push → GitHub Actions → Build & Push to GHCR → Watchtower Detects → Auto-Update Containers
```

---

## 🏗️ Architecture

### Services

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| **database** | PostgreSQL 16 | 5432 | Database |
| **app** | Next.js 14 | 3000 | Frontend + Backend API |
| **ai-tools** | Python FastAPI | 8000 | AI Agents & Tools |
| **watchtower** | Watchtower | - | Auto-update monitor |

### Volumes (Persistent Data)

- `postgres_data` - Database files (survives updates)
- `app_uploads` - User uploaded files (survives updates)
- `app_backups` - Database backups (survives updates)

---

## ✅ Prerequisites

### Server Requirements

- **OS**: Linux (Ubuntu 20.04+, Debian 11+, or similar)
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: 20GB+ free space
- **CPU**: 2+ cores recommended

### Software Requirements

```bash
# Docker Engine 20.10+
docker --version

# Docker Compose 2.0+
docker-compose --version
```

### Install Docker (if not installed)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker run hello-world
```

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent
```

### 2. Configure Environment

```bash
# Copy production environment template
cp .env.production.example .env

# Edit with your values (REQUIRED!)
nano .env
```

**Minimum required configuration**:
```bash
DATABASE_URL="postgresql://crm_user:YOUR_STRONG_PASSWORD@database:5432/crm_immobiliare"
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD
SESSION_SECRET=GENERATE_WITH_openssl_rand_base64_32
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_base64_32
NEXTAUTH_URL=https://your-domain.com
GOOGLE_API_KEY=your_google_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3. Start Services

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Verify Deployment

```bash
# Check app health
curl http://localhost:3000/api/health

# Expected response: {"status":"ok"}
```

---

## 🏭 Production Deployment

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required tools
sudo apt install -y git curl wget

# Configure firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Step 2: SSL/TLS Setup (Recommended)

**Using Nginx + Let's Encrypt**:

```bash
# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/crm-immobiliare
```

**Nginx configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/crm-immobiliare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Step 3: Deploy Application

```bash
# Navigate to project
cd /opt/crm-immobiliare

# Configure environment
cp .env.production.example .env
nano .env  # Edit with production values

# Start services
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs app
```

### Step 4: Initial Database Setup

```bash
# The entrypoint script automatically runs migrations, but you can verify:
docker-compose exec app npx prisma migrate status

# If needed, manually run migrations:
docker-compose exec app npx prisma migrate deploy

# Seed initial data (optional)
docker-compose exec app npm run prisma:seed
```

---

## 🔄 Auto-Update System

### How Watchtower Works

1. **Monitors**: Checks GHCR every 5 minutes for new images
2. **Detects**: Compares image digests to detect updates
3. **Updates**: Pulls new image and gracefully restarts container
4. **Cleans**: Removes old images to save space

### Configuration

Edit `docker-compose.yml` to customize:

```yaml
watchtower:
  environment:
    # Check interval (seconds)
    WATCHTOWER_POLL_INTERVAL: 300  # 5 minutes (default)

    # Only monitor labeled containers
    WATCHTOWER_LABEL_ENABLE: "true"

    # Cleanup old images
    WATCHTOWER_CLEANUP: "true"

    # Enable notifications (optional)
    WATCHTOWER_NOTIFICATIONS: slack
    WATCHTOWER_NOTIFICATION_SLACK_HOOK_URL: ${SLACK_WEBHOOK_URL}
```

### Triggering Updates

**Automatic** (recommended):
```bash
# Push to main branch
git add .
git commit -m "feat: new feature"
git push origin main

# GitHub Actions will:
# 1. Build Docker images
# 2. Push to GHCR
# 3. Watchtower detects and updates (within 5 minutes)
```

**Manual**:
```bash
# Force check for updates immediately
docker-compose restart watchtower
```

### Checking Update Status

```bash
# View Watchtower logs
docker-compose logs -f watchtower

# Check image versions
docker-compose images

# View update history
docker-compose exec watchtower sh -c "cat /var/log/watchtower.log"
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check all services health
docker-compose ps

# App health endpoint
curl http://localhost:3000/api/health

# AI Tools health
curl http://localhost:8000/health

# Database connection
docker-compose exec database pg_isready -U crm_user
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f ai-tools
docker-compose logs -f watchtower

# Last 100 lines
docker-compose logs --tail=100 app

# Since specific time
docker-compose logs --since 2024-01-01T00:00:00 app
```

### Database Backup

```bash
# Manual backup
docker-compose exec database pg_dump -U crm_user crm_immobiliare > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose exec -T database psql -U crm_user crm_immobiliare < backup_20240101_120000.sql
```

**Automated backups** (add to crontab):
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker-compose -f /opt/crm-immobiliare/docker-compose.yml exec -T database pg_dump -U crm_user crm_immobiliare > /opt/crm-immobiliare/backups/backup_$(date +\%Y\%m\%d).sql
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect crm-immobiliare_postgres_data

# Backup volume
docker run --rm -v crm-immobiliare_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volume
docker run --rm -v crm-immobiliare_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs app

# Common issues:
# 1. Database not ready - wait for healthy status
docker-compose ps database

# 2. Port already in use
sudo lsof -i :3000  # Check what's using port 3000
```

### Database Connection Issues

```bash
# Verify database is running
docker-compose ps database

# Check database logs
docker-compose logs database

# Test connection
docker-compose exec database psql -U crm_user -d crm_immobiliare -c "SELECT 1"

# Reset database (CAUTION: deletes data!)
docker-compose down -v
docker-compose up -d
```

### Watchtower Not Updating

```bash
# Check Watchtower logs
docker-compose logs watchtower

# Verify labels on containers
docker inspect crm-app | grep watchtower.enable

# Manually trigger update check
docker-compose restart watchtower

# Pull latest images manually
docker-compose pull
docker-compose up -d
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Remove unused Docker resources
docker system prune -a --volumes

# Remove old images only
docker image prune -a

# Check volume sizes
docker system df -v
```

### Application Errors

```bash
# Check app logs
docker-compose logs -f app

# Restart app container
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build app

# Check environment variables
docker-compose exec app env | grep DATABASE_URL
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase container resources (edit docker-compose.yml)
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

# Check database performance
docker-compose exec database psql -U crm_user -d crm_immobiliare -c "SELECT * FROM pg_stat_activity"
```

---

## 🔐 Security Best Practices

### 1. Secrets Management

```bash
# Never commit .env file
git status  # Should show .env as untracked

# Use strong passwords
openssl rand -base64 32

# Rotate secrets regularly
```

### 2. Firewall Configuration

```bash
# Only expose necessary ports
sudo ufw status

# Don't expose database port publicly
# (Remove ports: ["5432:5432"] from docker-compose.yml)
```

### 3. Regular Updates

```bash
# Keep Docker updated
sudo apt update && sudo apt upgrade docker-ce

# Update base images regularly
docker-compose pull
docker-compose up -d
```

### 4. Monitoring

```bash
# Enable audit logging
docker-compose logs --tail=1000 > audit_$(date +%Y%m%d).log

# Monitor failed login attempts (future feature)
docker-compose exec app cat /app/logs/auth.log
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Watchtower Documentation](https://containrrr.dev/watchtower/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Getting Help

- **Issues**: [GitHub Issues](https://github.com/cookkie03/cookkie-real-estate-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cookkie03/cookkie-real-estate-agent/discussions)
- **Documentation**: [Project Wiki](https://github.com/cookkie03/cookkie-real-estate-agent/wiki)

---

**Made with ❤️ by Luca M. & Claude Code**
