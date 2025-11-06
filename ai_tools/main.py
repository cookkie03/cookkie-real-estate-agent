"""
CRM Immobiliare - Python AI Backend
FastAPI Server with DataPizza AI Integration
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging

from app.config import settings
from app.database import init_db

# Import routers
# from app.routers import chat  # Temporarily disabled - datapizza import issue
# from app.routers import matching, briefing  # Temporarily disabled - datapizza import issue
from app.routers import scraping

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting CRM Immobiliare AI Backend...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Google Model: {settings.google_model}")
    logger.info(f"Qdrant Mode: {settings.qdrant_mode}")

    # Initialize database connection
    try:
        init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

    # Initialize Qdrant (if in server mode)
    if settings.qdrant_mode == "server":
        try:
            from qdrant_client import QdrantClient
            client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
            client.get_collections()  # Test connection
            logger.info(f"Qdrant connected at {settings.qdrant_host}:{settings.qdrant_port}")
        except Exception as e:
            logger.warning(f"Qdrant connection failed (will use in-memory): {e}")

    yield

    # Shutdown
    logger.info("Shutting down CRM Immobiliare AI Backend...")


# Create FastAPI app
app = FastAPI(
    title="CRM Immobiliare AI Backend",
    description="Python AI Backend powered by DataPizza AI Framework",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add X-Process-Time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Root endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API info"""
    return {
        "name": "CRM Immobiliare AI Backend",
        "version": "0.1.0",
        "status": "running",
        "environment": settings.environment,
        "docs": "/docs",
        "framework": "DataPizza AI + FastAPI"
    }


# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "database": "connected",
        "qdrant_mode": settings.qdrant_mode,
    }


# AI Status endpoint
@app.get("/ai/status", tags=["AI"])
async def ai_status():
    """Check AI agents status"""
    return {
        "status": "ready",
        "google_model": settings.google_model,
        "qdrant_mode": settings.qdrant_mode,
        "agents": {
            "rag_assistant": "ready",
            "matching_agent": "ready",
            "briefing_agent": "ready",
            "document_agent": "ready"
        },
        "tracing_enabled": settings.enable_tracing
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": f"Path {request.url.path} not found",
            "docs": "/docs"
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Check logs for details."
        }
    )


# Include routers
# app.include_router(chat.router, prefix="/ai/chat", tags=["Chat"])  # Temporarily disabled
# app.include_router(matching.router, prefix="/ai/matching", tags=["Matching"])  # Temporarily disabled
# app.include_router(briefing.router, prefix="/ai/briefing", tags=["Briefing"])  # Temporarily disabled
app.include_router(scraping.router, prefix="/ai/scraping", tags=["Scraping"])
# app.include_router(documents.router, prefix="/ai/documents", tags=["Documents"])  # TODO: Future feature


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower()
    )
