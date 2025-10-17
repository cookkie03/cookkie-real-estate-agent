"""
Scraping Module Configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional


class ScrapingSettings(BaseSettings):
    """Scraping configuration"""

    # Database
    database_url: str = "sqlite:///../database/prisma/dev.db"

    # Cache
    cache_dir: str = ".cache"
    cache_ttl: int = 86400  # 24 hours

    # Rate Limiting
    rate_limit_rps: float = 1.0  # requests per second
    rate_limit_burst: int = 5

    # Retry Logic
    max_retries: int = 3
    retry_delay: int = 5  # seconds
    retry_backoff: float = 2.0  # exponential backoff multiplier

    # HTTP
    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    )
    timeout: int = 30  # seconds
    follow_redirects: bool = True

    # Proxy (optional)
    http_proxy: Optional[str] = None
    https_proxy: Optional[str] = None

    # Logging
    log_level: str = "INFO"
    log_file: str = "../logs/scraping/scraper.log"

    # Scraping Limits
    max_pages_per_search: int = 50
    max_listings_per_run: int = 1000

    # Verification
    verify_ssl: bool = True
    respect_robots_txt: bool = True

    class Config:
        env_file = "../config/.env"
        env_prefix = "SCRAPING_"


settings = ScrapingSettings()
