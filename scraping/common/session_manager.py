"""
Session Persistence Manager
Saves and restores browser sessions across runs - Alternative to Multilogin (€300/month)
"""

import json
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
from playwright.async_api import BrowserContext, Page

# Database will be imported at runtime to avoid circular deps
from database.python.database import get_db_context

logger = logging.getLogger(__name__)


class SessionManager:
    """
    Manages persistent browser sessions using database storage

    Features:
    - Cookie persistence
    - localStorage/sessionStorage persistence
    - Browser fingerprint management
    - Authentication state tracking
    - Session expiration
    """

    def __init__(
        self,
        profile_name: str,
        portal_name: str,
    ):
        """
        Initialize Session Manager

        Args:
            profile_name: Unique profile name (e.g., "immobiliare_roma_agent1")
            portal_name: Portal name (e.g., "immobiliare_it")
        """
        self.profile_name = profile_name
        self.portal_name = portal_name
        self.session_data: Optional[Dict] = None

        logger.info(f"SessionManager initialized: {profile_name} @ {portal_name}")

    async def load_or_create_session(self) -> Optional[Dict]:
        """
        Load existing session from database or return None for new session

        Returns:
            Session data dict or None if no valid session exists
        """
        try:
            with get_db_context() as db:
                # Import ScrapingSession model from database
                try:
                    from database.python.models import ScrapingSession

                    # Create portal identifier (combine profile + portal)
                    portal_id = f"{self.profile_name}_{self.portal_name}"

                    # Query for existing session
                    session = db.query(ScrapingSession).filter(
                        ScrapingSession.portal == portal_id,
                        ScrapingSession.isValid == True,
                    ).first()

                    if session:
                        logger.info(f"Loaded existing session: {self.profile_name}")

                        # Parse JSON fields (cookies are already JSON in Prisma/SQLAlchemy)
                        self.session_data = {
                            "id": session.id,
                            "cookies": session.cookies if isinstance(session.cookies, list) else [],
                            "localStorage": session.localStorage if isinstance(session.localStorage, dict) else {},
                            "sessionStorage": session.sessionStorage if isinstance(session.sessionStorage, dict) else {},
                            "userAgent": session.userAgent,
                            "viewport": {"width": session.viewportWidth, "height": session.viewportHeight},
                            "timezone": "Europe/Rome",  # Default value
                            "locale": "it-IT",  # Default value
                            "isAuthenticated": session.isAuthenticated,
                        }

                        # Update usage stats
                        session.lastUsedAt = datetime.utcnow()
                        session.useCount += 1
                        db.commit()

                        return self.session_data

                    logger.info(f"No session found: {self.profile_name}")
                    return None

                except ImportError as e:
                    logger.warning(f"Database models not available: {e}")
                    return None

        except Exception as e:
            logger.error(f"Error loading session: {e}")
            return None

    async def apply_session_to_context(
        self,
        context: BrowserContext,
        session_data: Dict,
    ):
        """
        Apply saved session data to browser context (cookies)

        Args:
            context: Playwright BrowserContext
            session_data: Session data from database
        """
        try:
            # Add cookies
            if session_data.get("cookies"):
                await context.add_cookies(session_data["cookies"])
                logger.debug(f"Restored {len(session_data['cookies'])} cookies")

        except Exception as e:
            logger.error(f"Error applying session to context: {e}")

    async def apply_storage_to_page(self, page: Page, session_data: Dict):
        """
        Apply localStorage and sessionStorage to page
        Must be called after page.goto()

        Args:
            page: Playwright Page
            session_data: Session data
        """
        try:
            # Set localStorage
            if session_data.get("localStorage"):
                for key, value in session_data["localStorage"].items():
                    await page.evaluate(
                        f"localStorage.setItem({json.dumps(key)}, {json.dumps(value)})"
                    )
                logger.debug(f"Restored {len(session_data['localStorage'])} localStorage items")

            # Set sessionStorage
            if session_data.get("sessionStorage"):
                for key, value in session_data["sessionStorage"].items():
                    await page.evaluate(
                        f"sessionStorage.setItem({json.dumps(key)}, {json.dumps(value)})"
                    )
                logger.debug(f"Restored {len(session_data['sessionStorage'])} sessionStorage items")

        except Exception as e:
            logger.error(f"Error applying storage to page: {e}")

    async def save_session(
        self,
        context: BrowserContext,
        page: Page,
        is_authenticated: bool = False,
        expires_in_days: int = 30,
    ):
        """
        Save current browser session to database

        Args:
            context: Browser context
            page: Current page
            is_authenticated: Whether user is logged in
            expires_in_days: Session expiration in days
        """
        try:
            # Extract session data
            cookies = await context.cookies()

            # Extract localStorage
            local_storage = await page.evaluate("() => Object.assign({}, localStorage)")

            # Extract sessionStorage
            session_storage = await page.evaluate("() => Object.assign({}, sessionStorage)")

            # Get user agent
            user_agent = await page.evaluate("() => navigator.userAgent")

            # Get viewport
            viewport = page.viewport_size

            # Save to database
            with get_db_context() as db:
                try:
                    from database.python.models import ScrapingSession
                    import uuid

                    # Create portal identifier (combine profile + portal)
                    portal_id = f"{self.profile_name}_{self.portal_name}"

                    # Check if exists
                    existing = db.query(ScrapingSession).filter(
                        ScrapingSession.portal == portal_id,
                    ).first()

                    if existing:
                        # Update existing
                        existing.cookies = cookies  # Already JSON in Prisma
                        existing.localStorage = local_storage or {}
                        existing.sessionStorage = session_storage or {}
                        existing.userAgent = user_agent
                        existing.viewportWidth = viewport.get('width', 1920) if viewport else 1920
                        existing.viewportHeight = viewport.get('height', 1080) if viewport else 1080
                        existing.isAuthenticated = is_authenticated
                        existing.lastUsedAt = datetime.utcnow()
                        existing.isValid = True
                        existing.successCount += 1
                        existing.updatedAt = datetime.utcnow()

                        logger.info(f"Updated session: {self.profile_name}")
                    else:
                        # Create new
                        new_session = ScrapingSession(
                            id=str(uuid.uuid4()),
                            portal=portal_id,
                            cookies=cookies,  # JSON type in Prisma
                            localStorage=local_storage or {},
                            sessionStorage=session_storage or {},
                            userAgent=user_agent,
                            viewportWidth=viewport.get('width', 1920) if viewport else 1920,
                            viewportHeight=viewport.get('height', 1080) if viewport else 1080,
                            isAuthenticated=is_authenticated,
                            lastUsedAt=datetime.utcnow(),
                            useCount=1,
                            successCount=1,
                            createdAt=datetime.utcnow(),
                            updatedAt=datetime.utcnow(),
                        )
                        db.add(new_session)

                        logger.info(f"Created new session: {self.profile_name}")

                    db.commit()

                except ImportError as e:
                    logger.warning(f"Database models not available: {e}")

        except Exception as e:
            logger.error(f"Error saving session: {e}")

    async def verify_authentication(self, page: Page) -> bool:
        """
        Verify if user is still authenticated
        Override this method for portal-specific checks

        Args:
            page: Current page

        Returns:
            True if authenticated, False otherwise
        """
        try:
            await page.wait_for_load_state("networkidle", timeout=5000)

            # Check for common logout indicators
            logout_selectors = [
                "text=/logout/i",
                "a[href*='logout']",
                "button:has-text('Logout')",
                "a:has-text('Esci')",
                "[data-testid='logout']",
            ]

            for selector in logout_selectors:
                try:
                    element = await page.wait_for_selector(selector, timeout=1000)
                    if element:
                        logger.info("Authentication verified (logout button found)")
                        return True
                except:
                    continue

            # Check for login form (means NOT authenticated)
            login_selectors = [
                "form[action*='login']",
                "input[type='password']",
                "button:has-text('Login')",
                "a:has-text('Accedi')",
            ]

            for selector in login_selectors:
                try:
                    element = await page.wait_for_selector(selector, timeout=1000)
                    if element:
                        logger.warning("Authentication failed (login form found)")
                        return False
                except:
                    continue

            # If neither found, assume authenticated (conservative)
            logger.info("Authentication status unclear, assuming valid")
            return True

        except Exception as e:
            logger.error(f"Error verifying authentication: {e}")
            return False

    def invalidate_session(self):
        """Mark session as invalid in database"""
        try:
            with get_db_context() as db:
                from database.python.models import Base
                from sqlalchemy import Column, String, Boolean, Integer, DateTime

                class ScrapingSession(Base):
                    __tablename__ = "scraping_sessions"
                    id = Column(String, primary_key=True)
                    profileName = Column(String)
                    portalName = Column(String)
                    isValid = Column(Boolean)
                    failureCount = Column(Integer)
                    updatedAt = Column(DateTime)
                    # ... other columns

                session = db.query(ScrapingSession).filter(
                    ScrapingSession.profileName == self.profile_name,
                    ScrapingSession.portalName == self.portal_name,
                ).first()

                if session:
                    session.isValid = False
                    session.failureCount += 1
                    session.updatedAt = datetime.utcnow()
                    db.commit()
                    logger.info(f"Invalidated session: {self.profile_name}")

        except Exception as e:
            logger.error(f"Error invalidating session: {e}")
