"""
==============================================
Scraping Logger Utility
Structured JSON logging for web scraping
==============================================
"""

import logging
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, Optional
import os

# Ensure logs directory exists
LOGS_DIR = Path(__file__).parent.parent.parent / "logs" / "scraping"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Log file paths
LOG_FILE = LOGS_DIR / "scraper.log"
ERROR_LOG_FILE = LOGS_DIR / "error.log"


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "message": record.getMessage(),
            "service": "crm-scraping",
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": self.formatException(record.exc_info)
                if record.exc_info
                else None,
            }

        # Add extra fields from record
        if hasattr(record, "extra_data"):
            log_data.update(record.extra_data)

        return json.dumps(log_data)


class ColoredConsoleFormatter(logging.Formatter):
    """Colored formatter for console output"""

    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        "INFO": "\033[32m",  # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors"""
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname:8s}{self.RESET}"
        return super().format(record)


def setup_logger(
    name: str = "scraping",
    level: str = None,
    log_to_file: bool = True,
    log_to_console: bool = True,
) -> logging.Logger:
    """
    Setup and return a configured logger

    Args:
        name: Logger name
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Whether to log to file
        log_to_console: Whether to log to console

    Returns:
        Configured logger instance
    """
    # Get log level from environment or use default
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO" if os.getenv("ENV") == "production" else "DEBUG")

    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))

    # Remove existing handlers
    logger.handlers.clear()

    # Console handler
    if log_to_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)

        # Use colored formatter for development
        if os.getenv("ENV") != "production":
            console_formatter = ColoredConsoleFormatter(
                "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        else:
            console_formatter = logging.Formatter(
                "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )

        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)

    # File handlers (JSON format)
    if log_to_file:
        # All logs
        file_handler = logging.FileHandler(LOG_FILE)
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(JSONFormatter())
        logger.addHandler(file_handler)

        # Error logs only
        error_handler = logging.FileHandler(ERROR_LOG_FILE)
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(JSONFormatter())
        logger.addHandler(error_handler)

    return logger


# Create default logger instance
logger = setup_logger()


def log_scraping_session(
    source: str,
    url: str,
    items_scraped: int,
    duration: float,
    success: bool = True,
    error: Optional[str] = None,
):
    """Log scraping session with structured data"""
    extra_data = {
        "type": "scraping_session",
        "source": source,
        "url": url,
        "items_scraped": items_scraped,
        "duration": duration,
        "success": success,
    }

    if error:
        extra_data["error"] = error

    if success:
        logger.info(
            f"Scraped {items_scraped} items from {source} in {duration:.2f}s",
            extra={"extra_data": extra_data},
        )
    else:
        logger.error(
            f"Scraping failed for {source}: {error}",
            extra={"extra_data": extra_data},
        )


def log_http_request(
    method: str,
    url: str,
    status_code: int,
    duration: float,
    success: bool = True,
):
    """Log HTTP request with structured data"""
    extra_data = {
        "type": "http_request",
        "method": method,
        "url": url,
        "status_code": status_code,
        "duration": duration,
        "success": success,
    }

    logger.debug(
        f"{method} {url} - {status_code} ({duration:.2f}ms)",
        extra={"extra_data": extra_data},
    )


def log_parsing(
    source: str,
    items_parsed: int,
    duration: float,
    errors: int = 0,
):
    """Log parsing operation"""
    logger.info(
        f"Parsed {items_parsed} items from {source} ({errors} errors) in {duration:.2f}s",
        extra={
            "extra_data": {
                "type": "parsing",
                "source": source,
                "items_parsed": items_parsed,
                "errors": errors,
                "duration": duration,
            }
        },
    )


# Export logger and utilities
__all__ = [
    "logger",
    "setup_logger",
    "log_scraping_session",
    "log_http_request",
    "log_parsing",
]
