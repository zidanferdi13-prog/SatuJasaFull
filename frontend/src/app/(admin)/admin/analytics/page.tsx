'use client';

import { useRevenueSummary, useAdminSnapshot } from '../../../../modules/analytics/hooks/useAnalytics';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { formatCurrency } from '../../../../shared/utils/format';

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return <div className={`analytics-metric ${tone ?? ''}`}><span>{label}</span><strong>{value}</strong></div>;
}

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useRevenueSummary();
  const { data: adminKpis, isLoading: kpisLoading } = useAdminSnapshot();

  if (summaryLoading || kpisLoading) return <LoadingState />;

  const activeRatio = adminKpis?.totalTenants ? Math.round(((adminKpis.activeTenants ?? 0) / adminKpis.totalTenants) * 100) : 0;

  return (
    <div className="analytics-page">
      <section className="analytics-header">
        <div><span>Platform Intelligence</span><h1>Analytics</h1><p>Ringkasan revenue, transaksi, tenant, dan indikator operasional super admin.</p></div>
      </section>

      <section className="analytics-metric-grid">
        <MetricCard label="Total Revenue" value={formatCurrency(summary?.totalRevenue ?? 0)} tone="dark" />
        <MetricCard label="Transactions" value={(summary?.transactionCount ?? 0).toLocaleString('id-ID')} />
        <MetricCard label="Total DP" value={formatCurrency(summary?.totalDp ?? 0)} />
        <MetricCard label="Refund" value={formatCurrency(summary?.totalRefund ?? 0)} tone="danger" />
      </section>

      <section className="analytics-grid">
        <div className="analytics-panel revenue-panel">
          <div className="panel-head"><div><span>Revenue Snapshot</span><h2>{formatCurrency(summary?.totalRevenue ?? 0)}</h2><p>Akumulasi revenue yang tersedia dari endpoint ringkasan analytics.</p></div></div>
          <div className="chart-placeholder">
            {[38, 52, 46, 70, 64, 88].map((height, index) => <div className="chart-bar-wrap" key={index}><div className="chart-bar" style={{ height: `${height}%` }} /><span>{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'][index]}</span></div>)}
          </div>
          <div className="analytics-note">Chart ini placeholder visual sampai endpoint time-series revenue tersedia.</div>
        </div>

        <div className="analytics-panel snapshot-panel">
          <div className="panel-head"><div><span>Admin Snapshot</span><h2>{activeRatio}% Tenant Aktif</h2><p>{adminKpis?.activeTenants ?? 0} dari {adminKpis?.totalTenants ?? 0} tenant aktif.</p></div></div>
          <div className="ratio-track"><div className="ratio-fill" style={{ width: `${activeRatio}%` }} /></div>
          <div className="snapshot-list">
            <div><span>Total Tenants</span><strong>{adminKpis?.totalTenants ?? 0}</strong></div>
            <div><span>Expired</span><strong>{adminKpis?.expiredSubscriptions ?? 0}</strong></div>
            <div><span>WA Pending</span><strong>{adminKpis?.whatsappQueuePending ?? 0}</strong></div>
          </div>
        </div>
      </section>

      <style jsx global>{`.analytics-page{max-width:1440px;margin:0 auto}.analytics-header{margin-bottom:22px}.analytics-header span,.panel-head span{color:#76777d;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.analytics-header h1{margin:6px 0 0;font-size:36px;line-height:44px;font-weight:900;letter-spacing:-.03em}.analytics-header p,.panel-head p{margin:6px 0 0;color:#45464d}.analytics-metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}.analytics-metric{background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:20px}.analytics-metric.dark{background:#131b2e;border-color:#131b2e}.analytics-metric.danger{background:#fff5f3}.analytics-metric span{color:#76777d;font-size:12px;font-weight:900;text-transform:uppercase}.analytics-metric strong{display:block;margin-top:12px;font-size:26px;line-height:34px;font-weight:900}.analytics-metric.dark span,.analytics-metric.dark strong{color:#fff}.analytics-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(340px,.75fr);gap:24px}.analytics-panel{background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:24px}.panel-head{margin-bottom:20px}.panel-head h2{margin:6px 0 0;font-size:28px;font-weight:900;letter-spacing:-.03em}.chart-placeholder{height:300px;display:flex;align-items:flex-end;gap:14px;padding:12px 0}.chart-bar-wrap{height:100%;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:10px}.chart-bar{width:100%;max-width:86px;border-radius:13px 13px 4px 4px;background:linear-gradient(180deg,#2170e4,#004395)}.chart-bar-wrap span{color:#76777d;font-size:12px;font-weight:800}.analytics-note{padding:13px 15px;border-radius:14px;background:#f6f3f5;color:#45464d;font-size:13px;font-weight:700}.ratio-track{height:11px;border-radius:999px;background:#e4e2e4;overflow:hidden}.ratio-fill{height:100%;border-radius:inherit;background:#2170e4}.snapshot-list{display:grid;gap:12px;margin-top:22px}.snapshot-list div{display:flex;justify-content:space-between;padding:14px;border-radius:14px;background:#f6f3f5}.snapshot-list span{color:#76777d;font-weight:800}.snapshot-list strong{font-weight:900}@media(max-width:1000px){.analytics-metric-grid{grid-template-columns:repeat(2,1fr)}.analytics-grid{grid-template-columns:1fr}}@media(max-width:640px){.analytics-metric-grid{grid-template-columns:1fr}}`}</style>
    </div>
  );
}
