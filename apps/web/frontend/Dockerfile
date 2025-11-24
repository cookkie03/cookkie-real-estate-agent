# ============================================================================
# Unified App Dockerfile - Frontend + Backend in one Next.js app
# Optimized for Docker Compose deployment
# ============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
COPY package*.json ../

# Install dependencies
RUN npm install --production=false && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/next.config.js ./
COPY frontend/tailwind.config.ts ./
COPY frontend/postcss.config.js ./

# Copy source code
COPY frontend/src ./src
COPY frontend/public ./public

# Copy Prisma schema (needed for Prisma Client generation)
COPY database/prisma ./database/prisma

# Generate Prisma Client
RUN npx prisma generate --schema=./database/prisma/schema.prisma

# Build application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Set a dummy DATABASE_URL for build time (prevents Prisma connection attempts)
ENV DATABASE_URL="file:./dev.db"
# Skip environment validation during build
ENV SKIP_ENV_VALIDATION=1
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies (netcat for DB health check)
RUN apk add --no-cache netcat-openbsd

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma Client and schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/database/prisma ./database/prisma

# Copy entrypoint script
COPY frontend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create required directories
RUN mkdir -p /app/public/uploads /app/backups && \
    chown -R nextjs:nodejs /app/public/uploads /app/backups

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint for migrations + start
ENTRYPOINT ["/app/docker-entrypoint.sh"]
