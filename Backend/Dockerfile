# ─────────────────────────────────────────────────────────────
# Backend Dockerfile - Multi-stage build for Node.js Express API
# ─────────────────────────────────────────────────────────────

# Stage 1: Build dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --only=production

# Stage 2: Production image
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create uploads directory
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "index.js"]
