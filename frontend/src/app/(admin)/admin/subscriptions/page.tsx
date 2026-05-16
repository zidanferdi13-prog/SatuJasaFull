'use client';

import Link from 'next/link';
import { useSubscriptions } from '../../../../modules/subscriptions/hooks/useSubscriptions';
import { Tenant } from '../../../../shared/types';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { formatDate, isExpired } from '../../../../shared/utils/format';

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <div className="sub-summary-card"><span>{label}</span><strong>{value}</strong></div>;
}

export default function SubscriptionsPage() {
  const { data: tenants, isLoading } = useSubscriptions();

  if (isLoading) return <LoadingState />;

  const list = tenants ?? [];
  const active = list.filter((tenant) => tenant.subscriptionStatus === 'ACTIVE').length;
  const expired = list.filter((tenant) => isExpired(tenant.subscriptionEnd)).length;
  const suspended = list.filter((tenant) => tenant.subscriptionStatus === 'SUSPENDED').length;

  return (
    <div className="subscriptions-page">
      <section className="sub-header">
        <div><span>Billing Control</span><h1>Subscriptions</h1><p>Monitor masa langganan tenant dan status subscription platform.</p></div>
      </section>

      <section className="sub-summary-grid">
        <SummaryCard label="Total" value={list.length} />
        <SummaryCard label="Active" value={active} />
        <SummaryCard label="Expired" value={expired} />
        <SummaryCard label="Suspended" value={suspended} />
      </section>

      <section className="sub-panel">
        <div className="sub-panel-head"><div><span>Directory</span><h2>Subscription tenant</h2></div></div>
        {!tenants || tenants.length === 0 ? <EmptyState message="Tidak ada data subscription" /> : (
          <div className="sub-list">
            <div className="sub-list-head"><span>Tenant</span><span>Mulai</span><span>Berakhir</span><span>Status</span></div>
            {tenants.map((tenant: Tenant) => (
              <Link href={`/admin/tenants/${tenant.id}`} className="sub-row" key={tenant.id}>
                <div><strong>{tenant.name}</strong><span>{tenant.code}</span></div>
                <span>{formatDate(tenant.subscriptionStart)}</span>
                <span className={isExpired(tenant.subscriptionEnd) ? 'danger-text' : ''}>{formatDate(tenant.subscriptionEnd)}</span>
                <StatusBadge status={tenant.subscriptionStatus} type="tenant" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <style jsx global>{`.subscriptions-page{max-width:1440px;margin:0 auto}.sub-header{margin-bottom:22px}.sub-header span,.sub-panel-head span{color:#76777d;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.sub-header h1{margin:6px 0 0;font-size:36px;line-height:44px;font-weight:900;letter-spacing:-.03em}.sub-header p{margin:6px 0 0;color:#45464d}.sub-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px}.sub-summary-card{background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:20px}.sub-summary-card span{color:#76777d;font-size:12px;font-weight:900;text-transform:uppercase}.sub-summary-card strong{display:block;margin-top:12px;font-size:32px;line-height:38px;font-weight:900}.sub-panel{background:#fff;border:1px solid #c6c6cd;border-radius:18px;overflow:hidden}.sub-panel-head{padding:24px;border-bottom:1px solid #e4e2e4}.sub-panel-head h2{margin:6px 0 0;font-size:24px;font-weight:900}.sub-list-head,.sub-row{display:grid;grid-template-columns:minmax(260px,1.4fr) 160px 160px 140px;gap:16px;align-items:center}.sub-list-head{padding:12px 24px;background:#f6f3f5;color:#76777d;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.sub-row{padding:16px 24px;border-top:1px solid #e4e2e4;color:inherit;text-decoration:none}.sub-row:hover{background:#fcf8fa}.sub-row div{display:grid;gap:3px}.sub-row strong{font-size:15px;font-weight:900}.sub-row span{color:#45464d}.sub-row div span{color:#004395;font-size:12px;font-weight:900}.danger-text{color:#93000a!important;font-weight:900}@media(max-width:900px){.sub-summary-grid{grid-template-columns:repeat(2,1fr)}.sub-list-head{display:none}.sub-row{grid-template-columns:1fr}}`}</style>
    </div>
  );
}
