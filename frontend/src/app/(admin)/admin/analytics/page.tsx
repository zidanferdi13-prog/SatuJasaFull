'use client';

import { useRevenueAnalytics, useBranchAnalytics } from '../../../../modules/analytics/hooks/useAnalytics';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { KpiCard } from '../../../../shared/components/KpiCard';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { formatCurrency } from '../../../../shared/utils/format';

export default function AnalyticsPage() {
  const { data: revenue, isLoading: revLoading } = useRevenueAnalytics();
  const { data: branches, isLoading: branchLoading } = useBranchAnalytics();

  const totalRevenue = revenue?.reduce((sum, r) => sum + r.revenue, 0) ?? 0;
  const totalTrx = revenue?.reduce((sum, r) => sum + r.transactions, 0) ?? 0;

  if (revLoading || branchLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform-wide revenue and performance insights" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <KpiCard value={formatCurrency(totalRevenue)} label="Total Revenue" color="#4CAF50" />
        <KpiCard value={totalTrx} label="Total Transactions" color="#007AFF" />
        <KpiCard value={branches?.length ?? 0} label="Active Branches" color="#FF9800" />
      </div>

      <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#333' }}>Revenue Per Periode</h2>
        {!revenue || revenue.length === 0 ? (
          <EmptyState message="Belum ada data revenue" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Periode', 'Revenue', 'Transaksi'].map((h) => (
                  <th key={h} style={{ padding: 12, textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#666', borderBottom: '1px solid #e5e5e5', background: '#f8f9fa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {revenue.map((r) => (
                <tr key={r.period}>
                  <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>{r.period}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5', fontWeight: 600, color: '#4CAF50' }}>{formatCurrency(r.revenue)}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>{r.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#333' }}>Revenue Per Cabang</h2>
        {!branches || branches.length === 0 ? (
          <EmptyState message="Belum ada data cabang" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Cabang', 'Revenue', 'Transaksi'].map((h) => (
                  <th key={h} style={{ padding: 12, textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#666', borderBottom: '1px solid #e5e5e5', background: '#f8f9fa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.branchId}>
                  <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>{b.branchName}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5', fontWeight: 600, color: '#4CAF50' }}>{formatCurrency(b.revenue)}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>{b.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
