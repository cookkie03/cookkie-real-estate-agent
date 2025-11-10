"""
Dynamic Configuration Management
Loads sensitive settings from database with fallback to environment variables
"""

import logging
from typing import Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
import json

from app.config import settings

logger = logging.getLogger(__name__)


class DynamicConfig:
    """
    Dynamic configuration that reads from database first, then falls back to env vars.
    Used for sensitive data like API keys and model selection that users can update via GUI.
    """

    def __init__(self):
        self._google_api_key_cache: Optional[str] = None
        self._google_model_cache: Optional[str] = None
        self._cache_valid = False

    def _get_db_session(self) -> Optional[Session]:
        """Get database session for reading UserProfile settings"""
        try:
            engine = create_engine(settings.database_url, echo=False)
            return Session(engine)
        except Exception as e:
            logger.warning(f"Could not connect to database: {e}")
            return None

    def _load_google_api_key_from_db(self) -> Optional[str]:
        """Load Google AI API key from UserProfile.settings JSON"""
        db = self._get_db_session()
        if not db:
            return None

        try:
            # Query UserProfile settings (single-user app, take first)
            result = db.execute(
                text("SELECT settings FROM user_profile LIMIT 1")
            ).fetchone()

            if result and result[0]:
                settings_json = json.loads(result[0]) if isinstance(result[0], str) else result[0]
                api_key = settings_json.get('googleAiApiKey')

                if api_key and api_key.strip():
                    logger.info("✅ Google AI API key loaded from database")
                    return api_key.strip()

            logger.info("ℹ️  Google AI API key not found in database, using environment variable")
            return None

        except Exception as e:
            logger.warning(f"Error loading API key from database: {e}")
            return None
        finally:
            db.close()

    def get_google_api_key(self, force_reload: bool = False) -> str:
        """
        Get Google AI API key with priority:
        1. Database (UserProfile.settings.googleAiApiKey)
        2. Environment variable (GOOGLE_API_KEY)
        3. Raise error if not found

        Args:
            force_reload: If True, bypass cache and reload from DB

        Returns:
            API key string

        Raises:
            ValueError: If API key not found in DB or env
        """
        # Return cached value if valid
        if not force_reload and self._cache_valid and self._google_api_key_cache:
            return self._google_api_key_cache

        # Try database first
        db_key = self._load_google_api_key_from_db()
        if db_key:
            self._google_api_key_cache = db_key
            self._cache_valid = True
            return db_key

        # Fallback to environment variable
        env_key = settings.google_api_key if hasattr(settings, 'google_api_key') else None
        if env_key and env_key.strip():
            logger.info("✅ Using Google AI API key from environment variable")
            self._google_api_key_cache = env_key
            self._cache_valid = True
            return env_key

        # Not found anywhere
        logger.error("❌ Google AI API key not configured!")
        raise ValueError(
            "Google AI API key not found. "
            "Please configure it via Settings page or set GOOGLE_API_KEY environment variable. "
            "Get a free key at: https://aistudio.google.com/app/apikey"
        )

    def _load_google_model_from_db(self) -> Optional[str]:
        """Load Google AI model name from UserProfile.settings JSON"""
        db = self._get_db_session()
        if not db:
            return None

        try:
            # Query UserProfile settings (single-user app, take first)
            result = db.execute(
                text("SELECT settings FROM user_profile LIMIT 1")
            ).fetchone()

            if result and result[0]:
                settings_json = json.loads(result[0]) if isinstance(result[0], str) else result[0]
                model_name = settings_json.get('googleAiModel')

                if model_name and model_name.strip():
                    logger.info(f"✅ Google AI model loaded from database: {model_name}")
                    return model_name.strip()

            logger.info("ℹ️  Google AI model not found in database, using default")
            return None

        except Exception as e:
            logger.warning(f"Error loading AI model from database: {e}")
            return None
        finally:
            db.close()

    def get_google_model(self, force_reload: bool = False) -> str:
        """
        Get Google AI model name with priority:
        1. Database (UserProfile.settings.googleAiModel)
        2. Environment variable (GOOGLE_MODEL)
        3. Default ("gemini-2.0-flash-exp")

        Args:
            force_reload: If True, bypass cache and reload from DB

        Returns:
            Model name string
        """
        # Return cached value if valid
        if not force_reload and self._cache_valid and self._google_model_cache:
            return self._google_model_cache

        # Try database first
        db_model = self._load_google_model_from_db()
        if db_model:
            self._google_model_cache = db_model
            self._cache_valid = True
            return db_model

        # Fallback to environment variable
        env_model = settings.google_model if hasattr(settings, 'google_model') else None
        if env_model and env_model.strip():
            logger.info(f"✅ Using Google AI model from environment variable: {env_model}")
            self._google_model_cache = env_model
            self._cache_valid = True
            return env_model

        # Default model
        default_model = "gemini-2.0-flash-exp"
        logger.info(f"ℹ️  Using default Google AI model: {default_model}")
        self._google_model_cache = default_model
        self._cache_valid = True
        return default_model

    def invalidate_cache(self):
        """Invalidate cached values (call after updating DB settings)"""
        self._cache_valid = False
        self._google_api_key_cache = None
        self._google_model_cache = None
        logger.info("🔄 Dynamic config cache invalidated")

    @property
    def google_api_key(self) -> str:
        """Property accessor for Google API key"""
        return self.get_google_api_key()

    @property
    def google_model(self) -> str:
        """Property accessor for Google AI model"""
        return self.get_google_model()


# Global instance
dynamic_config = DynamicConfig()


def get_google_api_key(force_reload: bool = False) -> str:
    """
    Convenience function to get Google API key.
    Use this instead of settings.google_api_key to support GUI updates.

    Args:
        force_reload: Force reload from database (use after updating settings)

    Returns:
        Google AI API key
    """
    return dynamic_config.get_google_api_key(force_reload=force_reload)


def get_google_model(force_reload: bool = False) -> str:
    """
    Convenience function to get Google AI model name.
    Use this instead of settings.google_model to support GUI updates.

    Args:
        force_reload: Force reload from database (use after updating settings)

    Returns:
        Google AI model name (e.g., "gemini-2.0-flash-exp")
    """
    return dynamic_config.get_google_model(force_reload=force_reload)


def invalidate_config_cache():
    """
    Invalidate configuration cache.
    Call this after updating settings in database.
    """
    dynamic_config.invalidate_cache()
