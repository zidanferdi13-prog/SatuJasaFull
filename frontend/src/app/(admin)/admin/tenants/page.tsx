'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTenants, useCreateTenant } from '../../../../modules/tenants/hooks/useTenants';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { Modal } from '../../../../shared/components/Modal';
import { Tenant } from '../../../../shared/types';
import { formatDate, isExpired } from '../../../../shared/utils/format';

const emptyForm = {
  code: '',
  name: '',
  phone: '',
  address: '',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
  subscriptionMonths: 12,
  planName: 'Standard',
  planPrice: 0,
};

const fields: Array<{
  label: string;
  key: keyof typeof emptyForm;
  placeholder: string;
  type: string;
  hint?: string;
}> = [
  { label: 'Nama Tenant', key: 'name', placeholder: 'Biro Jasa ABC', type: 'text' },
  { label: 'Kode Tenant', key: 'code', placeholder: 'BIROJASA1', type: 'text', hint: 'Hanya huruf dan angka, maks 10 karakter.' },
  { label: 'Nomor HP Pemilik', key: 'phone', placeholder: '08123456789', type: 'text' },
  { label: 'Alamat Tenant', key: 'address', placeholder: 'Jl. Merdeka No. 123, Jakarta', type: 'text' },
  { label: 'Nama Pemilik', key: 'ownerName', placeholder: 'Budi Santoso', type: 'text' },
  { label: 'Email Pemilik', key: 'ownerEmail', placeholder: 'stnk@gmail.com', type: 'email' },
  { label: 'Password Pemilik', key: 'ownerPassword', placeholder: 'Min. 8 karakter', type: 'password', hint: 'Minimal 8 karakter.' },
  { label: 'Durasi Langganan (bulan)', key: 'subscriptionMonths', placeholder: '12', type: 'number' },
  { label: 'Paket Langganan', key: 'planName', placeholder: 'Standard', type: 'text' },
  { label: 'Harga Paket (IDR)', key: 'planPrice', placeholder: '0', type: 'number' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone: 'blue' | 'green' | 'red' | 'dark' }) {
  return (
    <div className={`tenant-summary-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TenantCard({ tenant }: { tenant: Tenant }) {
  const expired = isExpired(tenant.subscriptionEnd);

  return (
    <Link href={`/admin/tenants/${tenant.id}`} className="tenant-card-row">
      <div className="tenant-identity">
        <div className="tenant-avatar">{initials(tenant.name)}</div>
        <div className="tenant-name-wrap">
          <div className="tenant-name-line">
            <strong>{tenant.name}</strong>
            <span>{tenant.code}</span>
          </div>
          <p>{tenant.phone || 'Nomor HP belum diisi'}</p>
        </div>
      </div>

      <div className="tenant-stat-cell">
        <strong>{tenant._count?.transactions ?? 0}</strong>
        <span>Transactions</span>
      </div>
      <div className="tenant-stat-cell">
        <strong>{tenant._count?.users ?? 0}</strong>
        <span>Staff</span>
      </div>
      <div className="tenant-date-cell">
        <strong className={expired ? 'date-danger' : ''}>{formatDate(tenant.subscriptionEnd)}</strong>
        <span>{expired ? 'Expired subscription' : 'Subscription end'}</span>
      </div>
      <div className="tenant-status-cell">
        <StatusBadge status={tenant.subscriptionStatus} type="tenant" />
        <span className="detail-link">Detail</span>
      </div>
    </Link>
  );
}

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const { data: tenants, isLoading } = useTenants(search.length >= 2 ? { search } : undefined);
  const createMutation = useCreateTenant();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const tenantData = tenants?.data ?? [];
  const summary = useMemo(() => {
    const active = tenantData.filter((tenant) => tenant.subscriptionStatus === 'ACTIVE').length;
    const expired = tenantData.filter((tenant) => isExpired(tenant.subscriptionEnd)).length;
    const transactions = tenantData.reduce((sum, tenant) => sum + (tenant._count?.transactions ?? 0), 0);
    return { active, expired, transactions };
  }, [tenantData]);

  const handleCreate = () => {
    if (!form.code || !form.name || !form.ownerName || !form.ownerEmail || !form.ownerPassword) return;

    createMutation.mutate(form, {
      onSuccess: () => {
        setShowModal(false);
        setForm(emptyForm);
      },
    });
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="tenant-management-page">
      <section className="tenant-hero">
        <div>
          <span className="page-kicker">Super Admin</span>
          <h1>Tenant Management</h1>
          <p>Kelola tenant biro jasa, subscription, owner account, dan akses operasional platform.</p>
        </div>
        <button className="primary-action" onClick={() => setShowModal(true)}>
          <span>+</span>
          New Tenant
        </button>
      </section>

      <section className="tenant-summary-grid">
        <SummaryCard label="Total Tenants" value={tenants?.meta?.total ?? tenantData.length} tone="dark" />
        <SummaryCard label="Active Tenants" value={summary.active} tone="green" />
        <SummaryCard label="Expired" value={summary.expired} tone="red" />
        <SummaryCard label="Transactions" value={summary.transactions.toLocaleString('id-ID')} tone="blue" />
      </section>

      <section className="tenant-table-panel">
        <div className="tenant-toolbar">
          <div>
            <span className="page-kicker">Directory</span>
            <h2>Daftar Tenant</h2>
          </div>
          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama tenant atau kode..."
            />
          </div>
        </div>

        {!tenants || tenantData.length === 0 ? (
          <div className="tenant-empty-wrap">
            <EmptyState message="Belum ada tenant" description="Buat tenant baru untuk memulai" />
          </div>
        ) : (
          <div className="tenant-list">
            <div className="tenant-list-head">
              <span>Tenant</span>
              <span>Trx</span>
              <span>Staff</span>
              <span>Subscription</span>
              <span>Status</span>
            </div>
            {tenantData.map((tenant: Tenant) => <TenantCard key={tenant.id} tenant={tenant} />)}
          </div>
        )}
      </section>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Tenant Baru">
        <div className="tenant-form-grid">
          {fields.map(({ label, key, placeholder, type, hint }) => (
            <div key={key} className={key === 'address' ? 'field full' : 'field'}>
              <label>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(event) => {
                  const value = type === 'number' ? (parseFloat(event.target.value) || 0) : event.target.value;
                  setForm({ ...form, [key]: value });
                }}
              />
              {hint && <p>{hint}</p>}
            </div>
          ))}

          <div className="modal-actions full">
            <button className="ghost-action" onClick={() => setShowModal(false)}>Batal</button>
            <button className="primary-action" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Buat Tenant'}
            </button>
          </div>

          {createMutation.isError && (() => {
            const err = createMutation.error as any;
            const msg: string = err?.response?.data?.message || 'Gagal membuat tenant';
            const errors: { field: string; message: string }[] = err?.response?.data?.errors || [];
            return (
              <div className="error-box full">
                <strong>{msg}</strong>
                {errors.map((error) => (
                  <div key={error.field}>• <b>{error.field.replace('body.', '')}</b>: {error.message}</div>
                ))}
              </div>
            );
          })()}
        </div>
      </Modal>

      <style jsx global>{`
        .tenant-management-page {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
        }

        .tenant-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 22px;
        }

        .page-kicker {
          color: #76777d;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .tenant-hero h1 {
          margin: 6px 0 0;
          color: #1b1b1d;
          font-size: 36px;
          line-height: 44px;
          letter-spacing: -0.03em;
          font-weight: 900;
        }

        .tenant-hero p {
          margin: 6px 0 0;
          max-width: 720px;
          color: #45464d;
          font-size: 15px;
          line-height: 24px;
        }

        .primary-action,
        .ghost-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 900;
        }

        .primary-action {
          background: #131b2e;
          color: #ffffff;
        }

        .primary-action:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ghost-action {
          border: 1px solid #c6c6cd;
          background: #ffffff;
          color: #45464d;
        }

        .tenant-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .tenant-summary-card {
          min-height: 118px;
          padding: 20px;
          border: 1px solid #c6c6cd;
          border-radius: 18px;
          background: #ffffff;
        }

        .tenant-summary-card span {
          color: #76777d;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .tenant-summary-card strong {
          display: block;
          margin-top: 12px;
          color: #1b1b1d;
          font-size: 32px;
          line-height: 38px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .tenant-summary-card.dark {
          background: #131b2e;
          border-color: #131b2e;
        }

        .tenant-summary-card.dark span,
        .tenant-summary-card.dark strong {
          color: #ffffff;
        }

        .tenant-summary-card.green { background: #f2fbf4; }
        .tenant-summary-card.red { background: #fff5f3; }
        .tenant-summary-card.blue { background: #f2f6ff; }

        .tenant-table-panel {
          overflow: hidden;
          border: 1px solid #c6c6cd;
          border-radius: 18px;
          background: #ffffff;
        }

        .tenant-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 24px;
          border-bottom: 1px solid #e4e2e4;
        }

        .tenant-toolbar h2 {
          margin: 6px 0 0;
          color: #1b1b1d;
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.02em;
          font-weight: 900;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          width: min(420px, 45vw);
          min-height: 42px;
          padding: 0 14px;
          border: 1px solid #c6c6cd;
          border-radius: 999px;
          background: #f6f3f5;
          color: #76777d;
        }

        .search-box input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #1b1b1d;
          font-size: 14px;
        }

        .tenant-list {
          display: grid;
        }

        .tenant-list-head,
        .tenant-card-row {
          display: grid;
          grid-template-columns: minmax(260px, 1.5fr) 110px 110px minmax(180px, 0.8fr) 150px;
          align-items: center;
          gap: 16px;
        }

        .tenant-list-head {
          padding: 12px 24px;
          background: #f6f3f5;
          color: #76777d;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .tenant-card-row {
          padding: 16px 24px;
          border-top: 1px solid #e4e2e4;
          color: inherit;
          text-decoration: none;
          transition: background 140ms ease;
        }

        .tenant-card-row:hover {
          background: #fcf8fa;
        }

        .tenant-identity {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .tenant-avatar {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #dae2fd;
          color: #131b2e;
          font-size: 13px;
          font-weight: 900;
        }

        .tenant-name-wrap {
          min-width: 0;
        }

        .tenant-name-line {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .tenant-name-line strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #1b1b1d;
          font-size: 15px;
          font-weight: 900;
        }

        .tenant-name-line span {
          flex-shrink: 0;
          padding: 2px 7px;
          border-radius: 999px;
          background: #d8e2ff;
          color: #004395;
          font-size: 10px;
          font-weight: 900;
        }

        .tenant-name-wrap p {
          margin: 4px 0 0;
          color: #76777d;
          font-size: 12px;
        }

        .tenant-stat-cell,
        .tenant-date-cell,
        .tenant-status-cell {
          display: grid;
          gap: 3px;
        }

        .tenant-stat-cell strong,
        .tenant-date-cell strong {
          color: #1b1b1d;
          font-size: 14px;
          font-weight: 900;
        }

        .tenant-stat-cell span,
        .tenant-date-cell span {
          color: #76777d;
          font-size: 12px;
        }

        .date-danger {
          color: #93000a !important;
        }

        .tenant-status-cell {
          justify-items: start;
        }

        .detail-link {
          color: #2170e4;
          font-size: 12px;
          font-weight: 900;
        }

        .tenant-empty-wrap {
          padding: 30px;
        }

        .tenant-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .field.full,
        .modal-actions.full,
        .error-box.full {
          grid-column: 1 / -1;
        }

        .field label {
          display: block;
          margin-bottom: 6px;
          color: #1b1b1d;
          font-size: 13px;
          font-weight: 800;
        }

        .field input {
          width: 100%;
          min-height: 42px;
          padding: 0 12px;
          border: 1px solid #c6c6cd;
          border-radius: 10px;
          background: #ffffff;
          color: #1b1b1d;
          font-size: 14px;
        }

        .field p {
          margin: 5px 0 0;
          color: #76777d;
          font-size: 12px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 4px;
        }

        .error-box {
          padding: 12px;
          border: 1px solid #ffb4ab;
          border-radius: 10px;
          background: #ffdad6;
          color: #93000a;
          font-size: 13px;
        }

        @media (max-width: 1100px) {
          .tenant-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .tenant-list-head {
            display: none;
          }

          .tenant-card-row {
            grid-template-columns: minmax(0, 1fr) repeat(2, 96px);
          }

          .tenant-date-cell,
          .tenant-status-cell {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 720px) {
          .tenant-hero,
          .tenant-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            width: 100%;
          }

          .tenant-summary-grid,
          .tenant-form-grid {
            grid-template-columns: 1fr;
          }

          .tenant-card-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
