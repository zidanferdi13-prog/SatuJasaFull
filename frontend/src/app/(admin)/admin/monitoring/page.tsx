'use client';

import { PageHeader } from '../../../../shared/components/PageHeader';
import { KpiCard } from '../../../../shared/components/KpiCard';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { useAdminDashboard } from '../../../../modules/dashboard/hooks/useDashboard';

export default function MonitoringPage() {
  const { data: kpis, isLoading } = useAdminDashboard();

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="System Monitoring"
        subtitle="Real-time platform health and service status"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <KpiCard value={kpis?.totalTenants ?? 0} label="Total Tenants" color="#007AFF" />
        <KpiCard value={kpis?.activeTenants ?? 0} label="Active Tenants" color="#4CAF50" />
        <KpiCard value={kpis?.totalTransactions ?? 0} label="Total Transactions" color="#FF9800" />
        <KpiCard value={kpis?.expiredSubscriptions ?? 0} label="Expired Subscriptions" color="#F44336" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { label: 'API Server', status: 'Operational', color: '#4CAF50' },
          { label: 'Database', status: 'Operational', color: '#4CAF50' },
          { label: 'Redis Cache', status: 'Operational', color: '#4CAF50' },
          { label: 'WhatsApp Worker', status: 'Operational', color: '#4CAF50' },
        ].map(({ label, status, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color, background: `${color}18`, padding: '4px 12px', borderRadius: 20 }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
