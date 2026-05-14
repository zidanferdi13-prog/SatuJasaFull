'use client';

import { useRevenueSummary, useAdminSnapshot } from '../../../../modules/analytics/hooks/useAnalytics';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { KpiCard } from '../../../../shared/components/KpiCard';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { formatCurrency } from '../../../../shared/utils/format';

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useRevenueSummary();
  const { data: adminKpis, isLoading: kpisLoading } = useAdminSnapshot();

  if (summaryLoading || kpisLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform-wide revenue and performance insights" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <KpiCard value={formatCurrency(summary?.totalRevenue ?? 0)} label="Total Revenue" color="#4CAF50" />
        <KpiCard value={summary?.transactionCount ?? 0} label="Total Transactions" color="#007AFF" />
        <KpiCard value={formatCurrency(summary?.totalRefund ?? 0)} label="Total Refund" color="#FF9800" />
        <KpiCard value={formatCurrency(summary?.totalDp ?? 0)} label="Total DP" color="#9C27B0" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <KpiCard value={adminKpis?.totalTenants ?? 0} label="Total Tenants" color="#607D8B" />
        <KpiCard value={adminKpis?.activeTenants ?? 0} label="Active Tenants" color="#4CAF50" />
        <KpiCard value={adminKpis?.expiredSubscriptions ?? 0} label="Expired Subscriptions" color="#F44336" />
        <KpiCard value={adminKpis?.whatsappQueuePending ?? 0} label="WA Queue Pending" color="#FF5722" />
      </div>

      <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
          ⚠️ Time-series revenue charts require a dedicated <code>GET /analytics/revenue?group_by=month</code> endpoint.
          See <strong>TODO_INTEGRATION.md #7</strong> for details.
        </p>
      </div>
    </div>
  );
}
