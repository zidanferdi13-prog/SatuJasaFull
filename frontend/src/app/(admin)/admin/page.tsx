'use client';

import Link from 'next/link';
import { useAdminDashboard } from '../../../modules/dashboard/hooks/useDashboard';
import { useTenants } from '../../../modules/tenants/hooks/useTenants';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { LoadingState } from '../../../shared/components/LoadingState';
import { Tenant } from '../../../shared/types';
import { formatDate, isExpired } from '../../../shared/utils/format';

function formatNumber(value: number) {
  return value.toLocaleString('id-ID');
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function KpiCard({
  label,
  value,
  helper,
  active,
}: {
  label: string;
  value: string;
  helper: string;
  active?: boolean;
}) {
  return (
    <div className={active ? 'kpi-card kpi-card-dark' : 'kpi-card'}>
      <div className="kpi-topline">
        <div className="kpi-icon" />
        <span>{helper}</span>
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function TenantRow({ tenant }: { tenant: Tenant }) {
  const expired = isExpired(tenant.subscriptionEnd);
  const initials = tenant.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link className="tenant-row" href={`/admin/tenants/${tenant.id}`}>
      <div className="tenant-avatar">{initials}</div>
      <div className="tenant-info">
        <div className="tenant-title-line">
          <span className="tenant-name">{tenant.name}</span>
          <span className="tenant-code">{tenant.code}</span>
        </div>
        <div className="tenant-meta">
          <span>{tenant._count?.transactions ?? 0} transaksi</span>
          <span>Subscription {formatDate(tenant.subscriptionEnd)}</span>
        </div>
      </div>
      <div className="tenant-right">
        <StatusBadge status={tenant.subscriptionStatus} type="tenant" />
        {expired && <span className="expired-label">Expired</span>}
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useAdminDashboard();
  const { data: tenants, isLoading: tenantsLoading } = useTenants();

  if (kpisLoading) return <LoadingState />;

  const tenantList = tenants?.data?.slice(0, 5) ?? [];
  const totalTenants = kpis?.totalTenants ?? 0;
  const activeTenants = kpis?.activeTenants ?? 0;
  const activeRatio = totalTenants ? Math.round((activeTenants / totalTenants) * 100) : 0;

  return (
    <div className="dashboard-page">
      <section className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan platform untuk tenant, subscription, transaksi, dan operasional sistem.</p>
        </div>
        <div className="heading-actions">
          <Link href="/admin/analytics" className="secondary-btn">Analytics</Link>
          <Link href="/admin/tenants" className="primary-btn">Manage Tenants</Link>
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard label="Total Tenants" value={formatNumber(totalTenants)} helper="Platform" />
        <KpiCard label="Active Tenants" value={formatNumber(activeTenants)} helper={`${activeRatio}% aktif`} />
        <KpiCard label="Total Transactions" value={formatNumber(kpis?.totalTransactions ?? 0)} helper="All time" />
        <KpiCard label="Expired Subscriptions" value={formatNumber(kpis?.expiredSubscriptions ?? 0)} helper="Action needed" active />
      </section>

      <section className="content-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Revenue Platform</span>
              <h2>{formatRupiah(kpis?.platformMonthlyRevenue ?? 0)}</h2>
              <p>Estimasi revenue platform bulan ini dari tenant aktif.</p>
            </div>
            <select aria-label="Range">
              <option>Bulan Ini</option>
              <option>6 Bulan</option>
            </select>
          </div>

          <div className="bar-chart" aria-hidden>
            {[42, 58, 74, 61, 86, 96].map((height, index) => (
              <div className="bar-item" key={index}>
                <div className={index === 5 ? 'bar active' : 'bar'} style={{ height: `${height}%` }} />
                <span>{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'][index]}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="right-column">
          <div className="panel health-panel">
            <span className="panel-kicker">Platform Health</span>
            <h2>{activeRatio}%</h2>
            <p>{formatNumber(activeTenants)} dari {formatNumber(totalTenants)} tenant aktif.</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${activeRatio}%` }} />
            </div>
          </div>

          <div className="panel queue-panel">
            <span className="panel-kicker">WhatsApp Queue</span>
            <strong>{formatNumber(kpis?.whatsappQueuePending ?? 0)}</strong>
            <p>Pesan pending yang perlu dipantau oleh super admin.</p>
            <Link href="/admin/notifications">Buka Notifikasi</Link>
          </div>
        </aside>
      </section>

      <section className="panel tenants-panel">
        <div className="panel-header compact">
          <div>
            <span className="panel-kicker">Tenant Monitoring</span>
            <h2>Tenant terbaru</h2>
          </div>
          <Link href="/admin/tenants" className="text-link">View All</Link>
        </div>

        <div className="tenant-list">
          {tenantsLoading ? (
            <div className="empty-state">Memuat tenant...</div>
          ) : tenantList.length > 0 ? (
            tenantList.map((tenant) => <TenantRow key={tenant.id} tenant={tenant} />)
          ) : (
            <div className="empty-state">Belum ada tenant.</div>
          )}
        </div>
      </section>

      <style jsx global>{`
        .dashboard-page {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
        }

        .page-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          font-size: 36px;
          line-height: 44px;
          letter-spacing: -0.02em;
          font-weight: 900;
          color: #1b1b1d;
        }

        .page-heading p,
        .panel p {
          margin: 6px 0 0;
          color: #45464d;
          font-size: 15px;
          line-height: 24px;
        }

        .heading-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .primary-btn,
        .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
        }

        .primary-btn {
          background: #131b2e;
          color: #ffffff;
        }

        .secondary-btn {
          border: 1px solid #c6c6cd;
          background: #ffffff;
          color: #131b2e;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-card {
          min-height: 154px;
          padding: 22px;
          border: 1px solid #c6c6cd;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(27, 27, 29, 0.04);
        }

        .kpi-card-dark {
          position: relative;
          overflow: hidden;
          background: #131b2e;
          color: #ffffff;
          border-color: #131b2e;
        }

        .kpi-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          color: #76777d;
          font-size: 12px;
          font-weight: 800;
        }

        .kpi-card-dark .kpi-topline,
        .kpi-card-dark p {
          color: rgba(255, 255, 255, 0.72);
        }

        .kpi-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #2170e4;
          opacity: 0.16;
        }

        .kpi-card p {
          margin: 0;
          color: #45464d;
          font-size: 14px;
          font-weight: 700;
        }

        .kpi-card strong {
          display: block;
          margin-top: 6px;
          color: inherit;
          font-size: 30px;
          line-height: 38px;
          letter-spacing: -0.03em;
          font-weight: 900;
        }

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(300px, 0.92fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .panel {
          border: 1px solid #c6c6cd;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(27, 27, 29, 0.04);
        }

        .chart-panel,
        .health-panel,
        .queue-panel,
        .tenants-panel {
          padding: 24px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 24px;
        }

        .panel-header.compact {
          margin-bottom: 16px;
        }

        .panel-kicker {
          color: #76777d;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        h2 {
          margin: 6px 0 0;
          color: #1b1b1d;
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.01em;
          font-weight: 900;
        }

        select {
          min-height: 34px;
          border: 1px solid #c6c6cd;
          border-radius: 9px;
          background: #f6f3f5;
          color: #45464d;
          padding: 0 10px;
        }

        .bar-chart {
          height: 270px;
          display: flex;
          align-items: flex-end;
          gap: 14px;
          padding-top: 12px;
        }

        .bar-item {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .bar {
          width: 100%;
          max-width: 78px;
          border-radius: 10px 10px 3px 3px;
          background: #e4e2e4;
        }

        .bar.active {
          background: #2170e4;
        }

        .bar-item span {
          color: #76777d;
          font-size: 12px;
          font-weight: 700;
        }

        .right-column {
          display: grid;
          gap: 24px;
        }

        .progress-track {
          height: 9px;
          margin-top: 20px;
          border-radius: 999px;
          overflow: hidden;
          background: #e4e2e4;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #2170e4;
        }

        .queue-panel {
          background: #131b2e;
          color: #ffffff;
          border-color: #131b2e;
        }

        .queue-panel .panel-kicker,
        .queue-panel p {
          color: rgba(255, 255, 255, 0.72);
        }

        .queue-panel strong {
          display: block;
          margin-top: 10px;
          font-size: 56px;
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .queue-panel a,
        .text-link {
          display: inline-flex;
          margin-top: 14px;
          color: #2170e4;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .queue-panel a {
          color: #d8e2ff;
        }

        .tenant-list {
          display: grid;
          gap: 10px;
        }

        .tenant-row {
          display: grid;
          grid-template-columns: 40px minmax(0, 1fr) auto;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border: 1px solid #e4e2e4;
          border-radius: 14px;
          background: #fcf8fa;
          color: inherit;
          text-decoration: none;
        }

        .tenant-row:hover {
          border-color: #2170e4;
          background: #ffffff;
        }

        .tenant-avatar {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #dae2fd;
          color: #131b2e;
          font-size: 12px;
          font-weight: 900;
        }

        .tenant-info {
          min-width: 0;
        }

        .tenant-title-line {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .tenant-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #1b1b1d;
          font-size: 14px;
          font-weight: 900;
        }

        .tenant-code,
        .expired-label {
          flex-shrink: 0;
          padding: 2px 7px;
          border-radius: 999px;
          background: #d8e2ff;
          color: #004395;
          font-size: 10px;
          font-weight: 900;
        }

        .expired-label {
          background: #ffdad6;
          color: #93000a;
        }

        .tenant-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
          color: #76777d;
          font-size: 12px;
        }

        .tenant-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .empty-state {
          padding: 24px;
          border-radius: 14px;
          background: #f6f3f5;
          color: #45464d;
          text-align: center;
          font-weight: 700;
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .page-heading,
          .panel-header {
            flex-direction: column;
            align-items: stretch;
          }

          .heading-actions {
            flex-direction: column;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .tenant-row {
            grid-template-columns: 40px minmax(0, 1fr);
          }

          .tenant-right {
            grid-column: 2 / 3;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
