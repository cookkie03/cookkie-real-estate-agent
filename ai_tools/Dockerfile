# ============================================================================
# AI Tools Dockerfile - Python FastAPI
# Optimized for Railway deployment and local Docker Desktop
# ============================================================================

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --gid 1001 python && \
    useradd --uid 1001 --gid python --shell /bin/bash --create-home python

# Copy requirements
COPY ai_tools/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ai_tools/app ./app
COPY ai_tools/main.py ./
COPY database/python ./database/python

# Set ownership
RUN chown -R python:python /app

# Switch to non-root user
USER python

# Environment
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["python", "main.py"]
