'use client';

import { useAdminDashboard } from '../../../modules/dashboard/hooks/useDashboard';
import { useTenants } from '../../../modules/tenants/hooks/useTenants';
import { KpiCard } from '../../../shared/components/KpiCard';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { LoadingState } from '../../../shared/components/LoadingState';
import { DataTable } from '../../../shared/components/DataTable';
import { Tenant } from '../../../shared/types';
import { formatDate, isExpired } from '../../../shared/utils/format';

export default function AdminDashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useAdminDashboard();
  const { data: tenants, isLoading: tenantsLoading } = useTenants();

  if (kpisLoading) return <LoadingState />;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: '#1a1a1a' }}>
          Super Admin Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#666' }}>Platform monitoring & tenant management</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        <KpiCard value={kpis?.totalTenants ?? 0} label="Total Tenants" color="#007AFF" />
        <KpiCard value={kpis?.activeTenants ?? 0} label="Active Tenants" color="#4CAF50" />
        <KpiCard value={kpis?.totalTransactions ?? 0} label="Total Transactions" color="#FF9800" />
        <KpiCard value={kpis?.expiredSubscriptions ?? 0} label="Expired Subscriptions" color="#F44336" />
      </div>

      <div style={{
        background: 'white',
        borderRadius: 10,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>Tenants</h2>
          <a href="/admin/tenants" style={{ color: '#007AFF', fontSize: 14, fontWeight: 500 }}>
            Manage All →
          </a>
        </div>

        <DataTable
          columns={[
            {
              key: 'info',
              header: 'Name / Code',
              render: (t: Tenant) => (
                <div>
                  <strong style={{ color: '#333' }}>{t.name}</strong>
                  <div style={{ fontSize: 12, color: '#007AFF' }}>{t.code}</div>
                </div>
              ),
            },
            {
              key: 'sub',
              header: 'Subscription End',
              render: (t: Tenant) => (
                <span style={{ color: isExpired(t.subscriptionEnd) ? '#c62828' : 'inherit' }}>
                  {formatDate(t.subscriptionEnd)}
                </span>
              ),
            },
            {
              key: 'trx',
              header: 'Transactions',
              render: (t: Tenant) => t._count?.transactions ?? 0,
            },
            {
              key: 'status',
              header: 'Status',
              render: (t: Tenant) => <StatusBadge status={t.subscriptionStatus} type="tenant" />,
            },
          ]}
          data={tenants?.data?.slice(0, 10) ?? []}
          keyExtractor={(t: Tenant) => t.id}
          loading={tenantsLoading}
        />
      </div>
    </div>
  );
}
