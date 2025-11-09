"""
Scraping Module Configuration
Unified configuration that reads from project root .env file
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional
import os
from pathlib import Path

# Find project root .env file
project_root = Path(__file__).parent.parent
env_file = project_root / ".env"


class ScrapingSettings(BaseSettings):
    """
    Scraping configuration

    Reads from unified .env file at project root for consistency
    with frontend and ai_tools services.
    """

    model_config = SettingsConfigDict(
        env_file=str(env_file),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Database (reads from DATABASE_URL in .env)
    database_url: str = Field(
        default="sqlite:///../database/prisma/dev.db",
        alias="DATABASE_URL",
        description="Shared database URL (same as Prisma and AI tools)"
    )

    # Cache
    cache_dir: str = Field(
        default=".cache",
        alias="CACHE_DIR"
    )
    cache_ttl: int = Field(
        default=86400,  # 24 hours
        alias="CACHE_TTL"
    )

    # Rate Limiting
    rate_limit_rps: float = Field(
        default=1.0,  # requests per second
        alias="SCRAPING_RATE_LIMIT_RPS"
    )
    rate_limit_burst: int = Field(
        default=5,
        alias="SCRAPING_RATE_LIMIT_BURST"
    )

    # Retry Logic
    max_retries: int = Field(
        default=3,
        alias="SCRAPING_MAX_RETRIES"
    )
    retry_delay: int = Field(
        default=5,  # seconds
        alias="SCRAPING_RETRY_DELAY"
    )
    retry_backoff: float = Field(
        default=2.0,  # exponential backoff multiplier
        alias="SCRAPING_RETRY_BACKOFF"
    )

    # HTTP
    user_agent: str = Field(
        default=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        ),
        alias="SCRAPING_USER_AGENT"
    )
    timeout: int = Field(
        default=30,  # seconds
        alias="SCRAPING_TIMEOUT"
    )
    follow_redirects: bool = Field(
        default=True,
        alias="SCRAPING_FOLLOW_REDIRECTS"
    )

    # Proxy (optional)
    http_proxy: Optional[str] = Field(
        default=None,
        alias="SCRAPING_HTTP_PROXY"
    )
    https_proxy: Optional[str] = Field(
        default=None,
        alias="SCRAPING_HTTPS_PROXY"
    )

    # Logging
    log_level: str = Field(
        default="INFO",
        alias="LOG_LEVEL"  # Shared with ai_tools
    )
    log_file: str = Field(
        default="../logs/scraping/scraper.log",
        alias="SCRAPING_LOG_FILE"
    )

    # Scraping Limits
    max_pages_per_search: int = Field(
        default=50,
        alias="SCRAPING_MAX_PAGES"
    )
    max_listings_per_run: int = Field(
        default=1000,
        alias="SCRAPING_MAX_LISTINGS"
    )

    # Verification
    verify_ssl: bool = Field(
        default=True,
        alias="SCRAPING_VERIFY_SSL"
    )
    respect_robots_txt: bool = Field(
        default=True,
        alias="SCRAPING_RESPECT_ROBOTS"
    )


# Global settings instance
settings = ScrapingSettings()


# Ensure cache directory exists
os.makedirs(settings.cache_dir, exist_ok=True)
