'use client';

import { useState } from 'react';
import { useAuditLogs } from '../../../../modules/audit/hooks/useAuditLogs';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { AuditLog } from '../../../../shared/types';
import { formatDateTime } from '../../../../shared/utils/format';

function FilterField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <div className="audit-filter-field">
      <label>{label}</label>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export default function AuditLogsPage() {
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const { data, isLoading } = useAuditLogs({
    entity: entity || undefined,
    action: action || undefined,
    limit: 50,
  });

  if (isLoading) return <LoadingState />;

  const logs = data?.data ?? [];
  const latest = logs[0];
  const uniqueEntities = new Set(logs.map((log) => log.entity)).size;
  const uniqueUsers = new Set(logs.map((log) => log.user?.name ?? log.createdBy).filter(Boolean)).size;

  return (
    <div className="audit-page">
      <section className="audit-header">
        <div>
          <span>Compliance Trail</span>
          <h1>Audit Logs</h1>
          <p>Lacak perubahan penting di tenant, transaksi, user, dan konfigurasi platform.</p>
        </div>
      </section>

      <section className="audit-summary-grid">
        <div className="audit-summary-card dark"><span>Total Logs</span><strong>{data?.meta?.total ?? logs.length}</strong></div>
        <div className="audit-summary-card"><span>Entities</span><strong>{uniqueEntities}</strong></div>
        <div className="audit-summary-card"><span>Actors</span><strong>{uniqueUsers}</strong></div>
        <div className="audit-summary-card"><span>Latest</span><strong>{latest ? formatDateTime(latest.createdAt) : '-'}</strong></div>
      </section>

      <section className="audit-filter-panel">
        <div><span>Filters</span><h2>Temukan aktivitas spesifik</h2></div>
        <div className="audit-filter-grid">
          <FilterField label="Entity" value={entity} placeholder="Contoh: Tenant" onChange={setEntity} />
          <FilterField label="Action" value={action} placeholder="Contoh: UPDATE" onChange={setAction} />
          <button className="clear-filter" onClick={() => { setEntity(''); setAction(''); }}>Reset Filter</button>
        </div>
      </section>

      <section className="audit-log-panel">
        <div className="audit-log-head"><span>Activity Stream</span><strong>Halaman {data?.meta?.page ?? 1} dari {data?.meta?.total_pages ?? 1}</strong></div>
        {logs.length === 0 ? <EmptyState message="Belum ada audit log" description="Log aktivitas akan muncul di sini" /> : (
          <div className="audit-timeline">
            {logs.map((log: AuditLog) => (
              <div className="audit-row" key={log.id}>
                <div className="timeline-dot" />
                <div className="audit-row-main">
                  <div className="audit-row-title">
                    <strong>{log.user?.name ?? log.createdBy ?? 'System'}</strong>
                    <span>{formatDateTime(log.createdAt)}</span>
                  </div>
                  <div className="audit-row-meta">
                    <span className="action-chip">{log.action}</span>
                    <span className="entity-chip">{log.entity}</span>
                    <code>{log.entityId ?? '-'}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx global>{`.audit-page{max-width:1440px;margin:0 auto}.audit-header{margin-bottom:22px}.audit-header span,.audit-filter-panel>div>span,.audit-log-head span{color:#76777d;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.audit-header h1{margin:6px 0 0;font-size:36px;line-height:44px;font-weight:900;letter-spacing:-.03em}.audit-header p{margin:6px 0 0;color:#45464d}.audit-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px}.audit-summary-card{min-height:112px;background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:20px}.audit-summary-card.dark{background:#131b2e;border-color:#131b2e}.audit-summary-card span{color:#76777d;font-size:12px;font-weight:900;text-transform:uppercase}.audit-summary-card strong{display:block;margin-top:12px;color:#1b1b1d;font-size:24px;line-height:31px;font-weight:900;word-break:break-word}.audit-summary-card.dark span,.audit-summary-card.dark strong{color:#fff}.audit-filter-panel,.audit-log-panel{background:#fff;border:1px solid #c6c6cd;border-radius:18px;margin-bottom:22px}.audit-filter-panel{padding:24px}.audit-filter-panel h2{margin:6px 0 18px;font-size:24px;font-weight:900}.audit-filter-grid{display:grid;grid-template-columns:1fr 1fr auto;gap:14px;align-items:end}.audit-filter-field{display:grid;gap:7px}.audit-filter-field label{font-size:13px;font-weight:800;color:#1b1b1d}.audit-filter-field input{min-height:42px;border:1px solid #c6c6cd;border-radius:11px;padding:0 12px;background:#f6f3f5;color:#1b1b1d}.clear-filter{min-height:42px;border-radius:11px;padding:0 16px;background:#131b2e;color:#fff;font-weight:900}.audit-log-panel{overflow:hidden}.audit-log-head{display:flex;justify-content:space-between;gap:16px;padding:20px 24px;border-bottom:1px solid #e4e2e4}.audit-log-head strong{color:#45464d;font-size:13px}.audit-timeline{display:grid}.audit-row{position:relative;display:grid;grid-template-columns:24px minmax(0,1fr);gap:14px;padding:18px 24px;border-top:1px solid #e4e2e4}.audit-row:first-child{border-top:0}.audit-row:before{content:'';position:absolute;left:35px;top:0;bottom:0;width:2px;background:#e4e2e4}.timeline-dot{position:relative;z-index:1;width:12px;height:12px;margin-top:4px;border:3px solid #d8e2ff;border-radius:999px;background:#2170e4}.audit-row-title{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}.audit-row-title strong{font-weight:900}.audit-row-title span{color:#76777d;font-size:13px}.audit-row-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:9px}.action-chip,.entity-chip{border-radius:999px;padding:4px 9px;font-size:11px;font-weight:900}.action-chip{background:#d8e2ff;color:#004395}.entity-chip{background:#f0edef;color:#45464d}.audit-row-meta code{color:#76777d;font-size:12px}@media(max-width:1000px){.audit-summary-grid{grid-template-columns:repeat(2,1fr)}.audit-filter-grid{grid-template-columns:1fr}}@media(max-width:650px){.audit-summary-grid{grid-template-columns:1fr}.audit-log-head{flex-direction:column}.audit-row-title{display:grid}}`}</style>
    </div>
  );
}
