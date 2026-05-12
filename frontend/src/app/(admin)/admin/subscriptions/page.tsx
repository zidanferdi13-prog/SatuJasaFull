'use client';

import { useSubscriptions } from '../../../../modules/subscriptions/hooks/useSubscriptions';
import { Subscription } from '../../../../modules/subscriptions/services/subscription.service';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { formatDate, isExpired } from '../../../../shared/utils/format';

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useSubscriptions();

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle="Manage tenant subscription plans and renewals"
      />

      {!subscriptions || subscriptions.length === 0 ? (
        <EmptyState message="Tidak ada data subscription" />
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'white',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <thead>
            <tr>
              {['Tenant', 'Mulai', 'Berakhir', 'Status'].map((h) => (
                <th key={h} style={{ padding: 12, fontSize: 14, fontWeight: 600, color: '#666', textAlign: 'left', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f8f9fa' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s: Subscription) => (
              <tr key={s.id}>
                <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>
                  <div style={{ fontWeight: 700 }}>{s.tenantName}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{s.plan}</div>
                </td>
                <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>{formatDate(s.startDate)}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5', color: isExpired(s.endDate) ? '#c62828' : 'inherit', fontWeight: isExpired(s.endDate) ? 700 : 400 }}>
                  {formatDate(s.endDate)}
                </td>
                <td style={{ padding: 12, borderBottom: '1px solid #e5e5e5' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: s.status === 'ACTIVE' ? '#e8f5e9' : '#ffebee',
                    color: s.status === 'ACTIVE' ? '#2e7d32' : '#c62828',
                  }}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
