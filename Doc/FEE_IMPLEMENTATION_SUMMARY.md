# Fee Design Implementation Summary

> Source of truth: `Doc/FEE_DESIGN.md`, `backend/prisma/schema.prisma`
> Implemented: 2026-05-17

---

## Scope

Implementasi fee design dilakukan pada backend DB/API dan mobile UI transaksi. Web/FE Admin belum dibuat pada pekerjaan ini, tetapi backend sudah menyimpan `amount` sebagai nilai transaksi yang dapat diedit oleh FE Admin di tahap berikutnya.

---

## Database Mapping

| Design Document | Current System |
|---|---|
| `orders` | `transactions` |
| `order_fee_details` | `transaction_item_fee_details` |
| `order_document_checklist` | `transaction_item_document_checklists` |
| `m_service_type` | `service_types` |
| `m_fee_rules` | `m_fee_rules` |
| `m_service_document_requirement` | `m_service_document_requirements` |

Fee/checklist disimpan per `transaction_items` agar satu transaksi tetap dapat berisi lebih dari satu kendaraan dan layanan.

---

## Backend Changes

- Prisma models added for master vehicle types, fee components, fee rules, document requirements, transaction fee snapshots, and transaction document checklist snapshots.
- Migration added: `backend/prisma/migrations/20260517090000_add_fee_design/migration.sql`.
- Seed expanded in `backend/src/migrations/seed-superadmin.ts`:
  - MVP vehicle types: `MOTOR`, `MOBIL`, `PICKUP`, `TRUK`, `BUS`, `LAINNYA`.
  - Fee components from `FEE_DESIGN.md`.
  - JABAR default fee rules.
  - Service document checklist requirements.
- Transaction create now copies master fee rules and checklist requirements into transaction snapshot tables.
- Transaction totals are calculated from copied fee detail `amount` values.
- `GET /transactions/requirements` returns master fee/checklist data for mobile preview.

---

## Mobile Changes

- Mobile transaction creation no longer uses hardcoded STNK fee categories as the source of truth.
- The create transaction screen fetches backend fee requirements after service and vehicle type selection.
- Fee values from notice/STNK are shown as editable inputs initialized from master defaults, so PKB/opsen/SWDKLLJ/PNBP values can be typed manually from notice pajak.
- `JASA_BIRO` is displayed separately as a system fee sourced from tenant pricing rules, not as a notice/STNK input.
- Transaction create payload sends `feeDetails.amount`; backend stores both the master `defaultAmount` and the submitted `amount` snapshot.
- Transaction detail screen displays saved fee details and checklist snapshots.
- No upload document/file flow was added.

---

## DB Audit Notes

`Doc/DATABASE.md` previously described older concepts such as `bureau_id`, `bureaus`, `services`, `document_tracking`, and `document_stage_history`. The active Prisma schema uses `tenantId`, `tenants`, `service_types`, `transactions`, `transaction_items`, and `transaction_logs`. The fee implementation follows the active Prisma schema.

---

## Multi-Province Readiness

JABAR is only the seeded default. New provinces can be added by inserting `m_fee_rules` rows with another `provinceCode` and optional `cityCode`. No schema change is needed for future province fee data.
