# Backend Dockerfile
FROM node:20-alpine

# Install OpenSSL (required by Prisma on Alpine)
RUN apk add --no-cache openssl

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema and migrations
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/public ./public

# Build TypeScript
RUN npm run build

# Create persistent storage directories
RUN mkdir -p storage/invoices uploads/tenant-logos

# Expose port
EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
