"""
Configuration Management
Loads environment variables and provides typed config access
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Database
    database_url: str = Field(
        default="sqlite:///../prisma/dev.db",
        env="DATABASE_URL",
        description="SQLite database URL (shared with Prisma)"
    )

    # Google AI
    google_api_key: str = Field(
        ...,
        env="GOOGLE_API_KEY",
        description="Google AI Studio API Key"
    )
    google_model: str = Field(
        default="gemini-1.5-pro",
        env="GOOGLE_MODEL",
        description="Default Google Gemini model"
    )

    # Qdrant Vector Store
    qdrant_mode: str = Field(
        default="memory",
        env="QDRANT_MODE",
        description="Qdrant mode: 'memory' or 'server'"
    )
    qdrant_host: str = Field(
        default="localhost",
        env="QDRANT_HOST"
    )
    qdrant_port: int = Field(
        default=6333,
        env="QDRANT_PORT"
    )

    # Caching
    cache_dir: str = Field(
        default=".cache",
        env="CACHE_DIR"
    )
    cache_ttl: int = Field(
        default=3600,
        env="CACHE_TTL",
        description="Cache TTL in seconds"
    )

    # FastAPI Server
    host: str = Field(
        default="127.0.0.1",
        env="HOST"
    )
    port: int = Field(
        default=8000,
        env="PORT"
    )
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        env="CORS_ORIGINS",
        description="CORS allowed origins (comma-separated in .env)"
    )
    environment: str = Field(
        default="development",
        env="ENVIRONMENT"
    )

    # Logging
    log_level: str = Field(
        default="INFO",
        env="LOG_LEVEL"
    )
    log_format: str = Field(
        default="console",
        env="LOG_FORMAT",
        description="Log format: 'json' or 'console'"
    )

    # OpenTelemetry Tracing
    enable_tracing: bool = Field(
        default=True,
        env="ENABLE_TRACING"
    )
    service_name: str = Field(
        default="crm-immobiliare-ai",
        env="SERVICE_NAME"
    )

    # AI Configuration
    ai_temperature: float = Field(
        default=0.7,
        env="AI_TEMPERATURE",
        ge=0.0,
        le=1.0
    )
    ai_max_tokens: int = Field(
        default=2048,
        env="AI_MAX_TOKENS"
    )
    ai_timeout: int = Field(
        default=60,
        env="AI_TIMEOUT",
        description="AI request timeout in seconds"
    )

    # RAG Configuration
    rag_top_k: int = Field(
        default=5,
        env="RAG_TOP_K",
        description="Number of documents to retrieve"
    )
    rag_chunk_size: int = Field(
        default=512,
        env="RAG_CHUNK_SIZE"
    )
    rag_chunk_overlap: int = Field(
        default=50,
        env="RAG_CHUNK_OVERLAP"
    )
    embedding_model: str = Field(
        default="models/text-embedding-004",
        env="EMBEDDING_MODEL",
        description="Google embedding model"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Parse comma-separated strings to lists
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == 'cors_origins':
                return [x.strip() for x in raw_val.split(',')]
            return raw_val


# Global settings instance
settings = Settings()


# Ensure cache directory exists
os.makedirs(settings.cache_dir, exist_ok=True)


def get_settings() -> Settings:
    """Dependency injection for FastAPI"""
    return settings
