import type { Metadata } from 'next';
import './globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'STNK Bureau Admin',
  description: 'Service Management System for STNK Bureau',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className={styles.container}>
          <nav className={styles.navbar}>
            <div className={styles.navContent}>
              <div className={styles.logo}>STNK Bureau</div>
              <div className={styles.navLinks}>
                <a href="/dashboard">Dashboard</a>
                <a href="/bureaus">Bureaus</a>
                <a href="/transactions">Transactions</a>
                <a href="/profile">Profile</a>
              </div>
            </div>
          </nav>
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
