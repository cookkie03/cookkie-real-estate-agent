"""
==============================================
Database Package for Python
SQLAlchemy models and utilities
==============================================
"""

from .models import (
    Base,
    UserProfile,
    Contact,
    Building,
    Property,
    Request,
    Match,
    Activity,
)

from .database import (
    engine,
    SessionLocal,
    get_db,
    get_db_context,
    init_db,
    check_db_connection,
    get_or_create,
    bulk_insert,
    DATABASE_URL,
)

__all__ = [
    # Models
    "Base",
    "UserProfile",
    "Contact",
    "Building",
    "Property",
    "Request",
    "Match",
    "Activity",
    # Database utilities
    "engine",
    "SessionLocal",
    "get_db",
    "get_db_context",
    "init_db",
    "check_db_connection",
    "get_or_create",
    "bulk_insert",
    "DATABASE_URL",
]
