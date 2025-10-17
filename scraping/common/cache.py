"""
Cache Manager for Scraping
"""

import json
import hashlib
import time
from pathlib import Path
from typing import Optional, Any
import logging

from ..config import settings


logger = logging.getLogger(__name__)


class Cache:
    """
    File-based cache for scraping results

    Stores cached data as JSON files organized by portal
    """

    def __init__(self, portal: str):
        self.portal = portal
        self.cache_dir = Path(settings.cache_dir) / portal
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ttl = settings.cache_ttl

    def _get_cache_path(self, key: str) -> Path:
        """Get cache file path for key"""
        # Hash key to create filename
        key_hash = hashlib.md5(key.encode()).hexdigest()
        return self.cache_dir / f"{key_hash}.json"

    def exists(self, key: str) -> bool:
        """Check if key exists in cache and is not expired"""
        cache_path = self._get_cache_path(key)

        if not cache_path.exists():
            return False

        # Check expiration
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                expires_at = data.get("expires_at", 0)

                if time.time() > expires_at:
                    # Expired, remove file
                    cache_path.unlink()
                    return False

                return True

        except Exception as e:
            logger.warning(f"Error reading cache {cache_path}: {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.exists(key):
            return None

        cache_path = self._get_cache_path(key)

        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("value")

        except Exception as e:
            logger.error(f"Error loading cache {cache_path}: {e}")
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache"""
        cache_path = self._get_cache_path(key)
        ttl = ttl or self.ttl
        expires_at = time.time() + ttl

        data = {
            "key": key,
            "value": value,
            "cached_at": time.time(),
            "expires_at": expires_at,
        }

        try:
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            logger.debug(f"Cached {key} (expires in {ttl}s)")

        except Exception as e:
            logger.error(f"Error saving cache {cache_path}: {e}")

    def clear(self):
        """Clear all cache for this portal"""
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                cache_file.unlink()
            except Exception as e:
                logger.error(f"Error deleting cache file {cache_file}: {e}")

        logger.info(f"Cleared cache for {self.portal}")

    def clear_expired(self):
        """Remove expired cache files"""
        count = 0
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    expires_at = data.get("expires_at", 0)

                    if time.time() > expires_at:
                        cache_file.unlink()
                        count += 1

            except Exception as e:
                logger.warning(f"Error checking cache file {cache_file}: {e}")

        if count > 0:
            logger.info(f"Removed {count} expired cache files for {self.portal}")
