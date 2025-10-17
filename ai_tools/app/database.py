"""
Database Connection and Models
SQLAlchemy setup to access shared SQLite database with Prisma
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.config import settings

# Create SQLAlchemy engine
# Note: check_same_thread=False is needed for SQLite with FastAPI
engine = create_engine(
    settings.database_url.replace("file:", ""),
    connect_args={"check_same_thread": False},
    echo=settings.environment == "development",  # Log SQL in dev
    pool_pre_ping=True,  # Verify connections before using
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions.

    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Property).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database initialization (if needed)
def init_db():
    """
    Initialize database.
    Note: We don't create tables here since Prisma manages the schema.
    This is just for verification.
    """
    # Import all models to ensure they're registered
    from app import models  # noqa: F401

    # Optionally verify connection
    try:
        with engine.connect() as conn:
            print("Database connection successful")
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise
