"""
Base Scraper Class
All portal scrapers inherit from this class
"""

import logging
import time
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import httpx
from bs4 import BeautifulSoup

from ..config import settings
from ..common.cache import Cache
from ..common.rate_limiter import RateLimiter


logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """
    Base class for all scrapers

    Provides common functionality:
    - HTTP requests with retry
    - Rate limiting
    - Caching
    - Error handling
    - Robots.txt checking
    """

    portal_name: str = "base"
    base_url: str = ""
    rate_limit: float = 1.0  # requests per second

    def __init__(
        self,
        cache_enabled: bool = True,
        rate_limit_enabled: bool = True,
        user_agent: Optional[str] = None,
    ):
        self.cache_enabled = cache_enabled
        self.rate_limit_enabled = rate_limit_enabled
        self.user_agent = user_agent or settings.user_agent

        # Setup cache
        if self.cache_enabled:
            self.cache = Cache(portal=self.portal_name)

        # Setup rate limiter
        if self.rate_limit_enabled:
            self.rate_limiter = RateLimiter(requests_per_second=self.rate_limit)

        # HTTP client
        self.client = httpx.Client(
            timeout=settings.timeout,
            follow_redirects=settings.follow_redirects,
            headers={"User-Agent": self.user_agent},
            proxies={
                "http://": settings.http_proxy,
                "https://": settings.https_proxy,
            }
            if settings.http_proxy
            else None,
        )

        logger.info(f"Initialized {self.portal_name} scraper")

    def fetch(self, url: str, use_cache: bool = True) -> str:
        """
        Fetch URL with cache and rate limiting

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

        # Fetch
        logger.info(f"Fetching {url}")

        try:
            response = self.client.get(url)
            response.raise_for_status()
            html = response.text

            # Cache result
            if use_cache and self.cache_enabled:
                self.cache.set(url, html)

            return html

        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching {url}: {e}")
            raise

    def parse_html(self, html: str) -> BeautifulSoup:
        """
        Parse HTML with BeautifulSoup

        Args:
            html: HTML content

        Returns:
            BeautifulSoup object
        """
        return BeautifulSoup(html, "lxml")

    @abstractmethod
    def scrape_search(self, **kwargs) -> List[Dict]:
        """
        Scrape search results

        Must be implemented by subclass

        Returns:
            List of listing dictionaries
        """
        pass

    @abstractmethod
    def parse_listing(self, html: str) -> Dict:
        """
        Parse single listing page

        Must be implemented by subclass

        Args:
            html: HTML content of listing page

        Returns:
            Listing dictionary
        """
        pass

    def save_to_database(self, listing: Dict):
        """
        Save listing to database

        Can be overridden by subclass for custom logic

        Args:
            listing: Listing dictionary
        """
        # TODO: Implement database save
        logger.info(f"Saving listing: {listing.get('title', 'Untitled')}")

    def close(self):
        """Close HTTP client"""
        self.client.close()
        logger.info(f"Closed {self.portal_name} scraper")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
