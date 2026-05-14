'use client';

import { useState } from 'react';
import { useTracking } from '../../../../modules/tracking/hooks/useTracking';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { formatCurrency, formatDateTime } from '../../../../shared/utils/format';
import { TrackingInfo } from '../../../../modules/tracking/services/tracking.service';

export default function AdminTrackingPage() {
  const [code, setCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');

  const { data, isLoading, isError } = useTracking(submittedCode);

  const handleSearch = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed) setSubmittedCode(trimmed);
  };

  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14 };
  const labelStyle: React.CSSProperties = { color: '#888', fontWeight: 500 };
  const valueStyle: React.CSSProperties = { color: '#333', fontWeight: 600 };

  return (
    <div>
      <PageHeader title="Tracking Monitor" subtitle="Cari status transaksi berdasarkan kode tracking" />

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <input
          placeholder="Masukkan kode tracking (contoh: TRK-ABC123)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#007AFF', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Cari
        </button>
      </div>

      {isLoading && <LoadingState />}

      {isError && submittedCode && (
        <div style={{ background: '#fce4ec', border: '1px solid #ef9a9a', borderRadius: 8, padding: 16, color: '#c62828', fontSize: 14 }}>
          Kode tracking <strong>{submittedCode}</strong> tidak ditemukan.
        </div>
      )}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Transaction info */}
          <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#333' }}>Informasi Transaksi</h2>
            <div style={rowStyle}>
              <span style={labelStyle}>No. Invoice</span>
              <span style={{ ...valueStyle, fontFamily: 'monospace', color: '#007AFF' }}>{data.invoiceNumber}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Kode Tracking</span>
              <span style={{ ...valueStyle, fontFamily: 'monospace' }}>{data.trackingCode}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Status</span>
              <StatusBadge status={data.status} />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Pelanggan</span>
              <span style={valueStyle}>{data.customer.name}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Tenant</span>
              <span style={valueStyle}>{data.tenant.name} ({data.tenant.code})</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Cabang</span>
              <span style={valueStyle}>{data.branch.name}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Total Estimasi</span>
              <span style={valueStyle}>{formatCurrency(data.estimatedTotal)}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Total Final</span>
              <span style={valueStyle}>{formatCurrency(data.finalTotal)}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>DP</span>
              <span style={valueStyle}>{formatCurrency(data.dpAmount)}</span>
            </div>
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Sisa Bayar</span>
              <span style={{ ...valueStyle, color: data.remainingAmount > 0 ? '#F44336' : '#4CAF50' }}>
                {formatCurrency(data.remainingAmount)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#333' }}>Timeline</h2>
            {data.timeline.length === 0 ? (
              <p style={{ color: '#888', fontSize: 14 }}>Belum ada perubahan status.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.timeline.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#007AFF', marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                        {t.fromStatus ? `${t.fromStatus} → ` : ''}{t.toStatus}
                      </div>
                      {t.notes && <div style={{ fontSize: 12, color: '#666' }}>{t.notes}</div>}
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{formatDateTime(t.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
