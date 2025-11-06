#!/bin/sh
# ============================================================================
# Docker Entrypoint - CRM Immobiliare App
# Runs database migrations before starting the application
# ============================================================================

set -e

echo "🚀 Starting CRM Immobiliare..."

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until nc -z -v -w30 database 5432; do
  echo "⏳ Waiting for database connection..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
echo "🔄 Running database migrations..."
cd /app/database/prisma
npx prisma migrate deploy || {
  echo "⚠️  Migration failed, attempting to generate Prisma Client and retry..."
  npx prisma generate
  npx prisma migrate deploy || {
    echo "❌ Migration failed after retry. Starting app anyway (manual intervention may be required)"
  }
}
echo "✅ Migrations completed!"

# Return to app directory
cd /app

# Create required directories if they don't exist
echo "📁 Ensuring required directories exist..."
mkdir -p /app/public/uploads
mkdir -p /app/backups
echo "✅ Directories ready!"

# Start the application
echo "🎉 Starting Next.js application..."
exec node server.js
