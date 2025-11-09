"""
Base Scraper Class - Playwright + AI Integration
All portal scrapers inherit from this class
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime
from bs4 import BeautifulSoup

from ..config import settings
from ..common.browser_manager import BrowserManager
from ..common.cache import Cache
from ..common.rate_limiter import RateLimiter


logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """
    Base class for all scrapers with Playwright support

    Provides common functionality:
    - Browser automation with Playwright
    - Session persistence
    - Rate limiting
    - Caching
    - Error handling
    - Anti-detection
    """

    portal_name: str = "base"
    base_url: str = ""
    rate_limit: float = 1.0  # requests per second

    def __init__(
        self,
        profile_name: Optional[str] = None,
        cache_enabled: bool = True,
        rate_limit_enabled: bool = True,
        headless: bool = True,
        proxy: Optional[Dict] = None,
        use_session_persistence: bool = True,
    ):
        """
        Initialize scraper

        Args:
            profile_name: Unique profile for session persistence
            cache_enabled: Enable caching
            rate_limit_enabled: Enable rate limiting
            headless: Run browser in headless mode
            proxy: Proxy configuration
            use_session_persistence: Enable session persistence
        """
        self.cache_enabled = cache_enabled
        self.rate_limit_enabled = rate_limit_enabled
        self.profile_name = profile_name or f"{self.portal_name}_default"

        # Browser manager with session persistence
        self.browser = BrowserManager(
            profile_name=self.profile_name,
            portal_name=self.portal_name,
            headless=headless,
            proxy=proxy,
            use_session_persistence=use_session_persistence,
        )

        # Cache
        if self.cache_enabled:
            self.cache = Cache(portal=self.portal_name)

        # Rate limiter
        if self.rate_limit_enabled:
            self.rate_limiter = RateLimiter(requests_per_second=self.rate_limit)

        logger.info(f"Initialized {self.portal_name} scraper with Playwright")

    async def fetch_page(self, url: str, use_cache: bool = True, wait_until: str = "networkidle") -> str:
        """
        Fetch page with Playwright

        Args:
            url: URL to fetch
            use_cache: Whether to use cache
            wait_until: Wait until condition (networkidle, domcontentloaded, load)

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
            await page.goto(url, wait_until=wait_until, timeout=30000)

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

    async def fetch_page_with_session(
        self,
        url: str,
        use_cache: bool = True,
        wait_until: str = "networkidle"
    ) -> str:
        """
        Fetch page with session restoration

        Args:
            url: URL to fetch
            use_cache: Whether to use cache
            wait_until: Wait until condition

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

        logger.info(f"Fetching {url} with session restoration")

        try:
            # Navigate with session restoration
            page = await self.browser.navigate_with_session(url, wait_until=wait_until)

            # Wait for content
            await self.wait_for_content(page)

            # Verify authentication if needed
            if self.browser.session_manager:
                is_authenticated = await self.browser.verify_and_save_session(page)
                if not is_authenticated:
                    logger.warning("Not authenticated, some data may be missing")

            # Get HTML
            html = await page.content()

            # Close page
            await page.close()

            # Cache result
            if use_cache and self.cache_enabled:
                self.cache.set(url, html)

            return html

        except Exception as e:
            logger.error(f"Error fetching {url} with session: {e}")
            import traceback
            traceback.print_exc()
            raise

    async def wait_for_content(self, page):
        """
        Wait for page content to load
        Override in subclass for specific selectors

        Args:
            page: Playwright Page
        """
        await asyncio.sleep(2)  # Default wait

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
    async def scrape_search(self, **kwargs) -> List[Dict]:
        """
        Scrape search results
        Must be implemented by subclass

        Returns:
            List of listing dictionaries
        """
        pass

    @abstractmethod
    async def parse_listing(self, html: str, url: str) -> Dict:
        """
        Parse single listing page
        Must be implemented by subclass

        Args:
            html: HTML content
            url: Source URL

        Returns:
            Listing dictionary
        """
        pass

    def save_to_database(self, listing: Dict):
        """
        Save listing to database
        Override in subclass for custom logic

        Args:
            listing: Listing dictionary
        """
        # Will be implemented with database repository
        logger.info(f"Saving listing: {listing.get('title', 'Untitled')}")

    async def close(self):
        """Close browser"""
        await self.browser.close()
        logger.info(f"Closed {self.portal_name} scraper")

    async def __aenter__(self):
        """Async context manager entry"""
        await self.browser.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()
