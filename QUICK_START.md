# ⚡ Quick Start - CRM Immobiliare

**Installation time: 5 minutes** | **Version**: 3.0.0 (Unified Architecture)

## Prerequisites

- **Node.js 18+**: https://nodejs.org
- **Python 3.9+**: https://python.org
- **npm** (included with Node.js)
- **Google AI API Key**: Get one at https://aistudio.google.com/app/apikey

## Installation

```bash
# 1. Clone & setup
git clone <repo-url>
cd cookkie-real-estate-agent

# 2. Run installation script
chmod +x scripts/install.sh
./scripts/install.sh

# 3. Configure API keys
export GOOGLE_API_KEY="your-key-here"  # Get from https://aistudio.google.com/app/apikey
# Also add to frontend/.env.local and ai_tools/.env

# 4. Start services
./scripts/start-all.sh
```

## Access Application

- **Frontend & API**: http://localhost:3000 (unified architecture)
- **AI Tools API**: http://localhost:8000/docs

## First Steps

1. Open http://localhost:3000
2. Use the search bar to test AI: "Mostrami immobili a Milano"
3. Explore dashboard and features

## Project Structure

```
✅ Unified Architecture (port 3000)
├── frontend/         # UI + Backend API (Next.js)
├── ai_tools/         # AI Agents (Python FastAPI)
├── database/         # Shared database (Prisma + SQLite/PostgreSQL)
└── scraping/         # Web scraping (Python)
```

## Configuration

**For Local Development**:
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AI_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_API_KEY=your-key

# ai_tools/.env
GOOGLE_API_KEY=your-key
DATABASE_URL=sqlite:///../database/prisma/dev.db
```

**For Docker/Production**: See `.env.example` in root

## Need More Details?

Full documentation: [`CLAUDE.md`](CLAUDE.md) (source of truth)
- Complete architecture overview
- Module-specific setup
- Security rules
- Development workflow

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| GOOGLE_API_KEY not set | Add key to `.env` files and restart |
| Database error | Run `npm run prisma:push` in frontend |
| Python dependencies fail | Update pip: `python3 -m pip install --upgrade pip` |

## Support

- Issues: Check GitHub Issues
- Docs: See `/docs` folder
- Architecture: Read `CLAUDE.md`

---

**Ready?** Run `./scripts/start-all.sh` and open http://localhost:3000 🚀
