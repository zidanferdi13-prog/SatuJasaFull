'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    if (user && user.role !== 'SUPER_ADMIN') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router, isHydrated]);

  if (!isHydrated) return null;
  if (!isAuthenticated || !user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#1a1a2e',
        color: 'white',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>STNK Bureau</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Super Admin</div>
        </div>
        <nav style={{ padding: '16px 0', flex: 1 }}>
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/tenants', label: 'Tenants' },
            { href: '/admin/subscriptions', label: 'Subscriptions' },
            { href: '/admin/analytics', label: 'Analytics' },
            { href: '/admin/promotions', label: 'Promotions' },
            { href: '/admin/notifications', label: 'Notifications' },
            { href: '/admin/audit', label: 'Audit Logs' },
            { href: '/admin/monitoring', label: 'Monitoring' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '10px 20px',
                color: '#ccc',
                textDecoration: 'none',
                fontSize: 14,
                borderLeft: '3px solid transparent',
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>{user.name}</div>
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

      {/* Main content */}
      <main style={{ flex: 1, background: '#F5F7FA', padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
