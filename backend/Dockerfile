FROM node:20-alpine AS deps

RUN apk add --no-cache openssl

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install 

FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app/backend

COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/public ./public

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

RUN apk add --no-cache openssl wget

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /app/backend/package*.json ./
COPY --from=builder --chown=node:node /app/backend/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/backend/dist ./dist
COPY --from=builder --chown=node:node /app/backend/prisma ./prisma
COPY --from=builder --chown=node:node /app/backend/public ./public

RUN mkdir -p storage/invoices storage/documents uploads/tenant-logos \
  && chown -R node:node /app/backend

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/health || exit 1

CMD ["npm", "start"]
