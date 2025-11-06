# 🚀 Piano Completo Integrazione Sistema Scraping Intelligente
**CRM Immobiliare - Real Estate Web Scraping with AI**

**Data Creazione**: 2025-11-05
**Versione**: 1.0.0
**Repository**: cookkie-real-estate-agent v3.0.0
**Target Deployment**: Railway.com (PostgreSQL)

---

## 📋 EXECUTIVE SUMMARY

Questo piano integra un sistema di **scraping intelligente con AI** nella tua architettura modulare esistente, usando:
- **Playwright + Chromium** per browser automation reale
- **Datapizza AI** (già integrato) per semantic understanding
- **PostgreSQL** su Railway.com per produzione
- **Architettura modulare** che rispetta i confini esistenti

**Obiettivo**: Estrarre dati continuativi da portali immobiliari (Immobiliare.it, Casa.it, Idealista.it) con accuratezza 100% e bypass anti-bot.

---

## 🏗️ ARCHITETTURA INTEGRATA

### Stack Tecnologico Finale

```
┌─────────────────────────────────────────────────────────────┐
│                    SCRAPING SYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│  Browser Automation:  Playwright + Chromium (headless)      │
│  Anti-Detection:      playwright-stealth + residential proxy │
│  AI Reasoning:        Datapizza AI + Google Gemini 1.5 Pro  │
│  Database:            PostgreSQL (Railway) + SQLAlchemy     │
│  Task Queue:          Celery + Redis                        │
│  API:                 FastAPI (ai_tools module)             │
│  Frontend:            Next.js 14 (frontend module)          │
└─────────────────────────────────────────────────────────────┘
```

### Moduli Coinvolti

| Modulo | Ruolo | Modifiche |
|--------|-------|-----------|
| **scraping/** | Core scraping engine | ✅ Implementare scrapers con Playwright |
| **ai_tools/** | AI semantic extraction | ⚠️ Aggiungere tools per scraping AI |
| **database/** | Data storage | ⚠️ Migrare a PostgreSQL, aggiungere scraping tables |
| **backend/** | API proxy | ⚠️ Aggiungere endpoints scraping |
| **frontend/** | UI management | ⚠️ Aggiungere dashboard scraping |
| **config/** | Railway deployment | ❌ Creare railway.json + Procfile |

---

## 🎯 SITUAZIONE DI PARTENZA

### Infrastruttura Esistente (dalla repository)

✅ **Già Pronto:**
- Modulo `/scraping` con base_scraper.py (httpx + BeautifulSoup)
- Cache system (JSON file-based con TTL)
- Rate limiter (token bucket algorithm)
- Datapizza AI integrato in `/ai_tools`
- FastAPI server (porta 8000)
- Database models SQLAlchemy completi (417 linee)
- Docker Compose funzionante

❌ **Mancante (BLOCCANTI):**
- `database/prisma/schema.prisma` file (blocca Next.js builds)
- Playwright browser automation
- Implementazioni concrete scrapers (immobiliare_it.py, casa_it.py, idealista_it.py)
- PostgreSQL configuration per Railway
- Railway deployment files (railway.json, Procfile)
- Database tables per scraping jobs
- API endpoints per scraping management
- Frontend UI per scraping dashboard

⚠️ **Parziale:**
- AI Tools (70% completo, mancano alcuni tools)
- Database integration negli scrapers (TODO nel codice)

---

## 🚀 MACRO-FASI DI SVILUPPO

### FASE 0: PREREQUISITI CRITICI (Giorno 1) ⚠️

**Obiettivo**: Risolvere blockers che impediscono sviluppo

#### 0.1 Creare Prisma Schema
```bash
# CRITICO: Convertire SQLAlchemy models → Prisma schema
cd database/prisma
# Creare schema.prisma da database/python/models.py
npx prisma generate
npx prisma db push
```

**Output**: `database/prisma/schema.prisma` esistente, Prisma Client generato

#### 0.2 Estendere Database Schema per Scraping

**Nuove Tabelle (PostgreSQL-ready):**

```prisma
// database/prisma/schema.prisma (AGGIUNGERE)

model ScrapingJob {
  id                  String    @id @default(cuid())
  siteUrl             String
  siteName            String    // immobiliare_it, casa_it, idealista_it
  siteType            String    // portal, crm, catasto, generic

  // Configuration
  searchConfig        Json      // Search parameters
  extractionConfig    Json      // What data to extract
  scheduleConfig      Json      // Cron schedule

  // Credentials (encrypted)
  credentialsEncrypted String?

  // Browser Profile
  browserProfile      Json?     // User agent, fingerprint, cookies
  proxyConfig         Json?     // Proxy settings

  // Status
  status              String    @default("active") // active, paused, failed
  lastRunAt           DateTime?
  nextRunAt           DateTime?
  lastSuccess         DateTime?
  successCount        Int       @default(0)
  failureCount        Int       @default(0)

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relations
  extractions         ScrapedData[]
  sessions            ScrapingSession[]

  @@index([status, nextRunAt])
  @@index([siteName])
}

model ScrapedData {
  id                  String    @id @default(cuid())
  jobId               String
  job                 ScrapingJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  // Source
  sourceUrl           String
  contentHash         String    @unique // Dedup

  // Data
  dataType            String    // property, contact, document
  rawData             Json      // Raw extracted data
  processedData       Json?     // After AI processing

  // Quality
  confidenceScore     Float?    // AI confidence (0-1)
  validationStatus    String    @default("pending") // pending, valid, invalid
  validationErrors    Json?

  // Media
  images              Json?     // Array of image URLs
  documents           Json?     // Array of document paths

  extractedAt         DateTime  @default(now())

  @@index([jobId, extractedAt])
  @@index([contentHash])
  @@index([dataType])
}

model ScrapingSession {
  id                  String    @id @default(cuid())
  jobId               String
  job                 ScrapingJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  // Session Data
  cookies             Json      // Browser cookies
  localStorage        Json?     // Browser localStorage
  sessionData         Json?     // Custom session data

  // Browser Fingerprint
  userAgent           String
  viewport            Json?     // Width, height

  // Status
  isValid             Boolean   @default(true)
  lastUsedAt          DateTime  @default(now())
  expiresAt           DateTime?

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([jobId, isValid])
}
```

**Migration SQL (PostgreSQL):**
```sql
-- Generate with: npx prisma migrate dev --name add_scraping_tables
```

**Output**: Database schema esteso, pronto per scraping data

---

### FASE 1: SETUP BROWSER AUTOMATION (Settimana 1)

**Obiettivo**: Integrare Playwright per browser automation reale

#### 1.1 Installare Playwright + Dependencies

```bash
cd /home/user/cookkie-real-estate-agent/scraping

# Update requirements.txt
cat >> requirements.txt << EOF

# Browser Automation
playwright==1.47.0
playwright-stealth==1.0.3

# AI Integration (if not already there)
datapizza-ai==0.0.2
datapizza-ai-clients-google==0.0.2
google-generativeai>=0.8.3

# Enhanced parsing
lxml>=5.3.0
pillow>=10.4.0  # Image processing

# Async support
asyncio>=3.4.3
aiofiles>=24.1.0
EOF

# Install
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
playwright install-deps  # System dependencies
```

**Output**: Playwright installato, Chromium browser disponibile

#### 1.2 Creare Browser Manager

```python
# scraping/common/browser_manager.py

"""
Browser Manager - Playwright wrapper with anti-detection
"""

import asyncio
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from playwright_stealth import stealth_async
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)


class BrowserManager:
    """
    Manages Playwright browser instances with stealth mode
    """

    def __init__(
        self,
        headless: bool = True,
        proxy: Optional[Dict] = None,
        user_agent: Optional[str] = None,
    ):
        self.headless = headless
        self.proxy = proxy
        self.user_agent = user_agent or self._default_user_agent()

        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None

    def _default_user_agent(self) -> str:
        """Generate realistic user agent"""
        return (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )

    async def start(self):
        """Initialize Playwright and browser"""
        self.playwright = await async_playwright().start()

        # Launch browser
        launch_options = {
            "headless": self.headless,
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
            ],
        }

        if self.proxy:
            launch_options["proxy"] = self.proxy

        self.browser = await self.playwright.chromium.launch(**launch_options)

        # Create context
        context_options = {
            "viewport": {"width": 1920, "height": 1080},
            "user_agent": self.user_agent,
            "locale": "it-IT",
            "timezone_id": "Europe/Rome",
        }

        self.context = await self.browser.new_context(**context_options)

        logger.info("Browser initialized with stealth mode")

    async def new_page(self) -> Page:
        """Create new page with stealth"""
        if not self.context:
            await self.start()

        page = await self.context.new_page()

        # Apply stealth
        await stealth_async(page)

        return page

    async def close(self):
        """Close browser"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

        logger.info("Browser closed")

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
```

**Output**: Browser manager con anti-detection pronto

#### 1.3 Aggiornare Base Scraper con Playwright

```python
# scraping/portals/base_scraper.py (MODIFICARE)

"""
Base Scraper Class - Playwright + AI Integration
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime

from ..common.browser_manager import BrowserManager
from ..common.cache import Cache
from ..common.rate_limiter import RateLimiter
from ..config import settings

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """
    Base class for all scrapers with Playwright support
    """

    portal_name: str = "base"
    base_url: str = ""
    rate_limit: float = 1.0  # requests per second

    def __init__(
        self,
        cache_enabled: bool = True,
        rate_limit_enabled: bool = True,
        headless: bool = True,
        proxy: Optional[Dict] = None,
    ):
        self.cache_enabled = cache_enabled
        self.rate_limit_enabled = rate_limit_enabled

        # Browser manager
        self.browser = BrowserManager(
            headless=headless,
            proxy=proxy,
        )

        # Cache
        if self.cache_enabled:
            self.cache = Cache(portal=self.portal_name)

        # Rate limiter
        if self.rate_limit_enabled:
            self.rate_limiter = RateLimiter(requests_per_second=self.rate_limit)

        logger.info(f"Initialized {self.portal_name} scraper with Playwright")

    async def fetch_page(self, url: str, use_cache: bool = True) -> str:
        """
        Fetch page with Playwright

        Args:
            url: URL to fetch
            use_cache: Whether to use cache

        Returns:
            HTML content
        """
        # Check cache
        if use_cache and self.cache_enabled:
            cached = self.cache.get(url)
            if cached:
                logger.debug(f"Cache hit for {url}")
                return cached

        # Rate limiting
        if self.rate_limit_enabled:
            self.rate_limiter.wait()

        # Fetch with Playwright
        logger.info(f"Fetching {url} with Playwright")

        try:
            page = await self.browser.new_page()

            # Navigate
            await page.goto(url, wait_until="networkidle", timeout=30000)

            # Wait for content (can be overridden)
            await self.wait_for_content(page)

            # Get HTML
            html = await page.content()

            # Close page
            await page.close()

            # Cache result
            if use_cache and self.cache_enabled:
                self.cache.set(url, html)

            return html

        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            raise

    async def wait_for_content(self, page):
        """
        Wait for page content to load
        Override in subclass for specific selectors
        """
        await asyncio.sleep(2)  # Default wait

    @abstractmethod
    async def scrape_search(self, **kwargs) -> List[Dict]:
        """
        Scrape search results
        Must be implemented by subclass
        """
        pass

    @abstractmethod
    async def parse_listing(self, html: str, url: str) -> Dict:
        """
        Parse single listing page
        Must be implemented by subclass
        """
        pass

    def save_to_database(self, listing: Dict):
        """
        Save listing to database
        Override in subclass for custom logic
        """
        # TODO: Implement database save
        logger.info(f"Saving listing: {listing.get('title', 'Untitled')}")

    async def close(self):
        """Close browser"""
        await self.browser.close()
        logger.info(f"Closed {self.portal_name} scraper")

    async def __aenter__(self):
        await self.browser.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
```

**Output**: Base scraper aggiornato con Playwright

---

### FASE 2: IMPLEMENTARE SCRAPER IMMOBILIARE.IT (Settimana 2)

**Obiettivo**: Scraper completo per Immobiliare.it con AI

#### 2.1 Implementare Scraper Immobiliare.it

```python
# scraping/portals/immobiliare_it.py (CREARE)

"""
Immobiliare.it Scraper
React SPA with advanced anti-bot protection
"""

import asyncio
import json
import re
from typing import List, Dict, Optional
from datetime import datetime
from bs4 import BeautifulSoup
import logging

from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class ImmobiliareItScraper(BaseScraper):
    """
    Scraper for Immobiliare.it
    Handles React SPA and anti-detection
    """

    portal_name = "immobiliare_it"
    base_url = "https://www.immobiliare.it"
    rate_limit = 0.5  # 2 requests per second max

    async def wait_for_content(self, page):
        """Wait for React content to render"""
        try:
            # Wait for listing cards
            await page.wait_for_selector(
                "[class*='nd-list__item']",
                timeout=10000,
                state="visible"
            )
            # Additional wait for JS
            await asyncio.sleep(1)
        except Exception as e:
            logger.warning(f"Content wait timeout: {e}")

    async def scrape_search(
        self,
        location: str,
        contract_type: str = "vendita",  # vendita, affitto
        property_type: Optional[str] = None,  # appartamento, casa, etc
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        rooms_min: Optional[int] = None,
        max_pages: int = 3,
    ) -> List[Dict]:
        """
        Scrape search results from Immobiliare.it

        Args:
            location: City name (e.g., "roma", "milano")
            contract_type: "vendita" or "affitto"
            property_type: Property type filter
            price_min: Minimum price
            price_max: Maximum price
            rooms_min: Minimum rooms
            max_pages: Max pages to scrape

        Returns:
            List of listing dictionaries
        """
        all_listings = []

        for page_num in range(1, max_pages + 1):
            # Build URL
            url = self._build_search_url(
                location=location,
                contract_type=contract_type,
                property_type=property_type,
                price_min=price_min,
                price_max=price_max,
                rooms_min=rooms_min,
                page=page_num,
            )

            logger.info(f"Scraping page {page_num}: {url}")

            # Fetch page
            html = await self.fetch_page(url)

            # Parse listings
            listings = self._parse_search_page(html, url)

            logger.info(f"Found {len(listings)} listings on page {page_num}")

            all_listings.extend(listings)

            # Check if last page
            if len(listings) == 0:
                break

        return all_listings

    def _build_search_url(
        self,
        location: str,
        contract_type: str,
        property_type: Optional[str],
        price_min: Optional[float],
        price_max: Optional[float],
        rooms_min: Optional[int],
        page: int,
    ) -> str:
        """Build search URL with filters"""

        # Base path
        path = f"/{contract_type}-case/{location}/"

        # Query params
        params = []

        if property_type:
            params.append(f"tipoImmobile={property_type}")

        if price_min:
            params.append(f"prezzoMinimo={int(price_min)}")

        if price_max:
            params.append(f"prezzoMassimo={int(price_max)}")

        if rooms_min:
            params.append(f"localiMinimo={rooms_min}")

        if page > 1:
            params.append(f"pag={page}")

        query = "?" + "&".join(params) if params else ""

        return self.base_url + path + query

    def _parse_search_page(self, html: str, url: str) -> List[Dict]:
        """Parse search results page"""
        soup = BeautifulSoup(html, "lxml")
        listings = []

        # Find all listing cards
        cards = soup.find_all("div", class_=re.compile(r"nd-list__item"))

        for card in cards:
            try:
                listing = self._parse_listing_card(card)
                if listing:
                    listing["source_url_search"] = url
                    listings.append(listing)
            except Exception as e:
                logger.error(f"Error parsing card: {e}")
                continue

        return listings

    def _parse_listing_card(self, card) -> Optional[Dict]:
        """Parse single listing card from search results"""
        try:
            # Link
            link_elem = card.find("a", class_=re.compile(r"nd-link"))
            if not link_elem:
                return None

            listing_url = link_elem.get("href")
            if listing_url and not listing_url.startswith("http"):
                listing_url = self.base_url + listing_url

            # Title
            title_elem = card.find("a", class_=re.compile(r"nd-link.*title"))
            title = title_elem.text.strip() if title_elem else None

            # Price
            price_elem = card.find("li", class_=re.compile(r"nd-list__item.*price"))
            price_text = price_elem.text.strip() if price_elem else None
            price = self._parse_price(price_text)

            # Location
            location_elem = card.find("div", class_=re.compile(r"nd-list__item.*location"))
            location = location_elem.text.strip() if location_elem else None

            # Features (sqm, rooms, bathrooms)
            features = self._parse_features(card)

            # Image
            img_elem = card.find("img")
            image_url = img_elem.get("src") if img_elem else None

            return {
                "source": "immobiliare_it",
                "source_url": listing_url,
                "title": title,
                "price": price,
                "location": location,
                **features,
                "image_url": image_url,
                "scraped_at": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error parsing card: {e}")
            return None

    def _parse_price(self, price_text: Optional[str]) -> Optional[float]:
        """Extract numeric price from text"""
        if not price_text:
            return None

        # Remove €, spaces, dots (thousands separator)
        price_text = price_text.replace("€", "").replace(" ", "").replace(".", "")

        # Extract numbers
        match = re.search(r"(\d+)", price_text)
        if match:
            return float(match.group(1))

        return None

    def _parse_features(self, card) -> Dict:
        """Parse property features from card"""
        features = {
            "sqm": None,
            "rooms": None,
            "bathrooms": None,
        }

        # Find feature list
        feature_list = card.find("ul", class_=re.compile(r"nd-list.*features"))
        if not feature_list:
            return features

        items = feature_list.find_all("li")

        for item in items:
            text = item.text.strip().lower()

            # SQM
            if "m²" in text or "mq" in text:
                match = re.search(r"(\d+)", text)
                if match:
                    features["sqm"] = int(match.group(1))

            # Rooms
            elif "local" in text or "vani" in text:
                match = re.search(r"(\d+)", text)
                if match:
                    features["rooms"] = int(match.group(1))

            # Bathrooms
            elif "bagn" in text:
                match = re.search(r"(\d+)", text)
                if match:
                    features["bathrooms"] = int(match.group(1))

        return features

    async def parse_listing(self, html: str, url: str) -> Dict:
        """
        Parse detailed listing page
        """
        soup = BeautifulSoup(html, "lxml")

        # TODO: Implement detailed page parsing
        # This would extract full property details

        return {
            "source_url": url,
            "scraped_at": datetime.utcnow().isoformat(),
        }

    async def scrape_listing_details(self, listing_url: str) -> Dict:
        """
        Scrape detailed listing page
        """
        html = await self.fetch_page(listing_url)
        return await self.parse_listing(html, listing_url)


# Example usage
async def main():
    async with ImmobiliareItScraper() as scraper:
        listings = await scraper.scrape_search(
            location="roma",
            contract_type="vendita",
            price_max=500000,
            rooms_min=2,
            max_pages=2,
        )

        print(f"Found {len(listings)} listings")
        for listing in listings[:3]:
            print(json.dumps(listing, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
```

**Output**: Scraper Immobiliare.it funzionante con Playwright

#### 2.2 Integrare Datapizza AI per Semantic Extraction

```python
# scraping/ai/semantic_extractor.py (CREARE)

"""
AI-Powered Semantic Data Extraction
Uses Datapizza AI to understand and extract data from scraped pages
"""

import os
from typing import Dict, List, Optional
from datapizza.ai import Agent, Tool
from datapizza.clients.google import GoogleClient
import logging

logger = logging.getLogger(__name__)


class SemanticExtractor:
    """
    Uses Datapizza AI to semantically understand and extract data
    """

    def __init__(self):
        # Initialize Google AI client
        self.client = GoogleClient(
            api_key=os.getenv("GOOGLE_API_KEY"),
            model="gemini-1.5-pro",
        )

        # Create extraction agent
        self.agent = Agent(
            name="property_extractor",
            client=self.client,
            instructions="""
            You are an expert real estate data extractor.
            Extract structured property information from HTML/text.

            Always extract:
            - Title
            - Price (numeric only, no currency symbols)
            - Location (city, zone, address if available)
            - Property type (appartamento, casa, villa, etc)
            - Square meters
            - Number of rooms
            - Number of bathrooms
            - Features (elevator, parking, garden, etc)
            - Condition
            - Energy class
            - Description

            Return valid JSON only.
            If a field is not found, use null.
            Be precise and accurate.
            """,
        )

    async def extract_property_data(
        self,
        html: str,
        url: str,
        context: Optional[str] = None,
    ) -> Dict:
        """
        Extract structured property data from HTML using AI

        Args:
            html: HTML content
            url: Source URL
            context: Additional context for extraction

        Returns:
            Structured property data dictionary
        """
        try:
            # Truncate HTML if too long (token limit)
            max_length = 30000
            if len(html) > max_length:
                html = html[:max_length] + "..."

            # Build prompt
            prompt = f"""
            Extract property data from this HTML:

            Source URL: {url}
            {f'Context: {context}' if context else ''}

            HTML:
            {html}

            Return JSON with property details.
            """

            # Call AI agent
            response = await self.agent.run(prompt)

            # Parse response (should be JSON)
            data = response.get("output", {})

            # Add metadata
            data["source_url"] = url
            data["extraction_method"] = "ai_semantic"
            data["confidence_score"] = response.get("confidence", 1.0)

            return data

        except Exception as e:
            logger.error(f"AI extraction failed: {e}")
            return {
                "error": str(e),
                "source_url": url,
            }

    async def validate_extracted_data(self, data: Dict) -> Dict:
        """
        Validate extracted data using AI
        """
        try:
            prompt = f"""
            Validate this real estate data for completeness and accuracy:

            {data}

            Check:
            1. Required fields present (title, price, location)
            2. Data types correct (price is number, etc)
            3. Values realistic (price > 0, sqm > 0, etc)
            4. No obvious errors or inconsistencies

            Return JSON:
            {{
                "is_valid": true/false,
                "errors": ["error1", "error2"],
                "warnings": ["warning1"],
                "confidence_score": 0.0-1.0
            }}
            """

            response = await self.agent.run(prompt)
            return response.get("output", {})

        except Exception as e:
            logger.error(f"Validation failed: {e}")
            return {
                "is_valid": False,
                "errors": [str(e)],
            }
```

**Output**: AI semantic extractor integrato con Datapizza AI

---

### FASE 3: DATABASE INTEGRATION (Settimana 2-3)

**Obiettivo**: Salvare dati scraped in PostgreSQL

#### 3.1 Configurare PostgreSQL per Railway

**Railway Setup:**

1. **Creare `railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install:all && npm run build:all"
  },
  "deploy": {
    "startCommand": "npm run start:all",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

2. **Creare `Procfile`:**
```
web: cd backend && npm run start
ai: cd ai_tools && python main.py
worker: cd ai_tools && celery -A app.tasks worker --loglevel=info
```

3. **Creare `nixpacks.toml`:**
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "python311", "postgresql"]

[phases.install]
cmds = [
  "npm run install:all",
  "cd ai_tools && pip install -r requirements.txt",
  "playwright install chromium"
]

[phases.build]
cmds = ["npm run build:all"]

[start]
cmd = "npm run start:all"
```

4. **Environment Variables su Railway:**
```bash
# PostgreSQL (auto-provided by Railway)
DATABASE_URL=${{ POSTGRES.DATABASE_URL }}

# Google AI
GOOGLE_API_KEY=your_key

# Settings
NODE_ENV=production
PYTHON_ENV=production

# Ports
PORT=3000
AI_TOOLS_PORT=8000
```

**Output**: Railway deployment configurato

#### 3.2 Migrare Database a PostgreSQL

```bash
# 1. Update Prisma schema per PostgreSQL
# database/prisma/schema.prisma

datasource db {
  provider = "postgresql"  # Changed from sqlite
  url      = env("DATABASE_URL")
}

# 2. Generate migration
cd database/prisma
npx prisma migrate dev --name init_postgresql

# 3. Push to Railway
npx prisma migrate deploy
```

#### 3.3 Implementare Database Save

```python
# scraping/database/scraping_repository.py (CREARE)

"""
Repository for scraping data persistence
"""

from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Dict, Optional
from datetime import datetime
import hashlib
import json
import logging

from database.python.database import get_db_context
from database.python.models import Property, Contact

logger = logging.getLogger(__name__)


class ScrapingRepository:
    """
    Handles saving scraped data to database
    """

    def __init__(self):
        pass

    def save_property(self, data: Dict, source: str) -> Optional[str]:
        """
        Save scraped property to database

        Args:
            data: Property data dictionary
            source: Source portal name

        Returns:
            Property ID if saved, None if error
        """
        with get_db_context() as db:
            try:
                # Generate unique code
                code = self._generate_property_code(data, source)

                # Check if exists (dedup by content hash)
                content_hash = self._compute_content_hash(data)

                existing = db.query(Property).filter(
                    Property.source == source,
                    Property.sourceUrl == data.get("source_url")
                ).first()

                if existing:
                    logger.info(f"Property already exists: {code}")
                    return existing.id

                # Map to Property model
                property_data = self._map_to_property_model(data, source, code)

                # Create Property
                property = Property(**property_data)
                db.add(property)
                db.commit()
                db.refresh(property)

                logger.info(f"Saved property: {code}")
                return property.id

            except Exception as e:
                db.rollback()
                logger.error(f"Error saving property: {e}")
                return None

    def _generate_property_code(self, data: Dict, source: str) -> str:
        """Generate unique property code"""
        # Format: SOURCE-TIMESTAMP
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"{source.upper()}-{timestamp}"

    def _compute_content_hash(self, data: Dict) -> str:
        """Compute content hash for deduplication"""
        # Hash based on key fields
        key_data = {
            "title": data.get("title", ""),
            "location": data.get("location", ""),
            "price": data.get("price"),
            "sqm": data.get("sqm"),
        }
        content = json.dumps(key_data, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

    def _map_to_property_model(self, data: Dict, source: str, code: str) -> Dict:
        """Map scraped data to Property model fields"""

        # Parse location
        location_parts = self._parse_location(data.get("location", ""))

        return {
            "code": code,
            "source": source,
            "sourceUrl": data.get("source_url"),
            "importDate": datetime.utcnow(),
            "verified": False,
            "status": "draft",  # Requires manual verification

            # Location
            "street": location_parts.get("street", "Unknown"),
            "city": location_parts.get("city", "Unknown"),
            "province": location_parts.get("province", ""),
            "zone": location_parts.get("zone"),
            "latitude": data.get("latitude", 0.0),
            "longitude": data.get("longitude", 0.0),

            # Type
            "contractType": self._map_contract_type(data),
            "propertyType": self._map_property_type(data),

            # Dimensions
            "sqmCommercial": data.get("sqm"),
            "rooms": data.get("rooms"),
            "bathrooms": data.get("bathrooms"),

            # Price
            "priceSale": data.get("price") if data.get("contract_type") == "sale" else None,
            "priceRentMonthly": data.get("price") if data.get("contract_type") == "rent" else None,

            # Marketing
            "title": data.get("title"),
            "description": data.get("description"),

            # Features
            "hasElevator": data.get("has_elevator", False),
            "hasParking": data.get("has_parking", False),
            "hasGarden": data.get("has_garden", False),
            "condition": data.get("condition"),
            "energyClass": data.get("energy_class"),
        }

    def _parse_location(self, location_str: str) -> Dict:
        """Parse location string into components"""
        # Simple parsing - can be improved with AI
        parts = location_str.split(",")

        return {
            "city": parts[0].strip() if len(parts) > 0 else "Unknown",
            "zone": parts[1].strip() if len(parts) > 1 else None,
            "street": parts[2].strip() if len(parts) > 2 else None,
        }

    def _map_contract_type(self, data: Dict) -> str:
        """Map contract type to model enum"""
        contract = data.get("contract_type", "").lower()

        if "vendita" in contract or "sale" in contract:
            return "sale"
        elif "affitto" in contract or "rent" in contract:
            return "rent"
        else:
            return "sale"  # default

    def _map_property_type(self, data: Dict) -> str:
        """Map property type to model enum"""
        prop_type = data.get("property_type", "").lower()

        if "appartamento" in prop_type:
            return "apartment"
        elif "villa" in prop_type:
            return "villa"
        elif "casa" in prop_type:
            return "house"
        else:
            return "other"


# Example usage
if __name__ == "__main__":
    repo = ScrapingRepository()

    sample_data = {
        "source_url": "https://www.immobiliare.it/annunci/12345",
        "title": "Bellissimo appartamento",
        "location": "Roma, Prati, Via Ottaviano",
        "price": 350000,
        "sqm": 85,
        "rooms": 3,
        "bathrooms": 2,
        "has_elevator": True,
        "contract_type": "sale",
        "property_type": "apartment",
    }

    property_id = repo.save_property(sample_data, "immobiliare_it")
    print(f"Saved property: {property_id}")
```

**Output**: Database integration completa, dati salvati in PostgreSQL

---

### FASE 4: TASK SCHEDULING & API (Settimana 3)

**Obiettivo**: Schedulare job scraping e esporre API

#### 4.1 Setup Celery + Redis per Task Queue

```bash
# Add to ai_tools/requirements.txt
celery==5.4.0
redis==5.2.0
celery-beat==2.7.0  # For scheduling
```

```python
# ai_tools/app/celery_app.py (CREARE)

"""
Celery configuration for async scraping tasks
"""

from celery import Celery
from celery.schedules import crontab
from app.config import settings

# Initialize Celery
celery_app = Celery(
    "scraping_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.scraping_tasks"],
)

# Configure
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Rome",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    task_soft_time_limit=3000,  # 50 minutes soft limit
)

# Scheduled tasks (Celery Beat)
celery_app.conf.beat_schedule = {
    "scrape-immobiliare-daily": {
        "task": "app.tasks.scraping_tasks.scrape_portal",
        "schedule": crontab(hour=2, minute=0),  # Every day at 2 AM
        "kwargs": {
            "portal": "immobiliare_it",
            "location": "roma",
            "contract_type": "vendita",
        },
    },
    "scrape-casa-daily": {
        "task": "app.tasks.scraping_tasks.scrape_portal",
        "schedule": crontab(hour=3, minute=0),  # Every day at 3 AM
        "kwargs": {
            "portal": "casa_it",
            "location": "roma",
            "contract_type": "vendita",
        },
    },
}
```

```python
# ai_tools/app/tasks/scraping_tasks.py (CREARE)

"""
Celery tasks for web scraping
"""

from celery import Task
from app.celery_app import celery_app
import asyncio
import logging

logger = logging.getLogger(__name__)


class ScrapingTask(Task):
    """Base class for scraping tasks"""

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure"""
        logger.error(f"Scraping task {task_id} failed: {exc}")
        # TODO: Send alert notification


@celery_app.task(base=ScrapingTask, bind=True, name="app.tasks.scraping_tasks.scrape_portal")
def scrape_portal(self, portal: str, location: str, contract_type: str, **kwargs):
    """
    Scrape a portal asynchronously

    Args:
        portal: Portal name (immobiliare_it, casa_it, etc)
        location: City/location to scrape
        contract_type: sale or rent
        **kwargs: Additional scraper parameters
    """
    logger.info(f"Starting scraping task: {portal} - {location}")

    try:
        # Import scraper dynamically
        if portal == "immobiliare_it":
            from scraping.portals.immobiliare_it import ImmobiliareItScraper
            scraper_class = ImmobiliareItScraper
        elif portal == "casa_it":
            from scraping.portals.casa_it import CasaItScraper
            scraper_class = CasaItScraper
        elif portal == "idealista_it":
            from scraping.portals.idealista_it import IdealistaItScraper
            scraper_class = IdealistaItScraper
        else:
            raise ValueError(f"Unknown portal: {portal}")

        # Run scraper (async)
        result = asyncio.run(_run_scraper(scraper_class, location, contract_type, kwargs))

        logger.info(f"Scraping completed: {result['listings_count']} listings")

        return {
            "status": "success",
            "portal": portal,
            "location": location,
            **result,
        }

    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        raise


async def _run_scraper(scraper_class, location, contract_type, kwargs):
    """Run scraper async"""
    from scraping.database.scraping_repository import ScrapingRepository

    repo = ScrapingRepository()

    async with scraper_class() as scraper:
        # Scrape
        listings = await scraper.scrape_search(
            location=location,
            contract_type=contract_type,
            **kwargs,
        )

        # Save to database
        saved_count = 0
        for listing in listings:
            property_id = repo.save_property(listing, scraper.portal_name)
            if property_id:
                saved_count += 1

        return {
            "listings_count": len(listings),
            "saved_count": saved_count,
        }
```

**Output**: Task queue configurato, scraping schedulato automaticamente

#### 4.2 API Endpoints per Scraping Management

```python
# ai_tools/app/routers/scraping.py (CREARE)

"""
Scraping Management API
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.tasks.scraping_tasks import scrape_portal

router = APIRouter()


class ScrapingJobCreate(BaseModel):
    portal: str
    location: str
    contract_type: str
    property_type: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    rooms_min: Optional[int] = None
    max_pages: int = 3


class ScrapingJobResponse(BaseModel):
    job_id: str
    status: str
    portal: str
    location: str
    created_at: datetime


@router.post("/jobs", response_model=ScrapingJobResponse)
async def create_scraping_job(job: ScrapingJobCreate):
    """
    Create and start a scraping job
    """
    try:
        # Trigger Celery task
        task = scrape_portal.delay(
            portal=job.portal,
            location=job.location,
            contract_type=job.contract_type,
            property_type=job.property_type,
            price_min=job.price_min,
            price_max=job.price_max,
            rooms_min=job.rooms_min,
            max_pages=job.max_pages,
        )

        return ScrapingJobResponse(
            job_id=task.id,
            status="queued",
            portal=job.portal,
            location=job.location,
            created_at=datetime.utcnow(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """
    Get scraping job status
    """
    from celery.result import AsyncResult

    task = AsyncResult(job_id, app=scrape_portal.app)

    return {
        "job_id": job_id,
        "status": task.state,
        "result": task.result if task.successful() else None,
        "error": str(task.info) if task.failed() else None,
    }


@router.post("/jobs/{job_id}/cancel")
async def cancel_job(job_id: str):
    """
    Cancel a running scraping job
    """
    from celery.result import AsyncResult

    task = AsyncResult(job_id, app=scrape_portal.app)
    task.revoke(terminate=True)

    return {"job_id": job_id, "status": "cancelled"}
```

**Register in main.py:**
```python
# ai_tools/main.py (ADD)
from app.routers import scraping

app.include_router(scraping.router, prefix="/ai/scraping", tags=["Scraping"])
```

**Output**: API completa per gestione scraping jobs

---

### FASE 5: FRONTEND DASHBOARD (Settimana 4)

**Obiettivo**: UI per gestire scraping jobs

#### 5.1 Creare Componenti Frontend

```typescript
// frontend/src/app/scraping/page.tsx (CREARE)

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function ScrapingDashboard() {
  const [selectedPortal, setSelectedPortal] = useState("immobiliare_it");

  // Fetch active jobs
  const { data: jobs, refetch } = useQuery({
    queryKey: ["scraping-jobs"],
    queryFn: () => fetch("/api/scraping/jobs").then(r => r.json()),
  });

  // Create job mutation
  const createJob = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/scraping/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => refetch(),
  });

  const handleStartScraping = () => {
    createJob.mutate({
      portal: selectedPortal,
      location: "roma",
      contract_type: "vendita",
      max_pages: 3,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Scraping Dashboard</h1>

      {/* Job Creation */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Avvia Scraping</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Portale</label>
            <select
              value={selectedPortal}
              onChange={e => setSelectedPortal(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="immobiliare_it">Immobiliare.it</option>
              <option value="casa_it">Casa.it</option>
              <option value="idealista_it">Idealista.it</option>
            </select>
          </div>

          <Button onClick={handleStartScraping}>
            Avvia Scraping
          </Button>
        </div>
      </Card>

      {/* Active Jobs */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Job Attivi</h2>

        {jobs?.map((job: any) => (
          <div key={job.id} className="p-4 border rounded mb-2">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{job.portal}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{job.status}</p>
                <p className="text-xs text-gray-500">
                  {new Date(job.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
```

**Output**: Dashboard funzionale per scraping management

---

## 📊 DELIVERABLES FINALI

### Codice Prodotto
- ✅ Playwright browser automation integrato
- ✅ Scraper Immobiliare.it completo (casa.it e idealista.it simili)
- ✅ Datapizza AI per semantic extraction
- ✅ Database PostgreSQL con tabelle scraping
- ✅ Celery task queue per scheduling
- ✅ FastAPI endpoints per API
- ✅ Frontend dashboard React/Next.js
- ✅ Railway deployment configurato

### Testing
- Unit tests per scrapers
- Integration tests per database
- E2E tests per workflow completo

### Documentation
- API documentation (FastAPI auto-generated)
- User guide per dashboard
- Developer guide per aggiungere nuovi scrapers

---

## 💰 COSTI OPERATIVI

### Monthly (Stima)

| Servizio | Costo/Mese | Note |
|----------|------------|------|
| Railway.com (PostgreSQL + Hosting) | $20-50 | Dipende da traffico |
| Google AI Studio (Gemini) | $50-150 | ~500K requests/mese |
| Residential Proxies (optional) | $50-100 | Se necessari per anti-ban |
| Redis (Railway add-on) | $10 | Per Celery |
| **TOTALE** | **$130-310/mese** | |

**vs Piano Originale**: €650/mese (Multilogin €300 incluso)
**Saving**: ~50% evitando Multilogin inizialmente

---

## 🎯 METRICHE DI SUCCESSO

| Metrica | Target |
|---------|--------|
| **Success Rate** | >95% job completions |
| **Data Accuracy** | >99% validated data |
| **Listings/Day** | 500-1000 properties |
| **Anti-Ban Rate** | <5% blocked requests |
| **API Response Time** | <2s per request |
| **Job Duration** | <10 min per 100 listings |

---

## 🚨 RISCHI E MITIGAZIONI

### Rischi Tecnici

1. **Anti-Bot Detection**
   - Rischio: Cloudflare/DataDome blocca richieste
   - Mitigazione: Playwright-stealth + residential proxies + rate limiting

2. **Layout Changes**
   - Rischio: Portali cambiano HTML structure
   - Mitigazione: AI semantic extraction (Datapizza) resiste a cambiamenti

3. **Rate Limiting**
   - Rischio: IP bannato per troppi request
   - Mitigazione: Rate limiter, delay tra requests, proxy rotation

### Rischi Legali

1. **Terms of Service Violation**
   - Rischio: Portali vietano scraping nei ToS
   - Mitigazione: Robots.txt compliance, rate limiting etico, solo dati pubblici

2. **GDPR Compliance**
   - Rischio: Dati personali estratti
   - Mitigazione: Solo dati pubblici, no dati proprietari/venditori privati

---

## 🔄 ROADMAP FUTURA

### v1.1 (Mese 2)
- Aggiungere Casa.it e Idealista.it scrapers
- Implementare proxy rotation automatico
- Enhanced AI validation

### v1.2 (Mese 3)
- Monitoring dashboard con Grafana
- Alert system per failures
- Performance optimization

### v2.0 (Mese 4-6)
- Multilogin integration (se budget disponibile)
- Multi-region scraping
- Advanced scheduling (custom frequencies)
- Image download e storage

---

## 📞 SUPPORTO E MANUTENZIONE

### Weekly Tasks
- Monitor job success rates
- Review and clean failed jobs
- Update selectors if needed
- Check logs for errors

### Monthly Tasks
- Analyze data quality metrics
- Optimize scraping strategies
- Review cost efficiency
- Update AI prompts if needed

---

## ✅ ACCEPTANCE CRITERIA

Prima del deployment production:

- [ ] Prisma schema creato e Prisma Client generato
- [ ] PostgreSQL configurato su Railway
- [ ] Playwright installato e Chromium funzionante
- [ ] Scraper Immobiliare.it estrae dati con >95% success rate
- [ ] Datapizza AI estrae campi strutturati correttamente
- [ ] Database save funziona con deduplication
- [ ] Celery tasks eseguono scraping schedulato
- [ ] API endpoints rispondono correttamente
- [ ] Frontend dashboard visualizza jobs
- [ ] Test suite passa (>80% coverage)
- [ ] Railway deployment funziona end-to-end
- [ ] Documentazione completa

---

## 🎉 CONCLUSIONI

Questo piano integra un **sistema di scraping intelligente enterprise-grade** nella tua architettura modulare esistente, usando:

✅ **Playwright** per browser automation reale
✅ **Datapizza AI** (già integrato) per AI reasoning
✅ **PostgreSQL** su Railway per produzione
✅ **Architettura modulare** che rispetta i confini

**Vantaggi vs Piano Originale**:
- ✅ 50% risparmio costi (no Multilogin inizialmente)
- ✅ Integrazione perfetta con infrastruttura esistente
- ✅ Browser automation reale (Playwright > httpx)
- ✅ Railway deployment ready
- ✅ Scalabile e manutenibile

**Next Steps**: Iniziare con FASE 0 (Prerequisiti Critici) per sbloccare lo sviluppo.

---

**Documento creato**: 2025-11-05
**Autore**: Claude Code
**Repository**: /home/user/cookkie-real-estate-agent
**Versione Piano**: 1.0.0
