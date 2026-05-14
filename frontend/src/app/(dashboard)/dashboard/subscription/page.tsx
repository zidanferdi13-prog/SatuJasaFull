'use client';

import { useTenant } from '../../../../modules/tenants/hooks/useTenants';
import { useAuthStore } from '../../../../store/authStore';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { formatDate } from '../../../../shared/utils/format';
import { StatusBadge } from '../../../../shared/components/StatusBadge';

export default function DashboardSubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const tenantId = user?.tenantId ?? '';
  const { data: tenant, isLoading } = useTenant(tenantId);

  if (isLoading) return <LoadingState />;

  const status = tenant?.subscriptionStatus ?? 'EXPIRED';
  const endDate = tenant?.subscriptionEnd;
  const startDate = tenant?.subscriptionStart;

  const isExpired = status === 'EXPIRED' || (endDate ? new Date(endDate) < new Date() : false);

  const cardStyle: React.CSSProperties = {
    background: 'white', borderRadius: 10, padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 480,
  };
  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14 };
  const labelStyle: React.CSSProperties = { color: '#888', fontWeight: 500 };
  const valueStyle: React.CSSProperties = { color: '#333', fontWeight: 600 };

  return (
    <div>
      <PageHeader title="Langganan" subtitle="Status berlangganan bengkel Anda" />

      {isExpired && (
        <div style={{ background: '#fde8e8', border: '1px solid #ef9a9a', borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 14, color: '#c62828' }}>
          <strong>Langganan Anda telah berakhir.</strong> Hubungi super admin platform untuk memperpanjang berlangganan.
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#333' }}>Detail Langganan</h2>

        <div style={rowStyle}>
          <span style={labelStyle}>Status</span>
          <StatusBadge status={status} type="tenant" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Mulai Berlangganan</span>
          <span style={valueStyle}>{startDate ? formatDate(startDate) : '-'}</span>
        </div>
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={labelStyle}>Berakhir</span>
          <span style={{ ...valueStyle, color: isExpired ? '#c62828' : '#2e7d32' }}>
            {endDate ? formatDate(endDate) : '-'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 13, color: '#888' }}>
        Untuk perpanjangan atau peningkatan paket, hubungi tim kami.
      </div>
    </div>
  );
}
