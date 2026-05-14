'use client';

import { use } from 'react';
import { useTransaction, useUpdateTransactionStatus } from '../../../../../modules/transactions/hooks/useTransactions';
import { PageHeader } from '../../../../../shared/components/PageHeader';
import { StatusBadge } from '../../../../../shared/components/StatusBadge';
import { LoadingState } from '../../../../../shared/components/LoadingState';
import { TransactionStatus } from '../../../../../shared/types';
import { formatCurrency, formatDateTime } from '../../../../../shared/utils/format';
import { transactionService } from '../../../../../modules/transactions/services/transaction.service';

const STATUS_TRANSITIONS: Record<TransactionStatus, TransactionStatus | null> = {
  DRAFT: 'ON_PROCESS',
  ON_PROCESS: 'READY_TO_PICKUP',
  READY_TO_PICKUP: 'COMPLETED',
  COMPLETED: 'CLOSED',
  CLOSED: null,
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  DRAFT: 'Mulai Proses',
  ON_PROCESS: 'Tandai Siap Ambil',
  READY_TO_PICKUP: 'Tandai Selesai',
  COMPLETED: 'Tutup Transaksi',
  CLOSED: '',
};

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: trx, isLoading } = useTransaction(id);
  const updateStatus = useUpdateTransactionStatus();

  if (isLoading) return <LoadingState />;
  if (!trx) return <div style={{ padding: 32, color: '#666' }}>Transaksi tidak ditemukan.</div>;

  const nextStatus = STATUS_TRANSITIONS[trx.status];

  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14 };
  const labelStyle: React.CSSProperties = { color: '#888', fontWeight: 500 };
  const valueStyle: React.CSSProperties = { color: '#333', fontWeight: 600 };

  return (
    <div>
      <PageHeader
        title={`Invoice ${trx.invoiceNumber}`}
        subtitle={`Kode Tracking: ${trx.trackingCode}`}
        actions={
          nextStatus ? (
            <button
              onClick={() => updateStatus.mutate({ id: trx.id, status: nextStatus })}
              disabled={updateStatus.isPending}
              style={{
                backgroundColor: '#007AFF', color: 'white', padding: '10px 20px',
                borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {updateStatus.isPending ? 'Menyimpan...' : STATUS_LABELS[trx.status]}
            </button>
          ) : undefined
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Detail Info */}
        <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#333' }}>Informasi Transaksi</h2>
          <div style={rowStyle}>
            <span style={labelStyle}>Status</span>
            <StatusBadge status={trx.status} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Pelanggan</span>
            <span style={valueStyle}>{trx.customer?.name ?? '-'}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Total Estimasi</span>
            <span style={valueStyle}>{formatCurrency(trx.estimatedTotal ?? 0)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Total Final</span>
            <span style={valueStyle}>{formatCurrency(trx.finalTotal ?? 0)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>DP</span>
            <span style={valueStyle}>{formatCurrency(trx.dpAmount ?? 0)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Sisa Bayar</span>
            <span style={{ ...valueStyle, color: trx.remainingAmount > 0 ? '#F44336' : '#4CAF50' }}>
              {formatCurrency(trx.remainingAmount ?? 0)}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Dibuat</span>
            <span style={valueStyle}>{formatDateTime(trx.createdAt)}</span>
          </div>
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={labelStyle}>Diperbarui</span>
            <span style={valueStyle}>{formatDateTime(trx.updatedAt)}</span>
          </div>
        </div>

        {/* Invoice PDF */}
        <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#333' }}>Invoice PDF</h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            Unduh invoice PDF untuk diberikan kepada pelanggan.
          </p>
          <a
            href={transactionService.getInvoiceUrl(trx.id)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', backgroundColor: '#4CAF50', color: 'white',
              padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Unduh Invoice
          </a>
        </div>
      </div>
    </div>
  );
}
