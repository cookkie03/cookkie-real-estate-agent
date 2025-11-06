# 🚀 DOCKER QUICK START (3 Steps!)

**Want to run CRM Immobiliare in 5 minutes?** Follow these steps!

---

## 📦 Method 1: Local Development (Docker Desktop)

### Requirements
- ✅ Docker Desktop installed
- ✅ Google API Key ([get here](https://aistudio.google.com/app/apikey))

### 3 Steps to Running App

**Step 1**: Clone & Configure
```bash
git clone https://github.com/cookkie03/cookkie-real-estate-agent.git
cd cookkie-real-estate-agent
git checkout claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4

# Add your Google API Key
echo "GOOGLE_API_KEY=your_key_here" > .env
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
```

**Step 2**: Start Everything
```bash
docker-compose up -d
```

**Step 3**: Initialize Database
```bash
# Wait 2 minutes for services to start, then:
docker-compose exec backend npx prisma db push --schema=./database/prisma/schema.prisma
```

**Done!** 🎉

Access your app:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- AI Tools: http://localhost:8000

---

## 🚂 Method 2: Railway Deployment (Production)

### Requirements
- ✅ Railway account ([signup](https://railway.app))
- ✅ Google API Key ([get here](https://aistudio.google.com/app/apikey))

### 5 Steps to Production

**Step 1**: Push to GitHub
```bash
# Ensure you're on correct branch
git checkout claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4

# Push to your GitHub
git push origin claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4
```

**Step 2**: Create Railway Project
- Go to https://railway.app
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository
- Select branch: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`

**Step 3**: Add PostgreSQL
- Click "New" → "Database" → "PostgreSQL"
- Railway auto-configures `DATABASE_URL`

**Step 4**: Set Environment Variables
Go to your service → Variables tab → Add these:

```bash
DATABASE_URL=<auto-provided>
GOOGLE_API_KEY=your_actual_key_here
NODE_ENV=production
SESSION_SECRET=<generate random>
CORS_ORIGINS=https://your-app.railway.app
```

Generate SESSION_SECRET:
```bash
openssl rand -base64 32
```

**Step 5**: Wait for Deploy
- Railway builds Docker image automatically
- Wait 5-10 minutes
- Service turns green ✅

**Done!** 🎉

Your app is live at: `https://your-app.railway.app`

---

## 🛠️ Common Commands

### Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Database reset
docker-compose down -v && docker-compose up -d
```

### Railway

```bash
# Install CLI
npm install -g @railway/cli

# View logs
railway login
railway link
railway logs

# Run database migration
railway run npx prisma db push
```

---

## ⚡ Troubleshooting

**Problem**: Service won't start locally
```bash
docker-compose down
docker-compose up -d
docker-compose logs backend
```

**Problem**: Database connection fails
```bash
# Check DATABASE_URL is correct
docker-compose exec backend printenv DATABASE_URL

# Restart database
docker-compose restart database
```

**Problem**: Railway build fails
- Check Railway logs
- Verify all environment variables are set
- Ensure Google API Key is valid

---

## 📖 Full Documentation

For detailed information, see:
- **Complete Guide**: `docs/DOCKER_DEPLOYMENT_GUIDE.md`
- **Railway Guide**: `docs/RAILWAY_DEPLOYMENT_INSTRUCTIONS.md`
- **Next Steps**: `docs/NEXT_SESSION_GUIDE.md`

---

## ✅ Health Check

Test if everything is working:

**Local**:
```bash
curl http://localhost:3001/api/health
curl http://localhost:8000/health
```

**Railway**:
```bash
curl https://your-app.railway.app/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

---

## 🎯 What's Running?

| Service | Local | Description |
|---------|-------|-------------|
| Frontend | :3000 | React UI |
| Backend | :3001 | API Server |
| AI Tools | :8000 | FastAPI AI |
| Database | :5432 | PostgreSQL |

On Railway, ports are auto-assigned and accessed via Railway URLs.

---

**That's it!** Your CRM is now running with Docker! 🐳🎉

Need help? Check `docs/DOCKER_DEPLOYMENT_GUIDE.md` for full documentation.
