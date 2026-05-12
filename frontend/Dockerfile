# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code and config
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/next.config.js ./
COPY frontend/tsconfig.json ./
COPY frontend/next-env.d.ts ./

# Build Next.js
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built app from builder
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/src ./src
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/next.config.js ./

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["npm", "start"]
