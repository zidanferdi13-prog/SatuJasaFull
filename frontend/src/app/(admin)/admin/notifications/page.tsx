'use client';

import { PageHeader } from '../../../../shared/components/PageHeader';
import { EmptyState } from '../../../../shared/components/EmptyState';

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Send broadcast messages to tenants via WhatsApp or email"
        actions={
          <button
            style={{
              backgroundColor: '#007AFF',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Send Notification
          </button>
        }
      />
      <EmptyState
        message="Belum ada notifikasi terkirim"
        description="Fitur broadcast notifikasi segera hadir"
      />
    </div>
  );
}
