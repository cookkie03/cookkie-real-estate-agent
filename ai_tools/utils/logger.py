"""
==============================================
AI Tools Logger Utility
Structured JSON logging for Python
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
LOGS_DIR = Path(__file__).parent.parent.parent / "logs" / "ai_tools"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Log file paths
LOG_FILE = LOGS_DIR / "app.log"
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
            "service": "crm-ai-tools",
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
    name: str = "ai_tools",
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


def log_ai_operation(
    operation: str,
    model: str,
    tokens: Optional[int] = None,
    duration: Optional[float] = None,
    success: bool = True,
    error: Optional[str] = None,
):
    """Log AI operation with structured data"""
    extra_data = {
        "type": "ai_operation",
        "operation": operation,
        "model": model,
        "tokens": tokens,
        "duration": duration,
        "success": success,
    }

    if error:
        extra_data["error"] = error

    if success:
        logger.info(
            f"AI operation '{operation}' completed with {model}",
            extra={"extra_data": extra_data},
        )
    else:
        logger.error(
            f"AI operation '{operation}' failed: {error}",
            extra={"extra_data": extra_data},
        )


def log_database_operation(
    operation: str,
    table: str,
    duration: float,
    success: bool = True,
    error: Optional[str] = None,
):
    """Log database operation with structured data"""
    extra_data = {
        "type": "database_operation",
        "operation": operation,
        "table": table,
        "duration": duration,
        "success": success,
    }

    if error:
        extra_data["error"] = error

    if success:
        logger.debug(
            f"Database {operation} on {table} - {duration:.2f}ms",
            extra={"extra_data": extra_data},
        )
    else:
        logger.error(
            f"Database {operation} on {table} failed: {error}",
            extra={"extra_data": extra_data},
        )


def log_matching(
    property_id: str,
    client_id: str,
    score: float,
    duration: float,
):
    """Log property-client matching operation"""
    logger.info(
        f"Match calculated: Property {property_id} <-> Client {client_id} (score: {score})",
        extra={
            "extra_data": {
                "type": "matching",
                "property_id": property_id,
                "client_id": client_id,
                "score": score,
                "duration": duration,
            }
        },
    )


# Export logger and utilities
__all__ = [
    "logger",
    "setup_logger",
    "log_ai_operation",
    "log_database_operation",
    "log_matching",
]
