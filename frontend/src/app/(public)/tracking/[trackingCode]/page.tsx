'use client';

import { useTracking } from '../../../../modules/tracking/hooks/useTracking';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { ErrorState } from '../../../../shared/components/ErrorState';
import { formatCurrency, formatDateTime } from '../../../../shared/utils/format';
import { AppError } from '../../../../shared/services/api';


const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  ON_PROCESS: 'Sedang Diproses',
  READY_TO_PICKUP: 'Siap Diambil',
  COMPLETED: 'Selesai',
  CLOSED: 'Ditutup',
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: '#9E9E9E',
  ON_PROCESS: '#FF9800',
  READY_TO_PICKUP: '#2196F3',
  COMPLETED: '#4CAF50',
  CLOSED: '#333333',
};

interface PageProps {
  params: { trackingCode: string };
}

export default function TrackingPage({ params }: PageProps) {
  const { trackingCode } = params;
  const { data, isLoading, error, refetch } = useTracking(trackingCode);

  if (isLoading) return <LoadingState message="Memuat info tracking..." />;
  if (error || !data)
    return (
      <ErrorState
        message={(error as unknown as AppError)?.message ?? 'Tracking tidak ditemukan'}
        onRetry={refetch}
      />
    );

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FA' }}>
      {/* Header */}
      <div style={{ background: '#007AFF', padding: '20px 24px', color: 'white' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{data.tenantName}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>Status Pengerjaan STNK</div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        {/* Invoice card */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Invoice</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>{data.invoiceNumber}</div>
            </div>
            <div style={{
              background: `${STATUS_COLOR[data.status]}20`,
              color: STATUS_COLOR[data.status],
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
            }}>
              {STATUS_LABEL[data.status] ?? data.status}
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#999' }}>Customer</div>
              <div style={{ fontWeight: 600 }}>{data.customerName}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#999' }}>Plat Nomor</div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{data.vehiclePlate}</div>
            </div>
          </div>

          {data.estimatedFinishDate && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#999' }}>Est. Selesai</div>
              <div style={{ fontWeight: 600 }}>{formatDateTime(data.estimatedFinishDate)}</div>
            </div>
          )}
        </div>

        {/* Payment */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Informasi Pembayaran</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#666' }}>Total Estimasi</span>
            <span>{formatCurrency(data.estimatedTotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#666' }}>DP Dibayar</span>
            <span style={{ color: '#4CAF50' }}>- {formatCurrency(data.dpAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 8, fontWeight: 700 }}>
            <span>Sisa Bayar</span>
            <span style={{ color: data.remainingAmount > 0 ? '#FF9800' : '#4CAF50' }}>
              {formatCurrency(data.remainingAmount)}
            </span>
          </div>
        </div>

        {/* Timeline */}
        {data.timeline?.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Riwayat Status</div>
            {data.timeline.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: idx < data.timeline.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[item.status] ?? '#007AFF', marginTop: 4 }} />
                  {idx < data.timeline.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: '#e5e5e5', marginTop: 4 }} />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{STATUS_LABEL[item.status] ?? item.status}</div>
                  {item.note && <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{item.note}</div>}
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{formatDateTime(item.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#999' }}>
          Tracking Code: <strong>{trackingCode}</strong>
        </div>
      </div>
    </div>
  );
}
