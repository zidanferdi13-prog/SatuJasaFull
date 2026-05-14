'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/transactions', label: 'Transaksi' },
  { href: '/dashboard/customers', label: 'Pelanggan' },
  { href: '/dashboard/vehicles', label: 'Kendaraan' },
  { href: '/dashboard/branches', label: 'Cabang' },
  { href: '/dashboard/revenue', label: 'Revenue' },
  { href: '/dashboard/settings', label: 'Pengaturan' },
  { href: '/dashboard/subscription', label: 'Langganan' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().initFromStorage();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user && user.role === 'SUPER_ADMIN') {
      router.replace('/admin');
    }
  }, [isAuthenticated, user, router, isHydrated]);

  if (!isHydrated) return null;
  if (!isAuthenticated || !user || user.role === 'SUPER_ADMIN') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#0f4c81',
        color: 'white',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{user.tenantName}</div>
          <div style={{ fontSize: 11, color: '#90caf9', marginTop: 2 }}>{user.tenantCode}</div>
        </div>

        <nav style={{ padding: '16px 0', flex: 1 }}>
          {NAV_ITEMS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '10px 20px',
                color: '#cce5ff',
                textDecoration: 'none',
                fontSize: 14,
                borderLeft: '3px solid transparent',
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: '#90caf9', marginBottom: 8 }}>{user.role}</div>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              router.push('/login');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Subscription expired banner */}
      {useAuthStore.getState().subscriptionExpired && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: '#d32f2f', color: 'white', padding: '12px 24px',
          textAlign: 'center', fontSize: 14, fontWeight: 600,
        }}>
          Langganan Anda telah berakhir. Hubungi super admin untuk perpanjangan.{' '}
          <a href="/dashboard/subscription" style={{ color: '#fff', textDecoration: 'underline' }}>
            Lihat Detail
          </a>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, background: '#F5F7FA', padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
