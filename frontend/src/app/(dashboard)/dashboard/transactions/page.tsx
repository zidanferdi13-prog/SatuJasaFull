'use client';

import { useState } from 'react';
import { useTransactions } from '../../../../modules/transactions/hooks/useTransactions';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { DataTable } from '../../../../shared/components/DataTable';
import { Transaction, TransactionStatus } from '../../../../shared/types';
import { formatCurrency, formatDateTime } from '../../../../shared/utils/format';

const STATUSES: { value: TransactionStatus | ''; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ON_PROCESS', label: 'Diproses' },
  { value: 'READY_TO_PICKUP', label: 'Siap Diambil' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CLOSED', label: 'Ditutup' },
];

export default function DashboardTransactionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TransactionStatus | ''>('');

  const { data, isLoading } = useTransactions({
    search: search || undefined,
    status: status || undefined,
    limit: 50,
  });

  return (
    <div>
      <PageHeader title="Transaksi" subtitle="Daftar seluruh transaksi cabang Anda" />

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="Cari invoice, pelanggan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd',
            fontSize: 14, flex: '1 1 220px', outline: 'none',
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TransactionStatus | '')}
          style={{
            padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd',
            fontSize: 14, background: 'white', cursor: 'pointer',
          }}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !data || data.data.length === 0 ? (
        <EmptyState message="Belum ada transaksi" />
      ) : (
        <DataTable
          columns={[
            {
              key: 'invoice',
              header: 'No. Invoice',
              render: (t: Transaction) => (
                <a href={`/dashboard/transactions/${t.id}`} style={{ color: '#007AFF', fontWeight: 600, fontFamily: 'monospace' }}>
                  {t.invoiceNumber}
                </a>
              ),
            },
            {
              key: 'tracking',
              header: 'Kode Tracking',
              render: (t: Transaction) => (
                <span style={{ fontFamily: 'monospace', color: '#555' }}>{t.trackingCode}</span>
              ),
            },
            {
              key: 'customer',
              header: 'Pelanggan',
              render: (t: Transaction) => t.customer?.name ?? '-',
            },
            {
              key: 'total',
              header: 'Total',
              render: (t: Transaction) => formatCurrency(t.finalTotal ?? t.estimatedTotal ?? 0),
            },
            {
              key: 'status',
              header: 'Status',
              render: (t: Transaction) => <StatusBadge status={t.status} />,
            },
            {
              key: 'date',
              header: 'Tanggal',
              render: (t: Transaction) => formatDateTime(t.createdAt),
            },
          ]}
          data={data.data}
          keyExtractor={(t: Transaction) => t.id}
        />
      )}

      <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
        Total: {data?.meta?.total ?? 0} transaksi
      </div>
    </div>
  );
}
