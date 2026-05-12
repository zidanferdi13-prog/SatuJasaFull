'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLogin } from '../../../modules/auth/hooks/useAuth';
import { useAuthStore } from '../../../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
      router.replace(destination);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const destination = data.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
          router.replace(destination);
        },
      },
    );
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: '40px 48px',
      width: '100%',
      maxWidth: 420,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>
        STNK Bureau
      </h1>
      <p style={{ color: '#666', marginBottom: 32, fontSize: 14 }}>
        Masuk ke dashboard admin
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="admin@example.com"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {loginMutation.error && (
          <p style={{ color: '#c62828', fontSize: 14, marginBottom: 16 }}>
            {(loginMutation.error as { message?: string }).message ?? 'Login gagal'}
          </p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          style={{
            width: '100%',
            padding: '12px',
            background: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: loginMutation.isPending ? 0.7 : 1,
          }}
        >
          {loginMutation.isPending ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
