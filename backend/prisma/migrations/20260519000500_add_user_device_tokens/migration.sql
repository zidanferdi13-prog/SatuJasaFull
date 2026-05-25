CREATE TABLE "user_device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_device_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_device_tokens_token_key" ON "user_device_tokens"("token");
CREATE INDEX "user_device_tokens_userId_idx" ON "user_device_tokens"("userId");
CREATE INDEX "user_device_tokens_tenantId_idx" ON "user_device_tokens"("tenantId");
CREATE INDEX "user_device_tokens_isActive_idx" ON "user_device_tokens"("isActive");

ALTER TABLE "user_device_tokens" ADD CONSTRAINT "user_device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_device_tokens" ADD CONSTRAINT "user_device_tokens_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
