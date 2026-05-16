'use client';

import { useState } from 'react';
import { useNotificationQueue, useRetryNotification } from '../../../../modules/notifications/hooks/useNotifications';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { WhatsAppQueueItem } from '../../../../shared/types';
import { formatDateTime } from '../../../../shared/utils/format';

const filters = [
  { label: 'Semua', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Failed', value: 'FAILED' },
] as const;

const statusCopy: Record<string, { label: string; tone: string }> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  SENT: { label: 'Sent', tone: 'success' },
  FAILED: { label: 'Failed', tone: 'danger' },
};

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className={`notif-summary-card ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function StatusChip({ status }: { status: string }) {
  const config = statusCopy[status] ?? { label: status, tone: 'neutral' };
  return <span className={`queue-status ${config.tone}`}>{config.label}</span>;
}

export default function NotificationsPage() {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'SENT' | 'FAILED' | ''>('');
  const { data, isLoading } = useNotificationQueue({ status: statusFilter || undefined, limit: 50 });
  const retryMutation = useRetryNotification();

  if (isLoading) return <LoadingState />;

  const items = data?.data ?? [];
  const pending = items.filter((item) => item.status === 'PENDING').length;
  const sent = items.filter((item) => item.status === 'SENT').length;
  const failed = items.filter((item) => item.status === 'FAILED').length;

  return (
    <div className="notifications-page">
      <section className="notif-header">
        <div>
          <span>WhatsApp Queue</span>
          <h1>Notifications</h1>
          <p>Pantau pengiriman pesan WhatsApp tracking, invoice, dan retry queue yang gagal.</p>
        </div>
      </section>

      <section className="notif-summary-grid">
        <SummaryCard label="Pending" value={pending} tone="warning" />
        <SummaryCard label="Sent" value={sent} tone="success" />
        <SummaryCard label="Failed" value={failed} tone="danger" />
        <SummaryCard label="Total Queue" value={data?.meta?.total ?? items.length} tone="dark" />
      </section>

      <section className="queue-panel">
        <div className="queue-panel-head">
          <div><span>Delivery Monitor</span><h2>Message queue</h2></div>
          <div className="queue-filter">
            {filters.map((filter) => (
              <button key={filter.value || 'ALL'} className={statusFilter === filter.value ? 'active' : ''} onClick={() => setStatusFilter(filter.value)}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? <EmptyState message="Belum ada notifikasi" description="Queue notifikasi WhatsApp akan muncul di sini" /> : (
          <div className="queue-list">
            <div className="queue-list-head"><span>Message</span><span>Status</span><span>Attempts</span><span>Created</span><span>Action</span></div>
            {items.map((item: WhatsAppQueueItem) => (
              <div className="queue-row" key={item.id}>
                <div className="queue-message">
                  <strong>{item.phone}</strong>
                  <p>{item.message}</p>
                  {item.error && <small>Error: {item.error}</small>}
                </div>
                <StatusChip status={item.status} />
                <span className="attempt-count">{item.attempts}x</span>
                <span>{formatDateTime(item.createdAt)}</span>
                <div>
                  {item.status === 'FAILED' ? (
                    <button className="retry-action" onClick={() => retryMutation.mutate(item.id)} disabled={retryMutation.isPending}>
                      Retry
                    </button>
                  ) : <span className="muted-action">—</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx global>{`.notifications-page{max-width:1440px;margin:0 auto}.notif-header{margin-bottom:22px}.notif-header span,.queue-panel-head span{color:#76777d;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.notif-header h1{margin:6px 0 0;font-size:36px;line-height:44px;font-weight:900;letter-spacing:-.03em}.notif-header p{margin:6px 0 0;color:#45464d}.notif-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px}.notif-summary-card{background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:20px}.notif-summary-card span{color:#76777d;font-size:12px;font-weight:900;text-transform:uppercase}.notif-summary-card strong{display:block;margin-top:12px;font-size:32px;line-height:38px;font-weight:900}.notif-summary-card.dark{background:#131b2e;border-color:#131b2e}.notif-summary-card.dark span,.notif-summary-card.dark strong{color:#fff}.notif-summary-card.warning{background:#fff8e1}.notif-summary-card.success{background:#f2fbf4}.notif-summary-card.danger{background:#fff5f3}.queue-panel{background:#fff;border:1px solid #c6c6cd;border-radius:18px;overflow:hidden}.queue-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:24px;border-bottom:1px solid #e4e2e4}.queue-panel-head h2{margin:6px 0 0;font-size:24px;font-weight:900}.queue-filter{display:flex;gap:8px;flex-wrap:wrap}.queue-filter button{min-height:36px;padding:0 14px;border-radius:999px;background:#f6f3f5;color:#45464d;font-weight:900}.queue-filter button.active{background:#131b2e;color:#fff}.queue-list-head,.queue-row{display:grid;grid-template-columns:minmax(320px,1.5fr) 120px 90px 190px 90px;gap:16px;align-items:center}.queue-list-head{padding:12px 24px;background:#f6f3f5;color:#76777d;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.queue-row{padding:16px 24px;border-top:1px solid #e4e2e4}.queue-message{min-width:0}.queue-message strong{color:#004395;font-weight:900}.queue-message p{margin:5px 0 0;color:#45464d;font-size:13px;line-height:20px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.queue-message small{display:block;margin-top:6px;color:#93000a;font-weight:800}.queue-status{display:inline-flex;width:max-content;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:900;text-transform:uppercase}.queue-status.warning{background:#fff3cd;color:#8a5a00}.queue-status.success{background:#e8f5e9;color:#2e7d32}.queue-status.danger{background:#ffdad6;color:#93000a}.queue-status.neutral{background:#f0edef;color:#45464d}.attempt-count{font-weight:900;color:#1b1b1d}.retry-action{min-height:34px;padding:0 13px;border-radius:10px;background:#b45309;color:#fff;font-weight:900}.retry-action:disabled{opacity:.6}.muted-action{color:#76777d}@media(max-width:1100px){.notif-summary-grid{grid-template-columns:repeat(2,1fr)}.queue-panel-head{flex-direction:column}.queue-list-head{display:none}.queue-row{grid-template-columns:1fr 1fr}.queue-message{grid-column:1/-1}}@media(max-width:700px){.notif-summary-grid,.queue-row{grid-template-columns:1fr}}`}</style>
    </div>
  );
}
