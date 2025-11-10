"""
Utility functions for AI Tools
Includes retry logic with exponential backoff for Google AI API
"""

import time
import logging
from typing import Callable, TypeVar, Any
from functools import wraps

from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar('T')


def retry_with_exponential_backoff(
    max_retries: int = None,
    base_delay: int = None,
) -> Callable:
    """
    Decorator to retry function calls with exponential backoff.

    Used for Google AI API calls to handle temporary failures gracefully.

    Args:
        max_retries: Maximum number of retry attempts (default from config)
        base_delay: Base delay in seconds for exponential backoff (default from config)

    Returns:
        Decorated function with retry logic

    Example:
        @retry_with_exponential_backoff(max_retries=3, base_delay=2)
        def call_google_ai():
            return agent.run(prompt)
    """
    if max_retries is None:
        max_retries = settings.ai_max_retries
    if base_delay is None:
        base_delay = settings.ai_retry_delay

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)

                except Exception as e:
                    last_exception = e

                    # Don't retry on last attempt
                    if attempt >= max_retries:
                        logger.error(
                            f"Function {func.__name__} failed after {max_retries} retries. "
                            f"Last error: {str(e)}"
                        )
                        break

                    # Calculate exponential backoff delay
                    delay = base_delay * (2 ** attempt)

                    logger.warning(
                        f"Attempt {attempt + 1}/{max_retries + 1} failed for {func.__name__}. "
                        f"Retrying in {delay}s... Error: {str(e)}"
                    )

                    time.sleep(delay)

            # If all retries failed, raise the last exception
            if last_exception:
                raise last_exception

            raise RuntimeError(f"Function {func.__name__} failed without exception")

        return wrapper

    return decorator


def safe_ai_call(func: Callable[..., T], *args: Any, **kwargs: Any) -> dict[str, Any]:
    """
    Safely execute an AI function call with automatic retry and error handling.

    Args:
        func: Function to call (e.g., agent.run)
        *args: Positional arguments for the function
        **kwargs: Keyword arguments for the function

    Returns:
        Dictionary with success status and result or error

    Example:
        result = safe_ai_call(agent.run, "query string")
        if result["success"]:
            print(result["data"])
        else:
            print(result["error"])
    """
    @retry_with_exponential_backoff()
    def _execute():
        return func(*args, **kwargs)

    try:
        data = _execute()
        return {
            "success": True,
            "data": data,
            "error": None
        }
    except Exception as e:
        logger.error(f"AI call failed: {str(e)}")
        return {
            "success": False,
            "data": None,
            "error": str(e)
        }
