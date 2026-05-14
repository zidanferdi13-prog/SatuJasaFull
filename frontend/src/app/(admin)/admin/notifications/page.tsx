'use client';

import { useState } from 'react';
import { useNotificationQueue, useRetryNotification } from '../../../../modules/notifications/hooks/useNotifications';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { WhatsAppQueueItem } from '../../../../shared/types';
import { formatDateTime } from '../../../../shared/utils/format';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fff3e0', text: '#e65100' },
  SENT: { bg: '#e8f5e9', text: '#2e7d32' },
  FAILED: { bg: '#fce4ec', text: '#c62828' },
};

const thStyle: React.CSSProperties = { padding: 12, fontSize: 13, fontWeight: 600, color: '#666', textAlign: 'left', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f8f9fa' };
const tdStyle: React.CSSProperties = { padding: 12, fontSize: 13, color: '#333', borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' };

export default function NotificationsPage() {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'SENT' | 'FAILED' | ''>('');
  const { data, isLoading } = useNotificationQueue({ status: statusFilter || undefined, limit: 50 });
  const retryMutation = useRetryNotification();

  return (
    <div>
      <PageHeader title="Notifications" subtitle="WhatsApp notification queue status" />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['', 'PENDING', 'SENT', 'FAILED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600,
              border: statusFilter === s ? 'none' : '1px solid #ddd',
              background: statusFilter === s ? '#007AFF' : 'white',
              color: statusFilter === s ? 'white' : '#333',
            }}
          >
            {s === '' ? 'Semua' : s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !data || data.data.length === 0 ? (
        <EmptyState message="Belum ada notifikasi" description="Queue notifikasi WhatsApp akan muncul di sini" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr>
              <th style={thStyle}>Waktu</th>
              <th style={thStyle}>Nomor HP</th>
              <th style={thStyle}>Pesan</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Percobaan</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((item: WhatsAppQueueItem) => {
              const colors = STATUS_COLORS[item.status] ?? { bg: '#f5f5f5', text: '#333' };
              return (
                <tr key={item.id} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}>
                  <td style={tdStyle}>{formatDateTime(item.createdAt)}</td>
                  <td style={tdStyle}>{item.phone}</td>
                  <td style={{ ...tdStyle, maxWidth: 300 }}>
                    <div style={{ fontSize: 12, color: '#555', whiteSpace: 'pre-wrap', overflow: 'hidden', maxHeight: 60 }}>
                      {item.message}
                    </div>
                    {item.error && <div style={{ fontSize: 11, color: '#c62828', marginTop: 4 }}>Error: {item.error}</div>}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: colors.bg, color: colors.text }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{item.attempts}</td>
                  <td style={tdStyle}>
                    {item.status === 'FAILED' && (
                      <button
                        onClick={() => retryMutation.mutate(item.id)}
                        disabled={retryMutation.isPending}
                        style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#FF9800', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {data && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
          Total: {data.meta.total} item
        </div>
      )}
    </div>
  );
}
