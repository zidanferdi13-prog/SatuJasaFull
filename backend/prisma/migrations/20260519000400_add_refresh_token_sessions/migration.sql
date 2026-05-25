CREATE TABLE "refresh_token_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_token_sessions_tokenHash_key" ON "refresh_token_sessions"("tokenHash");
CREATE INDEX "refresh_token_sessions_userId_idx" ON "refresh_token_sessions"("userId");
CREATE INDEX "refresh_token_sessions_tenantId_idx" ON "refresh_token_sessions"("tenantId");
CREATE INDEX "refresh_token_sessions_family_idx" ON "refresh_token_sessions"("family");
CREATE INDEX "refresh_token_sessions_expiresAt_idx" ON "refresh_token_sessions"("expiresAt");

ALTER TABLE "refresh_token_sessions" ADD CONSTRAINT "refresh_token_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "refresh_token_sessions" ADD CONSTRAINT "refresh_token_sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
