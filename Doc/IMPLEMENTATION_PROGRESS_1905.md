# Implementation Progress — Audit Roadmap

Tanggal: 19 Mei 2026

Dokumen ini mencatat posisi implementasi terakhir dari roadmap audit `Doc/LAST_AUDIT_1805.md`.

## Status Umum

Progress saat ini berada di **Phase C — MEDIUM**, tepatnya:

- **Phase B B1 sampai B15 + checkpoint sudah selesai**
- **C1 sampai C9 sudah selesai**
- **C10 sedang akan dimulai: Audit middleware capture `before`**

## Phase A — CRITICAL — SELESAI

Checklist Phase A:

- [x] A1. Hapus JWT secret fallback + buat env validation di `backend/src/config/env.ts`
- [x] A2. Hapus `console.log` password leak di auth service
- [x] A3. Pasang rate limiter dengan benar:
  - global limiter `/api/v1`
  - login limiter
  - refresh limiter
  - register tenant limiter
  - tracking public limiter
- [x] A4. Tenant isolation via Prisma `$extends` + AsyncLocalStorage
- [x] A5. HttpOnly Secure cookie dari backend
- [x] A6. Token revocation via Redis blocklist
- [x] A7. Hapus folder legacy kosong backend
- [x] A8. Hapus permission `RECORD_AUDIO` di mobile
- [x] A9. Fix nginx port + docker-compose password/restart/Redis auth
- [x] A10. Setup Vitest + Supertest + test kritikal

Verifikasi Phase A terakhir:

- [x] Backend `typecheck` pass
- [x] Backend `test` pass
- [x] Backend `build` pass
- [x] Backend `lint` 0 error, masih ada warning non-blocking existing
- [x] Frontend `typecheck` pass
- [x] Mobile `typecheck` pass

## Phase B — HIGH — SELESAI

### B1. WhatsApp provider nyata — SELESAI

- [x] `WHATSAPP_PROVIDER=none|fonnte|wablas`
- [x] `WHATSAPP_API_URL`
- [x] `WHATSAPP_API_KEY` / `WHATSAPP_API_TOKEN`
- [x] Mode `none` tetap dry-run logger untuk dev
- [x] Fonnte/Wablas HTTP integration di `backend/src/shared/services/whatsapp.service.ts`

### B2. Upload dokumen transaksi — SELESAI

- [x] Model Prisma `TransactionDocument`
- [x] Migration `20260519000100_add_transaction_documents`
- [x] Endpoint:
  - `GET /api/v1/transactions/:id/documents`
  - `POST /api/v1/transactions/:id/items/:itemId/documents`
  - `DELETE /api/v1/transactions/:id/documents/:documentId`
- [x] File validation:
  - JPEG
  - PNG
  - PDF
  - max 5MB
- [x] Storage lokal via `DOCUMENT_STORAGE_PATH`
- [x] Prisma client generated
- [x] Migration sudah applied ke DB

### B3. STNK expiry tracking + reminder — SELESAI

- [x] `Vehicle.tenantId`
- [x] `Vehicle.stnkExpiryDate`
- [x] Migration `20260519000200_add_vehicle_tenant_and_stnk_expiry`
- [x] Backfill `Vehicle.tenantId` dari `Customer.tenantId`
- [x] Job reminder H-30, H-14, H-7, H-1 di `backend/src/jobs/stnk-expiry.job.ts`
- [x] Migration sudah applied ke DB

### B4. Soft delete — SELESAI

- [x] Tambah `deletedAt` di:
  - Branch
  - User
  - Customer
  - Vehicle
  - ServiceType
  - MasterFeeRule
  - PricingRule
  - Transaction
- [x] Migration `20260519000300_add_soft_delete_fields`
- [x] Prisma extension auto exclude `deletedAt != null` untuk read query
- [x] Prisma extension convert `delete/deleteMany` menjadi update `deletedAt`
- [x] Migration sudah applied ke DB

### B5. Refresh token rotation + reuse detection — SELESAI

- [x] Model Prisma `RefreshTokenSession`
- [x] Migration `20260519000400_add_refresh_token_sessions`
- [x] Refresh token disimpan hashed SHA-256
- [x] Refresh token di-rotate setiap refresh
- [x] Reuse detection: token lama yang sudah revoked akan revoke satu family
- [x] Test token rotation ditambahkan
- [x] Test terakhir: 12 tests pass
- [x] Migration sudah applied ke DB

### B6. BullMQ repeatable scheduler — SELESAI

- [x] Hapus `setInterval` daily jobs di `backend/src/server.ts`
- [x] Scheduler baru di `backend/src/jobs/scheduler.ts`
- [x] Repeatable jobs:
  - subscription expiry: `0 2 * * *`
  - overdue transactions: `0 3 * * *`
  - STNK expiry: `0 8 * * *`
- [x] Backend typecheck pass

### B7. Push notifications — SELESAI

Backend:

- [x] Model Prisma `UserDeviceToken`
- [x] Migration `20260519000500_add_user_device_tokens`
- [x] Migration sudah applied ke DB
- [x] Endpoint `POST /api/v1/notifications/devices`
- [x] Service Expo Push API di `backend/src/shared/services/push.service.ts`
- [x] Push notification dipicu saat transaksi baru dibuat
- [x] Backend typecheck pass

Mobile:

- [x] Install `expo-notifications`
- [x] Install `expo-device`
- [x] Service `mobile/src/shared/services/push.ts`
- [x] Register push token saat user login/hydrated di `mobile/src/app/_layout.tsx`
- [x] Plugin `expo-notifications` ditambahkan di `mobile/app.json`
- [x] Mobile typecheck pass

Catatan B7:

- `npm install` di mobile melaporkan vulnerabilities dari dependency tree existing.
- `npm audit fix --force` **belum dijalankan** karena bisa breaking.

### B8. Sinkron README — SELESAI

- [x] Role aktual disesuaikan menjadi `SUPER_ADMIN`, `OWNER`, `ADMIN`
- [x] Klaim tabel lama `13 tables` diganti menjadi `24 Prisma models`
- [x] Klaim Twilio diganti menjadi provider WhatsApp: `none`, `fonnte`, `wablas`
- [x] Klaim Tailwind-ready diganti menjadi styling CSS aktual
- [x] Auth README disesuaikan dengan HttpOnly cookie + refresh rotation
- [x] Upload dokumen, STNK reminder, BullMQ scheduler, dan Expo push notifications dicatat

## Posisi Terakhir

Berhenti di:

- **Phase C — C10: Audit middleware capture `before`**

Belum dikerjakan:

- [x] B8. Sinkronkan README
- [x] B9. Tambah CI pipeline minimal
- [x] B10. Setup Sentry backend + mobile
- [x] B11. Privacy Policy publik + account deletion endpoint
- [x] B12. Adaptive icon Android
- [x] B13. Backend Dockerfile multi-stage + USER node + HEALTHCHECK
- [x] B14. Denormalize `tenantId` di `TransactionItem`, `Payment`, `TransactionLog`
- [x] B15. CORS + Helmet CSP hardening
- [x] Phase B checkpoint full verification
- [x] C1. `sortField` whitelist + `limit` guard
- [x] C2. `TransactionStatus.CANCELLED`
- [x] C3. Assignment PIC
- [x] C4. Payment methods baru
- [x] C5. Pricing history versioned
- [x] C6. Request ID middleware + correlation log
- [x] C7. OpenAPI dari Zod
- [x] C8. Frontend Error Boundary
- [x] C9. Mobile offline TanStack Query persist
- [ ] C10. Audit middleware capture `before`
- [ ] C11. ESLint + Prettier shared + husky + lint-staged
- [ ] C12. Mount/cleanup modul belum di-wire
- [ ] C13. Helmet limits + JSON body size
- [ ] Phase C checkpoint full verification

## Next Plan Detail

### B8. Sinkronkan README — SELESAI

`README.md` sudah disinkronkan dengan kondisi aktual Phase A dan B1-B7.

### B9. CI Pipeline Minimal — SELESAI

- [x] `.github/workflows/ci.yml` dibuat
- [x] Trigger untuk `pull_request` dan push ke `master`/`main`
- [x] Backend job:
  - npm ci
  - prisma generate
  - npm run typecheck
  - npm run test
  - npm run build
  - npm run lint
- [x] Backend CI memakai service container PostgreSQL 15 dan Redis 7
- [x] Env dummy CI disiapkan untuk `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ALLOWED_ORIGINS`, `WHATSAPP_PROVIDER`, `DOCUMENT_STORAGE_PATH`
- [x] Frontend job:
  - npm ci
  - npm run typecheck
  - npm run build
- [x] Mobile job:
  - npm ci
  - npm run typecheck
- [x] Verifikasi lokal: backend/frontend/mobile `typecheck` pass

### B10. Sentry backend + mobile — SELESAI

- [x] Backend dependency `@sentry/node` terpasang
- [x] Backend env optional `SENTRY_DSN` ditambahkan
- [x] Backend init Sentry optional-by-env di `backend/src/config/sentry.ts`
- [x] Backend capture exception 500+ di error middleware
- [x] Mobile dependency `@sentry/react-native` terpasang
- [x] Mobile env optional `EXPO_PUBLIC_SENTRY_DSN` dipakai di `mobile/src/shared/services/sentry.ts`
- [x] Root layout mobile dibungkus `Sentry.wrap`
- [x] Backend `typecheck` pass
- [x] Mobile `typecheck` pass

Catatan B10:

- `npm install` backend melaporkan 4 moderate vulnerabilities.
- `npm install` mobile melaporkan 42 vulnerabilities dari dependency tree.
- `npm audit fix` / `npm audit fix --force` **belum dijalankan** karena bisa breaking.

### B11. Privacy Policy publik + account deletion endpoint — SELESAI

- [x] Halaman publik privacy policy dibuat di frontend route `/privacy`
- [x] Endpoint `DELETE /api/v1/auth/me` ditambahkan
- [x] Account deletion memakai soft delete: `isActive=false` + `deletedAt`
- [x] Refresh token sessions user direvoke saat akun dihapus
- [x] Current access token diblocklist di Redis saat akun dihapus
- [x] Auth cookies dibersihkan setelah akun dihapus
- [x] Backend `typecheck` pass
- [x] Frontend `typecheck` pass
- [x] Backend `test` pass: 12 tests

### B12. Adaptive icon Android — SELESAI

- [x] `mobile/app.json` ditambahkan `android.adaptiveIcon`
- [x] `foregroundImage` memakai asset existing `./assets/icon.png`
- [x] `backgroundColor` diset `#FFFFFF`
- [x] Mobile `typecheck` pass

Catatan B12:

- Asset khusus `mobile/assets/adaptive-icon.png` belum ada, jadi konfigurasi memakai `icon.png` agar adaptive icon Android sudah aktif tanpa menambah asset baru.

### B13. Backend Dockerfile multi-stage + USER node + HEALTHCHECK — SELESAI

- [x] `backend/Dockerfile` direfactor menjadi multi-stage: `deps`, `builder`, `runtime`
- [x] Runtime image hanya membawa production dependencies, `dist`, `prisma`, dan `public`
- [x] Runtime berjalan sebagai `USER node`
- [x] Storage directory dibuat dan ownership diset ke `node`
- [x] `HEALTHCHECK` ditambahkan ke endpoint `/health`
- [x] Backend `typecheck` pass
- [x] Backend `build` pass
- [x] Docker image build pass: `jasaku-backend:b13`

Catatan B13:

- Docker build masih melaporkan npm audit vulnerabilities dari dependency tree; `npm audit fix` / `--force` belum dijalankan karena bisa breaking.

### B14. Denormalize `tenantId` di tabel anak — SELESAI

- [x] `TransactionItem.tenantId` ditambahkan + index
- [x] `Payment.tenantId` ditambahkan + index
- [x] `TransactionLog.tenantId` ditambahkan + index
- [x] Migration `20260527000100_denormalize_transaction_child_tenant` dibuat
- [x] Migration melakukan backfill `tenantId` dari parent `transactions`
- [x] Create transaction item sekarang mengisi `tenantId`
- [x] Create payment sekarang mengisi `tenantId`
- [x] Create transaction log sekarang mengisi `tenantId`
- [x] Prisma client generated
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 12 tests

Catatan B14:

- Migration belum diaplikasikan ke DB lokal pada step ini; jalankan `cd backend && npx prisma migrate deploy && npx prisma generate` saat DB siap.

### B15. CORS + Helmet CSP hardening — SELESAI

- [x] `ALLOWED_ORIGINS` diparse strict dengan trim/filter
- [x] Origin tanpa header tetap diizinkan untuk non-browser/server-to-server request
- [x] Origin browser yang tidak whitelist akan ditolak
- [x] Origin yang ditolak dicatat via logger warning
- [x] Helmet CSP eksplisit ditambahkan:
  - `defaultSrc 'self'`
  - `baseUri 'self'`
  - `objectSrc 'none'`
  - `frameAncestors 'self'`
  - `connectSrc 'self'` + origin whitelist
  - `upgradeInsecureRequests` hanya production
- [x] Cross origin resource policy diset `cross-origin` agar static uploads/public tetap bisa diakses sesuai kebutuhan aplikasi
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 12 tests
- [x] Backend `build` pass

### Phase B Checkpoint — SELESAI

- [x] Migration B14 applied ke DB lokal: `20260527000100_denormalize_transaction_child_tenant`
- [x] Prisma client generated
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 12 tests
- [x] Backend `build` pass
- [x] Backend `lint` pass dengan 0 error dan 3 warning existing
- [x] Frontend `typecheck` pass
- [x] Mobile `typecheck` pass

Catatan checkpoint:

- Warning lint backend masih non-blocking di:
  - `backend/src/modules/tenant/tenant.routes.ts`
  - `backend/src/modules/transaction/transaction.service.ts`

## Phase C — MEDIUM — BERJALAN

### C1. `sortField` whitelist + `limit` guard — SELESAI

- [x] `getPagination()` sudah membatasi `limit` maksimal 100
- [x] Helper `getSort()` ditambahkan di `backend/src/shared/utils/pagination.ts`
- [x] Sort field transaksi di-whitelist:
  - `created_at`
  - `updated_at`
  - `invoice_number`
  - `status`
  - `estimated_total`
  - `final_total`
- [x] Sort field invalid akan menghasilkan error 400
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 12 tests
- [x] Backend `build` pass

### C2. `TransactionStatus.CANCELLED` — SELESAI

- [x] Enum Prisma `TransactionStatus.CANCELLED` ditambahkan
- [x] Migration `20260527000200_add_cancelled_transaction_status` dibuat dan applied ke DB lokal
- [x] Constants status/transitions ditambahkan untuk `CANCELLED`
- [x] Endpoint `POST /api/v1/transactions/:id/cancel` ditambahkan
- [x] Schema cancel mewajibkan `reason`
- [x] Service cancel menolak transaksi `CLOSED`/`CANCELLED`
- [x] Service cancel set `remainingAmount=0`, `refundAmount=dpAmount`, dan `notes=reason`
- [x] Jika ada DP, service membuat payment `REFUND`
- [x] Transaction log `CANCELLED` dibuat dengan alasan
- [x] Test lifecycle cancel ditambahkan
- [x] Prisma client generated
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 14 tests
- [x] Backend `build` pass

### C3. Assignment PIC — SELESAI

- [x] `Transaction.assignedToUserId` ditambahkan
- [x] Relasi optional `Transaction.assignedTo` ke `User` ditambahkan
- [x] Index `transactions_assignedToUserId_idx` ditambahkan
- [x] Migration `20260527000300_add_transaction_assignee` dibuat dan applied ke DB lokal
- [x] Endpoint `PATCH /api/v1/transactions/:id/assign` ditambahkan
- [x] Schema assign menerima UUID user aktif atau `null` untuk clear assignment
- [x] Service assign memvalidasi assignee tenant sama, aktif, dan belum soft-deleted
- [x] Transaction list/detail include data assignee
- [x] Transaction log dibuat saat assignment diubah atau dibersihkan
- [x] Test lifecycle assignment ditambahkan
- [x] Prisma client generated
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 16 tests
- [x] Backend `build` pass

### C4. Payment methods baru — SELESAI

- [x] Enum Prisma `PaymentMethod` diperluas menjadi `CASH`, `TRANSFER`, `QRIS`, `VA`, `EDC`
- [x] Field `Payment.referenceNumber` ditambahkan
- [x] Migration `20260527000400_add_payment_methods` dibuat dan applied ke DB lokal
- [x] Schema payment menerima method baru
- [x] Schema payment mewajibkan `referenceNumber` untuk pembayaran non-cash
- [x] Service payment mewajibkan `referenceNumber` untuk pembayaran non-cash
- [x] Test payment methods ditambahkan
- [x] Prisma client generated
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 20 tests
- [x] Backend `build` pass

### C5. Pricing history versioned — SELESAI

- [x] Model `PricingRuleHistory` ditambahkan
- [x] Relasi history ke `Tenant`, `PricingRule`, `ServiceType`, dan `User` ditambahkan
- [x] Migration `20260527000500_add_pricing_rule_history` dibuat dan applied ke DB lokal
- [x] Update pricing sekarang menyimpan snapshot sebelum/sesudah
- [x] History menyimpan harga lama, harga baru, margin lama, margin baru, status lama, status baru, dan aktor perubahan
- [x] Test pricing history ditambahkan
- [x] Prisma client generated
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 22 tests
- [x] Backend `build` pass

### C6. Request ID middleware + correlation log — SELESAI

- [x] Request context AsyncLocalStorage ditambahkan
- [x] Middleware request ID ditambahkan
- [x] Incoming `X-Request-Id` dipakai jika tersedia
- [x] Request ID baru dibuat otomatis jika header tidak tersedia
- [x] Response header `X-Request-Id` diset untuk semua request
- [x] Logger Winston otomatis menambahkan `requestId` ke metadata log saat ada request context
- [x] Test request ID middleware ditambahkan
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 24 tests
- [x] Backend `build` pass

### C7. OpenAPI dari Zod — SELESAI

- [x] Dependency `@asteasolutions/zod-to-openapi` ditambahkan
- [x] Dependency `swagger-ui-express` dan types ditambahkan
- [x] Generator OpenAPI dibuat dari Zod schema existing
- [x] Security scheme Bearer JWT ditambahkan ke OpenAPI
- [x] Endpoint JSON docs tersedia di `/api/v1/docs.json`
- [x] Swagger UI tersedia di `/api/v1/docs`
- [x] Test OpenAPI document ditambahkan
- [x] Backend `typecheck` pass
- [x] Backend `test` pass: 25 tests
- [x] Backend `build` pass

Catatan C7:

- `npm install` backend melaporkan 5 vulnerabilities; `npm audit fix` / `--force` belum dijalankan karena bisa breaking.
- Dokumentasi awal mencakup endpoint utama yang sudah punya Zod schema dan bisa diperluas per modul.

### C8. Frontend Error Boundary — SELESAI

- [x] Root error boundary ditambahkan di `frontend/src/app/error.tsx`
- [x] Auth route group error boundary ditambahkan
- [x] Dashboard route group error boundary ditambahkan
- [x] Admin route group error boundary ditambahkan
- [x] Semua fallback punya tombol retry/reset
- [x] Frontend `typecheck` pass

### C9. Mobile offline TanStack Query persist — SELESAI

- [x] Dependency `@tanstack/react-query-persist-client` ditambahkan
- [x] Dependency `@tanstack/query-async-storage-persister` ditambahkan
- [x] AsyncStorage persister dibuat untuk query cache mobile
- [x] Mobile provider memakai `PersistQueryClientProvider`
- [x] Query cache disimpan dengan max age 24 jam
- [x] Mobile `typecheck` pass

Catatan C9:

- `npm install` mobile melaporkan 42 vulnerabilities dari dependency tree; `npm audit fix` / `--force` belum dijalankan karena bisa breaking.
- Command pertama `npm run typecheck --prefix mobile` sempat gagal karena shell sudah berada di folder `mobile`; retry `npm run typecheck` berhasil.

### C10. Audit middleware capture `before` — NEXT

Rencana berikutnya:

- Audit middleware untuk PATCH/PUT/DELETE mengambil record sebelum write
- Simpan snapshot `before` ke audit log
- Pastikan tidak mengganggu endpoint yang sudah punya audit manual
- Jalankan backend typecheck/test/build

## Verification Commands Terakhir yang Sudah Lolos

```bash
cd backend
npm run typecheck
npm run test
npm run build
npm run lint

cd frontend
npm run typecheck

cd mobile
npm run typecheck
```

Catatan lint backend:

- 0 error
- masih ada warning non-blocking existing di:
  - `backend/src/modules/tenant/tenant.routes.ts`
  - `backend/src/modules/transaction/transaction.service.ts`

## Migration Status

Sudah applied ke DB:

- `20260519000100_add_transaction_documents`
- `20260519000200_add_vehicle_tenant_and_stnk_expiry`
- `20260519000300_add_soft_delete_fields`
- `20260519000400_add_refresh_token_sessions`
- `20260519000500_add_user_device_tokens`
- `20260527000100_denormalize_transaction_child_tenant`
- `20260527000200_add_cancelled_transaction_status`
- `20260527000300_add_transaction_assignee`
- `20260527000400_add_payment_methods`
- `20260527000500_add_pricing_rule_history`

Perintah terakhir:

```bash
npx prisma migrate deploy
npx prisma generate
```

Status sebelumnya sudah `Database schema is up to date` setelah migration sampai B5, dan B7 migration juga sudah applied sukses.

## Important Notes for Next Session

- Jangan langsung lanjut Phase C; selesaikan dulu Phase B B8-B15 dan checkpoint.
- Jangan jalankan `npm audit fix --force` tanpa konfirmasi karena berisiko breaking dependency mobile.
- Jika DB lokal berubah lagi, jalankan:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

- Sebelum final Phase B checkpoint, jalankan lagi:

```bash
cd backend && npm run typecheck && npm run test && npm run build && npm run lint
cd frontend && npm run typecheck
cd mobile && npm run typecheck
```
