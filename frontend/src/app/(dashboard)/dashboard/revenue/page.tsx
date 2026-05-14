'use client';

import { useState } from 'react';
import { useRevenueSummary } from '../../../../modules/analytics/hooks/useAnalytics';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { KpiCard } from '../../../../shared/components/KpiCard';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { formatCurrency } from '../../../../shared/utils/format';

export default function DashboardRevenuePage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, refetch } = useRevenueSummary({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const inputStyle: React.CSSProperties = { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 };

  return (
    <div>
      <PageHeader title="Revenue" subtitle="Laporan pendapatan bengkel" />

      {/* Date filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Tanggal Mulai</label>
          <input type="date" style={inputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Tanggal Akhir</label>
          <input type="date" style={inputStyle} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button
          onClick={() => refetch()}
          style={{ alignSelf: 'flex-end', padding: '10px 20px', borderRadius: 8, border: 'none', background: '#007AFF', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Tampilkan
        </button>
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            style={{ alignSelf: 'flex-end', padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 14, cursor: 'pointer' }}
          >
            Reset
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard
            value={formatCurrency(data?.totalRevenue ?? 0)}
            label="Total Revenue"
            color="#4CAF50"
          />
          <KpiCard
            value={formatCurrency(data?.totalDp ?? 0)}
            label="Total DP"
            color="#007AFF"
          />
          <KpiCard
            value={formatCurrency(data?.totalRefund ?? 0)}
            label="Total Refund"
            color="#F44336"
          />
          <KpiCard
            value={data?.transactionCount ?? 0}
            label="Jumlah Transaksi"
            color="#9C27B0"
          />
        </div>
      )}
    </div>
  );
}
