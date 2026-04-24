# ── Build stage ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ── Production stage ─────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -g 1001 -S scamguard && \
    adduser -S scamguard -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/
COPY routes/ ./routes/
COPY data/ ./data/

# Ensure data directory is writable
RUN chown -R scamguard:scamguard /app/data

USER scamguard

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
