# ── Build Stage ──
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

# ── Runtime Stage ──
FROM node:20-alpine

WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S vanguard && \
    adduser -S vanguard -u 1001 -G vanguard

# Copy deps and source
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER vanguard

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start
CMD ["node", "src/server.js"]
