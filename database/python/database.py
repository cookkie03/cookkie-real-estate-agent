"""
==============================================
Database Connection Utility for Python
SQLAlchemy session management
==============================================
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from pathlib import Path
import os
from typing import Generator

# Database file path (relative to project root)
DB_PATH = Path(__file__).parent.parent / "prisma" / "dev.db"

# Ensure database directory exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Create engine
# For SQLite, use StaticPool to avoid connection issues
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    poolclass=StaticPool,
    echo=os.getenv("SQL_DEBUG", "false").lower() == "true",  # Log SQL queries if SQL_DEBUG=true
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.

    Usage with FastAPI:
        from fastapi import Depends
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            items = db.query(Item).all()
            return items

    Usage standalone:
        db = next(get_db())
        try:
            items = db.query(Item).all()
        finally:
            db.close()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database session.

    Usage:
        with get_db_context() as db:
            items = db.query(Item).all()
            # Session automatically closed
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.

    WARNING: This will create tables if they don't exist.
    In production, use Prisma migrations instead.
    """
    from .models import Base

    Base.metadata.create_all(bind=engine)


def check_db_connection() -> bool:
    """
    Check if database connection is working.

    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        with get_db_context() as db:
            # Simple query to test connection
            db.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False


# Helper functions for common operations
def get_or_create(session: Session, model, defaults=None, **kwargs):
    """
    Get an existing instance or create a new one.

    Args:
        session: SQLAlchemy session
        model: Model class
        defaults: Default values for new instance
        **kwargs: Filter criteria

    Returns:
        tuple: (instance, created) where created is bool
    """
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance, False
    else:
        params = dict(kwargs)
        if defaults:
            params.update(defaults)
        instance = model(**params)
        session.add(instance)
        session.commit()
        return instance, True


def bulk_insert(session: Session, instances: list):
    """
    Bulk insert multiple instances.

    Args:
        session: SQLAlchemy session
        instances: List of model instances
    """
    session.bulk_save_objects(instances)
    session.commit()


# Export main components
__all__ = [
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
