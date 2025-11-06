# 🚂 RAILWAY DEPLOYMENT - Complete Instructions

**Created**: 2025-11-06
**Branch to Deploy**: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`
**Status**: Backend complete, ready for Railway deployment
**Estimated Time**: 30-45 minutes

---

## ⚠️ CRITICAL: BRANCH INFORMATION

**Deploy THIS branch**: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`

This branch contains:
- ✅ Complete Prisma schema (PostgreSQL-ready)
- ✅ Complete backend API (17 files, 11 endpoints)
- ✅ All configuration files
- 🟡 Frontend pending (optional for now - backend can be deployed independently)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before starting, ensure you have:

- [ ] Railway account created (https://railway.app)
- [ ] GitHub repository accessible
- [ ] Google API Key (get from https://aistudio.google.com/app/apikey)
- [ ] This branch pushed to GitHub: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Create Railway Project (5 min)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Click "New Project"

2. **Connect GitHub Repository**
   - Click "Deploy from GitHub repo"
   - Select your repository: `cookkie03/cookkie-real-estate-agent`
   - **IMPORTANT**: Select branch `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`

3. **Project Created**
   - Railway will create the project
   - Initial deployment will start (and may fail - this is normal)

---

### Step 2: Add PostgreSQL Database (3 min)

1. **Add Database Service**
   - In your Railway project
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will provision a PostgreSQL database

2. **Get Database URL**
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - Copy the `DATABASE_URL` value (starts with `postgresql://`)
   - **Keep this safe** - you'll need it

---

### Step 3: Configure Environment Variables (10 min)

**CRITICAL**: All services need environment variables configured.

#### For Backend Service

Click on your main service → "Variables" tab → Add these variables:

**Required Variables**:

```bash
# Database (auto-provided by PostgreSQL service)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# Google AI (GET YOUR KEY from https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=your_actual_google_api_key_here

# Node Environment
NODE_ENV=production
PORT=3001

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your_generated_secret_here

# CORS Origins (Railway will provide your domain)
CORS_ORIGINS=https://your-app.railway.app,https://your-app.up.railway.app
```

**Optional Variables** (can add later):

```bash
# OpenAI (if you want to use OpenAI instead of Google)
OPENAI_API_KEY=your_openai_key_here

# SMTP for emails (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_smtp_password
```

#### How to Add Variables in Railway:

1. Click your service
2. Go to "Variables" tab
3. Click "New Variable"
4. Add variable name (e.g., `GOOGLE_API_KEY`)
5. Add variable value
6. Click "Add"
7. Repeat for all variables

**Important**: After adding all variables, Railway will automatically redeploy.

---

### Step 4: Configure Build Settings (5 min)

Railway should auto-detect the configuration from `nixpacks.toml`, but verify:

1. **Click on Service → Settings**

2. **Build Settings**:
   - Builder: Nixpacks ✅ (should be auto-detected)
   - Build Command: (leave default)
   - Start Command: `npm run start:production`

3. **Root Directory** (IMPORTANT if monorepo):
   - If Railway doesn't detect correctly, you may need to set root to `/`
   - Or specify build commands for each service

4. **Healthcheck**:
   - Healthcheck Path: `/api/health`
   - Healthcheck Timeout: 100 seconds

---

### Step 5: Deploy & Monitor (10 min)

1. **Trigger Deployment**
   - If not already deploying, click "Deploy"
   - Railway will:
     - Install Node.js 20
     - Install Python 3.11
     - Install all npm dependencies
     - Install all Python dependencies (ai_tools, scraping)
     - Generate Prisma Client
     - Build backend
     - Start services

2. **Monitor Build Logs**
   - Click on service → "Deployments" tab
   - Click latest deployment
   - Watch the logs
   - Look for errors (red text)

3. **Common Build Issues**:

   **Issue 1: Prisma Client Generation Fails**
   ```
   Error: Prisma client generation failed
   ```
   **Solution**: Ensure `DATABASE_URL` is set correctly

   **Issue 2: Missing Dependencies**
   ```
   Module not found: '@prisma/client'
   ```
   **Solution**: Check `package.json` includes all dependencies

   **Issue 3: Python Installation Fails**
   ```
   Python version not found
   ```
   **Solution**: Check `nixpacks.toml` has `python311` in nixPkgs

4. **Wait for Deployment to Complete**
   - Should take 5-10 minutes
   - Status will change to "Active" (green) when done

---

### Step 6: Initialize Database (5 min)

After deployment succeeds, initialize the database:

1. **Run Prisma Migration**
   - Go to service → "Settings" → "Deploy Triggers"
   - Or manually trigger via Railway CLI:

   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Link to project
   railway link

   # Run migration
   railway run npx prisma db push
   ```

2. **Verify Database Tables**
   - Your PostgreSQL should now have all 10 tables
   - You can verify in Railway's PostgreSQL service → "Data" tab

---

### Step 7: Test Deployment (5 min)

1. **Get Your Deployment URL**
   - Go to service → "Settings" → "Domains"
   - Railway provides: `your-app.up.railway.app`
   - Or add custom domain

2. **Test Health Endpoint**
   ```bash
   curl https://your-app.up.railway.app/api/health
   ```

   Expected response:
   ```json
   {
     "success": true,
     "status": "healthy",
     "timestamp": "2025-11-06T...",
     "database": "connected",
     "version": "3.0.0"
   }
   ```

3. **Test API Endpoints**
   ```bash
   # Get properties (should return empty array initially)
   curl https://your-app.up.railway.app/api/properties

   # Get contacts
   curl https://your-app.up.railway.app/api/contacts
   ```

4. **Test in Browser**
   - Open: `https://your-app.up.railway.app/api/health`
   - Should see JSON response

---

## 🔧 TROUBLESHOOTING

### Build Fails

**Problem**: Deployment fails during build

**Solutions**:

1. **Check Logs**:
   - Go to deployment → View logs
   - Look for specific error messages

2. **Common Fixes**:
   - Ensure `DATABASE_URL` is set
   - Ensure all env vars are set
   - Check `nixpacks.toml` syntax
   - Verify branch is correct

3. **Rebuild**:
   - Click "Redeploy" in Railway dashboard

---

### Database Connection Issues

**Problem**: App starts but can't connect to database

**Solutions**:

1. **Check DATABASE_URL**:
   - Go to PostgreSQL service → Variables
   - Copy `DATABASE_URL`
   - Paste into your backend service variables
   - Redeploy

2. **Check Prisma Client**:
   - Ensure `npx prisma generate` ran during build
   - Check build logs for Prisma generation

3. **Run Manual Migration**:
   ```bash
   railway run npx prisma db push
   ```

---

### 503 Service Unavailable

**Problem**: Accessing app returns 503 error

**Solutions**:

1. **Check Service Status**:
   - Is deployment "Active" (green)?
   - If not, check logs for crash

2. **Check Healthcheck**:
   - Healthcheck path should be `/api/health`
   - Timeout should be 100 seconds
   - App must respond to healthcheck within timeout

3. **Check Start Command**:
   - Ensure start command is: `npm run start:production`
   - This should be in `package.json` scripts

---

### Environment Variables Not Working

**Problem**: App can't read environment variables

**Solutions**:

1. **Verify Variables are Set**:
   - Go to service → Variables
   - Check all required variables are present

2. **Redeploy After Adding Variables**:
   - Railway auto-redeploys when you add variables
   - If not, manually trigger redeploy

3. **Check Variable Names**:
   - Must match exactly (case-sensitive)
   - No spaces in names
   - No quotes in values

---

## 📊 POST-DEPLOYMENT

### Monitor Your App

1. **Logs**:
   - Go to service → "Logs" tab
   - Monitor real-time logs
   - Look for errors or warnings

2. **Metrics**:
   - Go to service → "Metrics" tab
   - Monitor CPU, memory, network usage

3. **Alerts**:
   - Set up alerts for downtime
   - Set up alerts for high resource usage

---

### Seed Initial Data (Optional)

If you want to test with sample data:

```bash
# Create seed script (if not exists)
# Then run via Railway CLI

railway run npx tsx database/prisma/seed.ts
```

**Important**: Use ONLY fictional data. Never commit real client data.

---

### Update CORS Origins

After deployment, update CORS to allow your Railway domain:

1. **Get Your Domain**:
   - Example: `https://crm-immobiliare.up.railway.app`

2. **Update CORS_ORIGINS**:
   - Go to service → Variables
   - Find `CORS_ORIGINS`
   - Update to: `https://your-domain.up.railway.app`
   - Save (auto-redeploys)

---

## 🔐 SECURITY CHECKLIST

After deployment:

- [ ] All sensitive env vars set in Railway (not in code)
- [ ] No `.env` files committed to git
- [ ] Database URL is from Railway PostgreSQL (not hardcoded)
- [ ] Google API Key is valid and has quota
- [ ] CORS is set to your domain (not `*`)
- [ ] SESSION_SECRET is random and secure
- [ ] Railway project is private (not public)

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

### If Backend Works

1. **Test All Endpoints**:
   - Use Postman or curl to test all API routes
   - Verify CRUD operations work
   - Check data persistence

2. **Deploy Frontend** (when ready):
   - Frontend will need `NEXT_PUBLIC_API_URL` env var
   - Point it to your Railway backend URL
   - Deploy frontend as separate service or together

3. **Add Custom Domain** (optional):
   - Go to service → Settings → Domains
   - Add your custom domain
   - Update DNS records

---

### If Backend Fails

1. **Check This Deployment Guide Again**
2. **Review Error Logs Carefully**
3. **Verify All Environment Variables**
4. **Ensure Branch is Correct**: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`
5. **Try Rebuilding from Scratch**

---

## 📞 GETTING HELP

### Railway Resources

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app/

### Project Resources

- **Master Plan**: `docs/RAILWAY_DEPLOYMENT_MASTER_PLAN.md`
- **Next Session Guide**: `docs/NEXT_SESSION_GUIDE.md`
- **Database Schema**: `database/prisma/schema.prisma`
- **Backend Code**: `backend/src/`

---

## 🎉 SUCCESS CRITERIA

Deployment is successful when:

- ✅ Railway build completes without errors
- ✅ Service is "Active" (green status)
- ✅ `/api/health` returns 200 OK with JSON
- ✅ PostgreSQL is connected
- ✅ All API endpoints return valid responses
- ✅ No errors in Railway logs
- ✅ Metrics show normal resource usage

---

## 📝 DEPLOYMENT SUMMARY

**What You're Deploying**:
- Backend API (Next.js 14)
- PostgreSQL Database
- 11 API endpoints (CRUD operations)
- Health check endpoint

**What's NOT Yet Deployed**:
- Frontend UI (pending implementation)
- AI Tools (can be added later)
- Scraping services (can be added later)

**This is NORMAL**: You can deploy backend first, then add frontend later!

---

## 🚀 QUICK REFERENCE

**Railway Project Setup**:
```
1. New Project → Deploy from GitHub
2. Select repo + branch (claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4)
3. Add PostgreSQL database
4. Set environment variables
5. Deploy
6. Test /api/health
```

**Required Environment Variables**:
```
DATABASE_URL (auto from PostgreSQL)
GOOGLE_API_KEY (from Google AI Studio)
NODE_ENV=production
PORT=3001
SESSION_SECRET (generate random)
CORS_ORIGINS (your Railway domain)
```

**Test Commands**:
```bash
# Health check
curl https://your-app.railway.app/api/health

# List properties
curl https://your-app.railway.app/api/properties

# List contacts
curl https://your-app.railway.app/api/contacts
```

---

**Good luck with your deployment!** 🚀

If everything works, you'll have a production-ready backend API running on Railway, ready to be connected to your frontend (once implemented).

---

**Document Version**: 1.0
**Created**: 2025-11-06
**Updated**: 2025-11-06
**Branch**: `claude/review-repository-plan-011CUrSGsM7h18Cfim1Z8jr4`
