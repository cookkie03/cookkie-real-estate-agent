"""
Rate Limiter for Scraping
"""

import time
import logging
from collections import deque


logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Token bucket rate limiter

    Ensures requests are spaced out according to configured rate
    """

    def __init__(self, requests_per_second: float = 1.0, burst: int = 5):
        """
        Initialize rate limiter

        Args:
            requests_per_second: Maximum requests per second
            burst: Maximum burst size
        """
        self.rate = requests_per_second
        self.burst = burst
        self.interval = 1.0 / requests_per_second
        self.timestamps = deque(maxlen=burst)

    def wait(self):
        """
        Wait if necessary to respect rate limit

        This should be called before each request
        """
        now = time.time()

        # If we have burst tokens, check if we need to wait
        if len(self.timestamps) >= self.burst:
            # Get oldest timestamp
            oldest = self.timestamps[0]
            time_passed = now - oldest

            # If not enough time has passed, wait
            if time_passed < self.interval:
                sleep_time = self.interval - time_passed
                logger.debug(f"Rate limiting: sleeping {sleep_time:.3f}s")
                time.sleep(sleep_time)
                now = time.time()

        # Record this request
        self.timestamps.append(now)

    def reset(self):
        """Reset rate limiter"""
        self.timestamps.clear()
