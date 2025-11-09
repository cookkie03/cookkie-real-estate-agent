"""
Browser Manager - Playwright wrapper with anti-detection and session persistence
Alternative to Multilogin (€300/month) using Playwright + Database
"""

import asyncio
import logging
from typing import Optional, Dict, Any
from playwright.async_api import async_playwright, Browser, BrowserContext, Page, Playwright
from playwright_stealth import Stealth

logger = logging.getLogger(__name__)


class BrowserManager:
    """
    Manages Playwright browser instances with:
    - Stealth mode (anti-detection)
    - Session persistence
    - Proxy support
    - Human-like behavior
    """

    def __init__(
        self,
        profile_name: Optional[str] = None,
        portal_name: Optional[str] = None,
        headless: bool = True,
        proxy: Optional[Dict[str, str]] = None,
        user_agent: Optional[str] = None,
        use_session_persistence: bool = True,
    ):
        """
        Initialize Browser Manager

        Args:
            profile_name: Unique profile name for session persistence
            portal_name: Portal name (immobiliare_it, casa_it, etc)
            headless: Run browser in headless mode
            proxy: Proxy configuration dict
            user_agent: Custom user agent
            use_session_persistence: Enable session persistence
        """
        self.profile_name = profile_name or "default"
        self.portal_name = portal_name or "generic"
        self.headless = headless
        self.proxy = proxy
        self.user_agent = user_agent
        self.use_session_persistence = use_session_persistence

        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.session_manager = None

        logger.info(f"BrowserManager initialized (profile: {self.profile_name})")

    async def start(self):
        """Initialize browser with session restoration if available"""
        try:
            # Start Playwright
            self.playwright = await async_playwright().start()
            logger.debug("Playwright started")

            # Load session if available
            session_data = None
            if self.use_session_persistence:
                # Import here to avoid circular dependency
                from .session_manager import SessionManager
                self.session_manager = SessionManager(
                    profile_name=self.profile_name,
                    portal_name=self.portal_name,
                )
                session_data = await self.session_manager.load_or_create_session()

            # Determine user agent (from session or default)
            user_agent = (
                session_data.get("userAgent") if session_data
                else self.user_agent or self._default_user_agent()
            )

            # Viewport (from session or default)
            viewport = (
                session_data.get("viewport") if session_data
                else {"width": 1920, "height": 1080}
            )

            # Launch options
            launch_options = {
                "headless": self.headless,
                "args": [
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-web-security",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--disable-site-isolation-trials",
                ],
            }

            if self.proxy:
                launch_options["proxy"] = self.proxy

            # Launch browser
            self.browser = await self.playwright.chromium.launch(**launch_options)
            logger.info("Browser launched")

            # Create context with fingerprint
            context_options = {
                "viewport": viewport,
                "user_agent": user_agent,
                "locale": session_data.get("locale", "it-IT") if session_data else "it-IT",
                "timezone_id": session_data.get("timezone", "Europe/Rome") if session_data else "Europe/Rome",
                "has_touch": False,
                "is_mobile": False,
                "device_scale_factor": 1,
            }

            self.context = await self.browser.new_context(**context_options)
            logger.info("Browser context created")

            # Restore session if available
            if session_data and self.session_manager:
                await self.session_manager.apply_session_to_context(
                    self.context,
                    session_data,
                )
                logger.info("Session restored")

        except Exception as e:
            logger.error(f"Error starting browser: {e}")
            raise

    async def new_page(self, apply_stealth: bool = True) -> Page:
        """
        Create new page with stealth mode

        Args:
            apply_stealth: Apply playwright-stealth to bypass detection

        Returns:
            Page object
        """
        if not self.context:
            await self.start()

        page = await self.context.new_page()

        # Apply stealth
        if apply_stealth:
            stealth_config = Stealth()
            await stealth_config.apply_stealth_async(page)
            logger.debug("Stealth mode applied to page")

        # Add extra headers to appear more human
        await page.set_extra_http_headers({
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        })

        return page

    async def navigate_with_session(self, url: str, wait_until: str = "networkidle") -> Page:
        """
        Navigate to URL and restore session storage if available

        Args:
            url: URL to navigate to
            wait_until: Wait until condition (networkidle, domcontentloaded, load)

        Returns:
            Page object
        """
        page = await self.new_page()

        try:
            # Navigate first
            await page.goto(url, wait_until=wait_until, timeout=30000)
            logger.info(f"Navigated to {url}")

            # Restore storage if session exists
            if self.session_manager and self.session_manager.session_data:
                await self.session_manager.apply_storage_to_page(
                    page,
                    self.session_manager.session_data,
                )

                # Reload to apply storage
                await page.reload(wait_until=wait_until, timeout=30000)
                logger.debug("Page reloaded with session storage")

            return page

        except Exception as e:
            logger.error(f"Error navigating to {url}: {e}")
            await page.close()
            raise

    async def save_current_session(
        self,
        page: Page,
        is_authenticated: bool = False,
    ):
        """
        Save current browser state as session

        Args:
            page: Current page
            is_authenticated: Whether user is logged in
        """
        if self.session_manager:
            await self.session_manager.save_session(
                self.context,
                page,
                is_authenticated=is_authenticated,
            )
            logger.info("Session saved")

    async def verify_and_save_session(self, page: Page) -> bool:
        """
        Verify authentication and save session if valid

        Args:
            page: Current page

        Returns:
            True if authenticated, False otherwise
        """
        if not self.session_manager:
            return True  # No session management, assume OK

        is_authenticated = await self.session_manager.verify_authentication(page)

        if is_authenticated:
            await self.save_current_session(page, is_authenticated=True)
            logger.info("Authentication verified and session saved")
        else:
            self.session_manager.invalidate_session()
            logger.warning("Authentication failed, session invalidated")

        return is_authenticated

    def _default_user_agent(self) -> str:
        """Generate realistic user agent"""
        return (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )

    async def close(self):
        """Close browser and cleanup"""
        try:
            if self.context:
                await self.context.close()
                logger.debug("Context closed")

            if self.browser:
                await self.browser.close()
                logger.debug("Browser closed")

            if self.playwright:
                await self.playwright.stop()
                logger.debug("Playwright stopped")

            logger.info(f"Browser closed (profile: {self.profile_name})")

        except Exception as e:
            logger.error(f"Error closing browser: {e}")

    async def __aenter__(self):
        """Async context manager entry"""
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()


# Utility functions

async def create_browser(
    profile_name: str = "default",
    portal_name: str = "generic",
    **kwargs
) -> BrowserManager:
    """
    Factory function to create and start a browser

    Args:
        profile_name: Profile name for session persistence
        portal_name: Portal name
        **kwargs: Additional BrowserManager options

    Returns:
        Started BrowserManager instance
    """
    browser = BrowserManager(
        profile_name=profile_name,
        portal_name=portal_name,
        **kwargs
    )
    await browser.start()
    return browser
