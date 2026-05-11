'use client';

import { useEffect, useState } from 'react';
import client from '../api/client';
import styles from './page.module.css';

interface Bureau {
  id: string;
  name: string;
  status: string;
  subscription_plan: string;
}

export default function Dashboard() {
  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBureaus();
  }, []);

  const loadBureaus = async () => {
    setIsLoading(true);
    try {
      const response = await client.get('/admin/bureaus');
      setBureaus(response.data.data || []);
    } catch (error) {
      console.error('Error loading bureaus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Selamat datang di STNK Bureau Admin</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{bureaus.length}</div>
          <div className={styles.statLabel}>Total Bureaus</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{bureaus.filter((b) => b.status === 'ACTIVE').length}</div>
          <div className={styles.statLabel}>Active Bureaus</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Bureaus</h2>
          <a href="/bureaus" className={styles.link}>
            View All →
          </a>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : bureaus.length === 0 ? (
          <p className={styles.empty}>No bureaus found</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>Name</div>
              <div className={styles.tableCell}>Status</div>
              <div className={styles.tableCell}>Plan</div>
            </div>
            {bureaus.slice(0, 5).map((bureau) => (
              <div key={bureau.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{bureau.name}</div>
                <div className={styles.tableCell}>
                  <span
                    className={`${styles.badge} ${styles[`badge${bureau.status}`]}`}
                  >
                    {bureau.status}
                  </span>
                </div>
                <div className={styles.tableCell}>{bureau.subscription_plan}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
