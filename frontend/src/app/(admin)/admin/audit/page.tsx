'use client';

import { useState } from 'react';
import { useAuditLogs } from '../../../../modules/audit/hooks/useAuditLogs';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { AuditLog } from '../../../../shared/types';
import { formatDateTime } from '../../../../shared/utils/format';

const thStyle: React.CSSProperties = { padding: 12, fontSize: 13, fontWeight: 600, color: '#666', textAlign: 'left', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f8f9fa' };
const tdStyle: React.CSSProperties = { padding: 12, fontSize: 13, color: '#333', borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' };

export default function AuditLogsPage() {
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const { data, isLoading } = useAuditLogs({
    entity: entity || undefined,
    action: action || undefined,
    limit: 50,
  });

  const inputStyle: React.CSSProperties = { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, background: 'white' };

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Track all admin and tenant actions for compliance" />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input style={inputStyle} placeholder="Filter entity (e.g. Tenant)" value={entity} onChange={(e) => setEntity(e.target.value)} />
        <input style={inputStyle} placeholder="Filter action (e.g. UPDATE)" value={action} onChange={(e) => setAction(e.target.value)} />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !data || data.data.length === 0 ? (
        <EmptyState message="Belum ada audit log" description="Log aktivitas akan muncul di sini" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr>
              <th style={thStyle}>Waktu</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Entity</th>
              <th style={thStyle}>Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((log: AuditLog) => (
              <tr key={log.id} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}>
                <td style={tdStyle}>{formatDateTime(log.createdAt)}</td>
                <td style={tdStyle}>{log.user?.name ?? log.createdBy ?? '-'}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: '#e3f2fd', color: '#0d47a1', fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>
                    {log.action}
                  </span>
                </td>
                <td style={tdStyle}>{log.entity}</td>
                <td style={tdStyle}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{log.entityId ?? '-'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
          Total: {data.meta.total} log • Halaman {data.meta.page} dari {data.meta.total_pages}
        </div>
      )}
    </div>
  );
}
