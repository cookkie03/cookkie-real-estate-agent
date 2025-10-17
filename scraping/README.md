# 🕷️ Web Scraping Module - CRM Immobiliare

## Overview

Modulo Python standalone per web scraping automatizzato di portali immobiliari italiani e fonti catastali.

Sistema modulare con scraper specializzati, cache intelligente, rate limiting e gestione errori.

## Stack Tecnologico

- **HTTP Client**: httpx (async)
- **Parsing**: BeautifulSoup4, lxml, parsel
- **Browser Automation**: Playwright (se necessario)
- **Scheduling**: APScheduler
- **Database**: SQLAlchemy + SQLite
- **Cache**: File-based cache (JSON)

## Struttura

```
scraping/
├── portals/                 # 🏘️ Scraper Portali Immobiliari
│   ├── __init__.py
│   ├── base_scraper.py      # Base class per scraper
│   ├── immobiliare_it.py    # Immobiliare.it
│   ├── casa_it.py           # Casa.it
│   └── idealista_it.py      # Idealista.it
│
├── cadastre/                # 📋 Scraping Dati Catastali
│   ├── __init__.py
│   ├── sister.py            # AgenziaEntrate SISTER
│   └── opendata.py          # Open data catastali
│
├── common/                  # 🛠️ Utilities Condivise
│   ├── __init__.py
│   ├── parser.py            # Parsing utilities
│   ├── cache.py             # Cache manager
│   ├── rate_limiter.py      # Rate limiting
│   ├── proxy.py             # Proxy rotation
│   └── validators.py        # Data validation
│
├── .cache/                  # 🗂️ Cache (git-ignored)
│   ├── immobiliare_it/
│   ├── casa_it/
│   └── idealista_it/
│
├── config.py                # Configuration
├── scheduler.py             # Scheduler automatico
├── cli.py                   # CLI interface
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

## Quick Start

### Installazione

```bash
cd scraping

# Virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# o
.venv\Scripts\activate     # Windows

# Installa dipendenze
pip install -r requirements.txt

# Per browser automation (opzionale)
playwright install chromium
```

### Uso Base

```bash
# Scraping singolo portale
python cli.py scrape --portal immobiliare_it --city Corbetta

# Scraping multiplo
python cli.py scrape --portal all --city "Corbetta,Magenta,Milano"

# Con filtri
python cli.py scrape \
  --portal casa_it \
  --city Milano \
  --min-price 100000 \
  --max-price 300000 \
  --property-type apartment

# Scheduler (esecuzione automatica)
python cli.py schedule --interval daily --time "06:00"
```

### Da Python

```python
from scraping.portals.immobiliare_it import ImmobiliareItScraper

scraper = ImmobiliareItScraper()

# Scrape listings
listings = scraper.scrape_city(
    city="Corbetta",
    province="Milano",
    contract_type="sale"
)

# Salva nel database
for listing in listings:
    scraper.save_to_database(listing)
```

## Scraper Disponibili

### 1. Immobiliare.it

**Website**: https://www.immobiliare.it
**Status**: ✅ Implementato

**Features:**
- Search by city/zone
- Property details scraping
- Images download
- Contact info extraction
- Price history tracking

**Rate Limit**: 1 req/sec (safe)

**Example:**
```python
from scraping.portals.immobiliare_it import ImmobiliareItScraper

scraper = ImmobiliareItScraper()
listings = scraper.scrape_search(
    query="Corbetta",
    contract="vendita",
    property_type="appartamenti",
    max_pages=10
)
```

### 2. Casa.it

**Website**: https://www.casa.it
**Status**: ✅ Implementato

**Features:**
- Advanced search filters
- Agent/agency extraction
- Property specifications
- Virtual tour detection

**Rate Limit**: 1 req/sec

**Example:**
```python
from scraping.portals.casa_it import CasaItScraper

scraper = CasaItScraper()
listings = scraper.scrape_zone(
    city="Milano",
    zone="Sempione",
    min_price=200000,
    max_price=500000
)
```

### 3. Idealista.it

**Website**: https://www.idealista.it
**Status**: ✅ Implementato

**Features:**
- Geocoded results
- Price trends
- Neighborhood info
- Energy class

**Rate Limit**: 1 req/sec

**Example:**
```python
from scraping.portals.idealista_it import IdealistaItScraper

scraper = IdealistaItScraper()
listings = scraper.scrape_coordinates(
    lat=45.464,
    lon=9.190,
    radius_km=5
)
```

## Base Scraper

Tutti gli scraper ereditano da `BaseScraper`:

```python
from scraping.common.base_scraper import BaseScraper

class MyPortalScraper(BaseScraper):
    portal_name = "myportal"
    base_url = "https://myportal.it"
    rate_limit = 1.0  # req/sec

    def scrape_search(self, query: str, **kwargs):
        # Implementation
        pass

    def parse_listing(self, html: str):
        # Parsing logic
        return {
            "title": "...",
            "price": 200000,
            "city": "...",
            # ...
        }

    def save_to_database(self, listing: dict):
        # Save to DB
        pass
```

## Cache System

Il modulo usa cache intelligente per:
- Evitare re-scraping di pagine già viste
- Rispettare robots.txt
- Ridurre carico sui server

```python
from scraping.common.cache import Cache

cache = Cache(portal="immobiliare_it")

# Check cache
if cache.exists(url):
    data = cache.get(url)
else:
    data = scraper.fetch(url)
    cache.set(url, data, ttl=86400)  # 24h
```

**Cache Location**: `scraping/.cache/`
**TTL Default**: 24 ore
**Git**: Ignored

## Rate Limiting

Tutti gli scraper rispettano rate limits:

```python
from scraping.common.rate_limiter import RateLimiter

limiter = RateLimiter(requests_per_second=1.0)

for url in urls:
    limiter.wait()  # Aspetta se necessario
    response = scraper.fetch(url)
```

**Best Practices:**
- Immobiliare.it: 1 req/sec
- Casa.it: 1 req/sec
- Idealista.it: 1 req/sec
- Intervallo tra pagine: 2-3 sec

## Proxy Support

Per evitare IP blocking:

```python
from scraping.common.proxy import ProxyRotator

rotator = ProxyRotator([
    "http://proxy1.example.com:8080",
    "http://proxy2.example.com:8080"
])

scraper = ImmobiliareItScraper(proxy_rotator=rotator)
```

## Error Handling

```python
from scraping.common.exceptions import (
    ScrapingError,
    RateLimitError,
    ParsingError,
    NetworkError
)

try:
    listings = scraper.scrape_city("Milano")
except RateLimitError:
    logger.warning("Rate limit reached, retrying later")
    time.sleep(60)
except ParsingError as e:
    logger.error(f"Failed to parse: {e}")
except NetworkError:
    logger.error("Network error, check connection")
```

## Data Validation

```python
from scraping.common.validators import validate_listing

listing = {
    "title": "Appartamento Milano",
    "price": 250000,
    "sqm": 80,
    "rooms": 3
}

# Validate
is_valid, errors = validate_listing(listing)

if not is_valid:
    logger.warning(f"Invalid listing: {errors}")
```

**Validations:**
- Required fields present
- Price > 0
- Surface > 0
- Valid coordinates
- Valid URLs

## Database Integration

```python
from database.python.models import Property
from sqlalchemy.orm import Session

def save_listing_to_db(listing: dict, session: Session):
    property = Property(
        code=generate_code("PROP"),
        source="web_scraping",
        sourceUrl=listing["url"],
        title=listing["title"],
        priceSale=listing["price"],
        city=listing["city"],
        street=listing["address"],
        sqmCommercial=listing["sqm"],
        rooms=listing["rooms"],
        latitude=listing["lat"],
        longitude=listing["lon"],
        status="draft",
        verified=False
    )

    session.add(property)
    session.commit()
```

## Scheduling

### Manual Scheduling

```bash
# Ogni giorno alle 6:00
python cli.py schedule --interval daily --time "06:00"

# Ogni settimana (lunedì)
python cli.py schedule --interval weekly --day monday --time "09:00"

# Una volta al mese
python cli.py schedule --interval monthly --day 1 --time "08:00"
```

### Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add line (daily at 6 AM)
0 6 * * * cd /path/to/scraping && python cli.py scrape --portal all
```

### Task Scheduler (Windows)

```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "python" -Argument "cli.py scrape --portal all" -WorkingDirectory "C:\path\to\scraping"
$trigger = New-ScheduledTaskTrigger -Daily -At "06:00"
Register-ScheduledTask -TaskName "CRM Scraping" -Action $action -Trigger $trigger
```

## Configuration

### Environment Variables

```bash
# Proxy (opzionale)
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080

# User Agent
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Database
DATABASE_URL=sqlite:///../database/prisma/dev.db

# Cache
CACHE_DIR=.cache
CACHE_TTL=86400  # 24 hours

# Rate Limiting
RATE_LIMIT_RPS=1.0  # requests per second

# Retry
MAX_RETRIES=3
RETRY_DELAY=5  # seconds

# Logging
LOG_LEVEL=INFO
LOG_FILE=../logs/scraping/scraper.log
```

### Config File

```python
# config.py
from pydantic_settings import BaseSettings

class ScrapingSettings(BaseSettings):
    database_url: str = "sqlite:///../database/prisma/dev.db"
    cache_dir: str = ".cache"
    cache_ttl: int = 86400
    rate_limit_rps: float = 1.0
    max_retries: int = 3
    user_agent: str = "Mozilla/5.0 ..."

    class Config:
        env_file = "../config/.env"

settings = ScrapingSettings()
```

## CLI Commands

```bash
# Scrape single portal
python cli.py scrape \
  --portal immobiliare_it \
  --city Corbetta \
  --contract sale \
  --property-type apartment

# Scrape all portals
python cli.py scrape --portal all --city Milano

# List cached data
python cli.py cache list

# Clear cache
python cli.py cache clear --portal immobiliare_it

# Stats
python cli.py stats --portal all --date today

# Export results
python cli.py export --format json --output results.json
```

## Monitoring

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# Log scraping activity
logger.info(f"Scraped {len(listings)} listings from {portal}")
logger.warning(f"Rate limit approaching for {portal}")
logger.error(f"Failed to scrape {url}: {error}")
```

Log files: `../logs/scraping/`

### Metrics

```python
from scraping.common.metrics import ScrapingMetrics

metrics = ScrapingMetrics()

# Track scraping
metrics.increment("listings_scraped", portal="immobiliare_it")
metrics.gauge("scraping_duration_seconds", 45.2)
metrics.histogram("listings_per_page", 20)

# Get stats
stats = metrics.get_stats(portal="all", date="today")
print(f"Total scraped: {stats['total_listings']}")
```

## Best Practices

### 1. Rispetta robots.txt

```python
from scraping.common.robots import RobotsTxtParser

parser = RobotsTxtParser("https://www.immobiliare.it/robots.txt")

if parser.can_fetch("/search?q=Milano"):
    # OK to scrape
    pass
```

### 2. User Agent Rotation

```python
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...",
    "Mozilla/5.0 (X11; Linux x86_64) ..."
]

scraper = ImmobiliareItScraper(user_agent=random.choice(USER_AGENTS))
```

### 3. Error Recovery

```python
def scrape_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            return scraper.fetch(url)
        except NetworkError:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise
```

### 4. Data Deduplication

```python
def deduplicate_listings(listings):
    seen = set()
    unique = []

    for listing in listings:
        key = (listing["title"], listing["city"], listing["price"])
        if key not in seen:
            seen.add(key)
            unique.append(listing)

    return unique
```

## Legal & Ethics

⚠️ **IMPORTANTE**:

1. **Rispetta robots.txt** - Non scrappare se vietato
2. **Rate limiting** - Non sovraccaricare i server
3. **User identification** - Usa User-Agent appropriato
4. **Dati pubblici only** - Non scrappare dati privati
5. **Copyright** - Rispetta copyright di testi/immagini
6. **Terms of Service** - Leggi e rispetta ToS dei portali

## Troubleshooting

### "Blocked by server"

```bash
# Riduci rate limit
export RATE_LIMIT_RPS=0.5

# Usa proxy
export HTTP_PROXY=http://your-proxy.com:8080

# Cambia User Agent
export USER_AGENT="..."
```

### "Parsing failed"

```bash
# Verifica HTML structure
python cli.py debug --url "https://..."

# Update parser
# Controlla selettori CSS/XPath nel codice
```

### "Cache full"

```bash
# Clear cache
python cli.py cache clear --all

# Riduce TTL
export CACHE_TTL=3600  # 1 hour
```

## Resources

- [BeautifulSoup Docs](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [httpx Docs](https://www.python-httpx.org/)
- [Playwright Docs](https://playwright.dev/python/)
- [Scrapy Best Practices](https://docs.scrapy.org/en/latest/topics/practices.html)
