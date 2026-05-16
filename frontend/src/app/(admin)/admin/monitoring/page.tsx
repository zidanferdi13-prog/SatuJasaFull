'use client';

import { LoadingState } from '../../../../shared/components/LoadingState';
import { useAdminDashboard } from '../../../../modules/dashboard/hooks/useDashboard';

const services = [
  { label: 'API Server', status: 'Operational', source: 'Static service check placeholder' },
  { label: 'Database', status: 'Operational', source: 'Static service check placeholder' },
  { label: 'Redis Cache', status: 'Operational', source: 'Static service check placeholder' },
  { label: 'WhatsApp Worker', status: 'Operational', source: 'Static service check placeholder' },
];

function HealthCard({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return <div className={`monitor-health-card ${tone ?? ''}`}><span>{label}</span><strong>{value}</strong></div>;
}

export default function MonitoringPage() {
  const { data: kpis, isLoading } = useAdminDashboard();

  if (isLoading) return <LoadingState />;

  return (
    <div className="monitor-page">
      <section className="monitor-header">
        <div><span>System Command Center</span><h1>Monitoring</h1><p>Pantau KPI live dari dashboard admin dan status layanan pendukung platform.</p></div>
      </section>

      <section className="monitor-health-grid">
        <HealthCard label="Total Tenants" value={kpis?.totalTenants ?? 0} tone="dark" />
        <HealthCard label="Active Tenants" value={kpis?.activeTenants ?? 0} />
        <HealthCard label="Transactions" value={(kpis?.totalTransactions ?? 0).toLocaleString('id-ID')} />
        <HealthCard label="Expired Subs" value={kpis?.expiredSubscriptions ?? 0} tone="danger" />
      </section>

      <section className="monitor-grid">
        <div className="monitor-panel live-panel">
          <div className="panel-head"><div><span>Live Data</span><h2>Queue & Revenue</h2></div></div>
          <div className="live-metrics">
            <div><span>WhatsApp Pending</span><strong>{kpis?.whatsappQueuePending ?? 0}</strong></div>
            <div><span>Platform Revenue</span><strong>Rp {(kpis?.platformMonthlyRevenue ?? 0).toLocaleString('id-ID')}</strong></div>
          </div>
          <p>Angka di panel ini berasal dari endpoint dashboard admin yang sudah aktif.</p>
        </div>

        <div className="monitor-panel service-panel">
          <div className="panel-head"><div><span>Service Status</span><h2>Health layanan</h2></div></div>
          <div className="service-list">
            {services.map((service) => (
              <div className="service-row" key={service.label}>
                <div><strong>{service.label}</strong><span>{service.source}</span></div>
                <span className="service-chip">{service.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`.monitor-page{max-width:1440px;margin:0 auto}.monitor-header{margin-bottom:22px}.monitor-header span,.panel-head span{color:#76777d;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.monitor-header h1{margin:6px 0 0;font-size:36px;line-height:44px;font-weight:900;letter-spacing:-.03em}.monitor-header p,.live-panel p{margin:6px 0 0;color:#45464d}.monitor-health-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}.monitor-health-card{background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:20px}.monitor-health-card.dark{background:#131b2e;border-color:#131b2e}.monitor-health-card.danger{background:#fff5f3}.monitor-health-card span{color:#76777d;font-size:12px;font-weight:900;text-transform:uppercase}.monitor-health-card strong{display:block;margin-top:12px;font-size:30px;font-weight:900}.monitor-health-card.dark span,.monitor-health-card.dark strong{color:#fff}.monitor-grid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:24px}.monitor-panel{background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:24px}.panel-head h2{margin:6px 0 0;font-size:24px;font-weight:900}.live-metrics{display:grid;gap:14px;margin:20px 0}.live-metrics div{padding:18px;border-radius:16px;background:#f6f3f5}.live-metrics span{color:#76777d;font-size:12px;font-weight:900;text-transform:uppercase}.live-metrics strong{display:block;margin-top:8px;font-size:30px;font-weight:900}.service-list{display:grid;gap:12px}.service-row{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px;border:1px solid #e4e2e4;border-radius:15px;background:#fcf8fa}.service-row div{display:grid;gap:4px}.service-row strong{font-weight:900}.service-row span{color:#76777d;font-size:12px}.service-chip{display:inline-flex;border-radius:999px;padding:5px 10px;background:#e8f5e9!important;color:#2e7d32!important;font-size:11px!important;font-weight:900;text-transform:uppercase}@media(max-width:1000px){.monitor-health-grid{grid-template-columns:repeat(2,1fr)}.monitor-grid{grid-template-columns:1fr}}@media(max-width:640px){.monitor-health-grid{grid-template-columns:1fr}.service-row{align-items:flex-start;flex-direction:column}}`}</style>
    </div>
  );
}
