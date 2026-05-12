'use client';

import { useEffect, useState } from 'react';
import client from '../api/client';
import styles from './page.module.css';

interface AdminKpis {
  totalTenants: number;
  activeTenants: number;
  totalTransactions: number;
  expiredSubscriptions: number;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<AdminKpis | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadKpis(), loadTenants()]).finally(() => setLoading(false));
  }, []);

  const loadKpis = async () => {
    try {
      const { data } = await client.get('/admin/dashboard');
      setKpis(data);
    } catch (err) { console.error('Failed to load KPIs', err); }
  };

  const loadTenants = async () => {
    try {
      const { data } = await client.get('/admin/tenants');
      setTenants(data);
    } catch (err) { console.error('Failed to load tenants', err); }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Super Admin Dashboard</h1>
        <p>Platform monitoring & tenant management</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{kpis?.totalTenants || 0}</div>
          <div className={styles.statLabel}>Total Tenants</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{kpis?.activeTenants || 0}</div>
          <div className={styles.statLabel}>Active Tenants</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{kpis?.totalTransactions || 0}</div>
          <div className={styles.statLabel}>Total Transactions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: '#c62828' }}>{kpis?.expiredSubscriptions || 0}</div>
          <div className={styles.statLabel}>Expired Subs</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Tenants</h2>
          <a href="/tenants" className={styles.link}>Manage All →</a>
        </div>

        {loading ? <p>Loading...</p> : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>Name / Code</div>
              <div className={styles.tableCell}>Sub End</div>
              <div className={styles.tableCell}>Trx</div>
              <div className={styles.tableCell}>Status</div>
            </div>
            {tenants.slice(0, 10).map((t: any) => (
              <div key={t.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <strong>{t.name}</strong>
                  <div style={{ fontSize: 12, color: '#007AFF' }}>{t.code}</div>
                </div>
                <div className={styles.tableCell}>
                  <span style={{ color: new Date(t.subscriptionEnd) < new Date() ? '#c62828' : 'inherit' }}>
                    {new Date(t.subscriptionEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.tableCell}>{t._count?.transactions || 0}</div>
                <div className={styles.tableCell}>
                  <span className={`${styles.badge} ${styles[`badge${t.status}`]}`}>{t.status}</span>
                </div>
              </div>
            ))}
            {tenants.length === 0 && <p className={styles.empty}>No tenants yet</p>}
          </div>
        )}
      </div>
    </div>
  );
}
