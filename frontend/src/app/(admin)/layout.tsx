'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import icon from '../../../assets/icon.png';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/tenants', label: 'Tenants', icon: 'tenants' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: 'subscription' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/admin/promotions', label: 'Promotions', icon: 'promotion' },
  { href: '/admin/notifications', label: 'Notifications', icon: 'notification' },
  { href: '/admin/audit', label: 'Audit Logs', icon: 'audit' },
  { href: '/admin/monitoring', label: 'Monitoring', icon: 'monitoring' },
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    dashboard: <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9-3h7v10h-7V10Z" />,
    tenants: <path d="M7 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm-3 9a7 7 0 0 1 14 0v1H4v-1Zm13-8a3 3 0 1 0 0-6 5.96 5.96 0 0 1 0 6Zm2.5 9H22v-1a5.5 5.5 0 0 0-4.2-5.34A8.96 8.96 0 0 1 19.5 20Z" />,
    subscription: <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm3 2v2h10V8H7Zm0 4v2h6v-2H7Zm0 4v2h8v-2H7Z" />,
    analytics: <path d="M5 19h14v2H3V3h2v16Zm2-2V9h3v8H7Zm5 0V5h3v12h-3Zm5 0v-6h3v6h-3Z" />,
    promotion: <path d="M20 6v9a2 2 0 0 1-2 2h-2l-4 4v-4H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Zm-5.5 3.5L12 7 9.5 9.5 7 7v7h10V7l-2.5 2.5Z" />,
    notification: <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6-2-2v-4a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v4l-2 2v1h14v-1Z" />,
    audit: <path d="M6 3h9l3 3v15H6V3Zm8 1.5V7h2.5L14 4.5ZM8 10h8V8H8v2Zm0 4h8v-2H8v2Zm0 4h5v-2H8v2Z" />,
    monitoring: <path d="M3 5h18v12H3V5Zm2 2v8h14V7H5Zm3 13v-2h8v2H8Zm1-7 2.2-3 2.1 2.4L15.5 9 18 13H9Z" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-svg">
      {paths[name] || paths.dashboard}
    </svg>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand-block">
          <Image src={icon} alt="SatuJasa" width={42} height={42} className="brand-logo" />
          <div>
            <div className="brand-title">SatuJasa Admin</div>
            <div className="brand-subtitle">Super Admin Portal</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                <span className="nav-icon"><NavIcon name={item.icon} /></span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user.name?.slice(0, 1).toUpperCase() || 'A'}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">Super Admin</div>
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={() => {
              useAuthStore.getState().logout();
              router.push('/login');
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-main-shell">
        <header className="admin-topbar">
          <div>
            <div className="topbar-kicker">SatuJasa Platform</div>
            <div className="topbar-title">Super Admin</div>
          </div>
          <div className="topbar-search">Search tenants, subscriptions, transactions...</div>
        </header>
        <main className="admin-content">{children}</main>
      </div>

      <style jsx global>{`
        .admin-layout {
          min-height: 100vh;
          display: flex;
          background: #fcf8fa;
          color: #1b1b1d;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .admin-sidebar {
          position: sticky;
          top: 0;
          width: 280px;
          height: 100vh;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 18px 14px;
          border-right: 1px solid #c6c6cd;
          background: #f0edef;
        }

        .brand-block {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px 26px;
        }

        .brand-logo {
          border-radius: 12px;
          box-shadow: 0 10px 24px rgba(0, 88, 190, 0.22);
        }

        .brand-title {
          font-size: 17px;
          line-height: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .brand-subtitle {
          font-size: 12px;
          line-height: 16px;
          color: #45464d;
        }

        .admin-nav {
          display: grid;
          gap: 4px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 42px;
          padding: 9px 12px;
          border-radius: 10px;
          color: #45464d;
          font-size: 14px;
          line-height: 20px;
          font-weight: 700;
          text-decoration: none;
          transition: background 160ms ease, color 160ms ease;
        }

        .nav-item:hover {
          background: #e4e2e4;
          color: #1b1b1d;
        }

        .nav-item.active {
          background: #2170e4;
          color: #ffffff;
        }

        .nav-icon {
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
          color: inherit;
        }

        .nav-svg {
          width: 17px;
          height: 17px;
          fill: currentColor;
        }

        .sidebar-footer {
          display: grid;
          gap: 12px;
          padding: 16px 8px 4px;
          border-top: 1px solid #c6c6cd;
        }

        .user-chip {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: #131b2e;
          color: #ffffff;
          font-weight: 900;
        }

        .user-name {
          font-size: 13px;
          font-weight: 800;
        }

        .user-role {
          font-size: 11px;
          color: #76777d;
        }

        .logout-btn {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          background: #ffdad6;
          color: #93000a;
          font-weight: 800;
        }

        .admin-main-shell {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 16px 32px;
          border-bottom: 1px solid #c6c6cd;
          background: rgba(252, 248, 250, 0.92);
          backdrop-filter: blur(12px);
        }

        .topbar-kicker {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #76777d;
        }

        .topbar-title {
          margin-top: 2px;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .topbar-search {
          width: min(420px, 42vw);
          padding: 11px 16px;
          border: 1px solid #c6c6cd;
          border-radius: 999px;
          background: #f0edef;
          color: #76777d;
          font-size: 13px;
        }

        .admin-content {
          min-width: 0;
          flex: 1;
          padding: 32px;
        }

        @media (max-width: 900px) {
          .admin-layout {
            display: block;
          }

          .admin-sidebar {
            position: relative;
            width: 100%;
            height: auto;
          }

          .admin-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-topbar {
            padding: 14px 18px;
          }

          .topbar-search {
            display: none;
          }

          .admin-content {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
}
