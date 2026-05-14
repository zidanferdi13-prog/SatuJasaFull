'use client';

import { useAuthStore } from '../../../store/authStore';
import { useTenantDashboard, useBranchDashboard } from '../../../modules/dashboard/hooks/useDashboard';
import { useTransactions } from '../../../modules/transactions/hooks/useTransactions';
import { KpiCard } from '../../../shared/components/KpiCard';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { LoadingState } from '../../../shared/components/LoadingState';
import { DataTable } from '../../../shared/components/DataTable';
import { Transaction } from '../../../shared/types';
import { formatCurrency, formatDateTime } from '../../../shared/utils/format';

function KpisSection() {
  const user = useAuthStore((s) => s.user);
  const branchId = user?.branchId ?? '';

  const tenantQuery = useTenantDashboard();
  const branchQuery = useBranchDashboard(branchId);

  const kpis = branchId ? branchQuery.data : tenantQuery.data;
  const isLoading = branchId ? branchQuery.isLoading : tenantQuery.isLoading;

  if (isLoading) return <LoadingState />;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 16,
      marginBottom: 32,
    }}>
      <KpiCard value={formatCurrency(kpis?.revenueToday ?? 0)} label="Revenue Hari Ini" color="#4CAF50" />
      <KpiCard value={formatCurrency(kpis?.monthlyRevenue ?? 0)} label="Revenue Bulan Ini" color="#007AFF" />
      <KpiCard value={kpis?.activeTransactions ?? 0} label="Transaksi Aktif" color="#FF9800" />
      <KpiCard value={kpis?.readyPickupCount ?? 0} label="Siap Diambil" color="#9C27B0" />
      <KpiCard value={kpis?.closedToday ?? 0} label="Selesai Hari Ini" color="#4CAF50" />
      <KpiCard value={kpis?.overdueTransactions ?? 0} label="Terlambat" color="#F44336" />
    </div>
  );
}

export default function TenantDashboardPage() {
  const { data: recent, isLoading: trxLoading } = useTransactions({ limit: 10 });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: '#1a1a1a' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#666' }}>Ringkasan performa bengkel Anda</p>
      </div>

      <KpisSection />

      <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>Transaksi Terbaru</h2>
          <a href="/dashboard/transactions" style={{ color: '#007AFF', fontSize: 14, fontWeight: 500 }}>
            Lihat Semua →
          </a>
        </div>
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
          data={recent?.data ?? []}
          keyExtractor={(t: Transaction) => t.id}
          loading={trxLoading}
        />
      </div>
    </div>
  );
}
