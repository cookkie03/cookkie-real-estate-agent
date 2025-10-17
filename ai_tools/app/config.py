"""
Configuration Management
Loads environment variables and provides typed config access
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from typing import List, Union
import os


class Settings(BaseSettings):
    """Application settings from environment variables"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Database
    database_url: str = Field(
        default="sqlite:///../database/prisma/dev.db",
        alias="DATABASE_URL",
        description="SQLite database URL (shared with Prisma)"
    )

    # Google AI
    google_api_key: str = Field(
        ...,
        alias="GOOGLE_API_KEY",
        description="Google AI Studio API Key"
    )
    google_model: str = Field(
        default="gemini-1.5-pro",
        alias="GOOGLE_MODEL",
        description="Default Google Gemini model"
    )

    # Qdrant Vector Store
    qdrant_mode: str = Field(
        default="memory",
        alias="QDRANT_MODE",
        description="Qdrant mode: 'memory' or 'server'"
    )
    qdrant_host: str = Field(
        default="localhost",
        alias="QDRANT_HOST"
    )
    qdrant_port: int = Field(
        default=6333,
        alias="QDRANT_PORT"
    )

    # Caching
    cache_dir: str = Field(
        default=".cache",
        alias="CACHE_DIR"
    )
    cache_ttl: int = Field(
        default=3600,
        alias="CACHE_TTL",
        description="Cache TTL in seconds"
    )

    # FastAPI Server
    host: str = Field(
        default="127.0.0.1",
        alias="HOST"
    )
    port: int = Field(
        default=8000,
        alias="PORT"
    )
    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="CORS_ORIGINS",
        description="CORS allowed origins (comma-separated in .env)"
    )
    environment: str = Field(
        default="development",
        alias="ENVIRONMENT"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list"""
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(',')]
        return self.cors_origins

    # Logging
    log_level: str = Field(
        default="INFO",
        alias="LOG_LEVEL"
    )
    log_format: str = Field(
        default="console",
        alias="LOG_FORMAT",
        description="Log format: 'json' or 'console'"
    )

    # OpenTelemetry Tracing
    enable_tracing: bool = Field(
        default=True,
        alias="ENABLE_TRACING"
    )
    service_name: str = Field(
        default="crm-immobiliare-ai",
        alias="SERVICE_NAME"
    )

    # AI Configuration
    ai_temperature: float = Field(
        default=0.7,
        alias="AI_TEMPERATURE",
        ge=0.0,
        le=1.0
    )
    ai_max_tokens: int = Field(
        default=2048,
        alias="AI_MAX_TOKENS"
    )
    ai_timeout: int = Field(
        default=60,
        alias="AI_TIMEOUT",
        description="AI request timeout in seconds"
    )

    # RAG Configuration
    rag_top_k: int = Field(
        default=5,
        alias="RAG_TOP_K",
        description="Number of documents to retrieve"
    )
    rag_chunk_size: int = Field(
        default=512,
        alias="RAG_CHUNK_SIZE"
    )
    rag_chunk_overlap: int = Field(
        default=50,
        alias="RAG_CHUNK_OVERLAP"
    )
    embedding_model: str = Field(
        default="models/text-embedding-004",
        alias="EMBEDDING_MODEL",
        description="Google embedding model"
    )


# Global settings instance
settings = Settings()


# Ensure cache directory exists
os.makedirs(settings.cache_dir, exist_ok=True)


def get_settings() -> Settings:
    """Dependency injection for FastAPI"""
    return settings
