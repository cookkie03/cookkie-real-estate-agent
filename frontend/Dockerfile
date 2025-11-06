# ============================================================================
# Unified App Dockerfile - Frontend + Backend in one Next.js app
# Optimized for Railway deployment and Docker Desktop
# ============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
COPY package*.json ../

# Install dependencies
RUN npm ci && \
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
COPY database/prisma ../database/prisma

# Generate Prisma Client
RUN cd ../database/prisma && npx prisma generate

# Build application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner

WORKDIR /app

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
COPY --from=builder --chown=nextjs:nodejs /app/../database/prisma ../database/prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
