# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code and config
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/next.config.js ./
COPY frontend/tsconfig.json ./
COPY frontend/next-env.d.ts ./

# Build Next.js (outputs standalone bundle)
RUN npm run build

# Production image — minimal standalone server
FROM node:20-alpine

WORKDIR /app/frontend

# Copy standalone server and its bundled node_modules
COPY --from=builder /app/frontend/.next/standalone ./

# Copy static assets
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone output exposes a self-contained server.js
CMD ["node", "server.js"]
