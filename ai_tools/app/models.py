"""
SQLAlchemy Models - Import Proxy
================================

This module now imports all models from the shared database/python/models.py
to eliminate code duplication and ensure schema consistency across all Python services.

IMPORTANT: Do not define models here. All models are defined in:
  database/python/models.py (single source of truth)

This file exists only for backwards compatibility with existing imports like:
  from app.models import Contact, Property, etc.
"""

import sys
from pathlib import Path

# Add database/python to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root / "database" / "python"))

# Import all models from shared location
from models import (
    # Core models used by AI tools
    Contact,
    Property,
    Building,
    Request,
    Match,
    Activity,

    # Additional models for completeness
    User,
    UserProfile,
    Tag,
    EntityTag,
    AuditLog,
    CustomFieldDefinition,
    CustomFieldValue,
    ScrapingJob,
    ScrapingSession,
    AgentConversation,
    AgentTask,
    AgentMemory,
    ScrapingSource,

    # Base for type hints
    Base,
)

# Export all models for import
__all__ = [
    # Core models
    "Contact",
    "Property",
    "Building",
    "Request",
    "Match",
    "Activity",

    # Additional models
    "User",
    "UserProfile",
    "Tag",
    "EntityTag",
    "AuditLog",
    "CustomFieldDefinition",
    "CustomFieldValue",
    "ScrapingJob",
    "ScrapingSession",
    "AgentConversation",
    "AgentTask",
    "AgentMemory",
    "ScrapingSource",

    # Base
    "Base",
]
