"""
Database Connection and Models
SQLAlchemy setup to access shared SQLite database with Prisma

IMPORTANT: This module now uses the shared database configuration and models
from database/python to eliminate duplication and ensure consistency.
"""

import sys
import os
from pathlib import Path
from typing import Generator
from sqlalchemy.orm import Session
from app.config import settings

# Add database/python to path for importing shared models
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root / "database" / "python"))

# Import shared database components from database/python
from database import engine as shared_engine, SessionLocal as SharedSessionLocal, get_db as shared_get_db
from models import Base  # Import Base from shared models

# Use shared engine and session factory to ensure consistency
engine = shared_engine
SessionLocal = SharedSessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions.

    This now wraps the shared get_db function from database/python
    to ensure consistency across all Python services.

    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Property).all()
    """
    # Use shared get_db implementation
    yield from shared_get_db()


# Database initialization (if needed)
def init_db():
    """
    Initialize database.
    Note: We don't create tables here since Prisma manages the schema.
    This function now imports shared models to ensure consistency.
    """
    # Import all shared models to ensure they're registered with Base
    import models  # This imports from database/python/models.py

    # Optionally verify connection
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful (ai_tools using shared DB)")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise


# Export for compatibility
__all__ = ["engine", "SessionLocal", "Base", "get_db", "init_db"]
