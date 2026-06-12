'use client';

export default function AuthError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: 16, background: '#fff', boxShadow: '0 14px 40px rgba(15, 76, 129, 0.12)' }}>
      <p style={{ margin: '0 0 8px', color: '#d32f2f', fontSize: 13, fontWeight: 700 }}>Auth error</p>
      <h1 style={{ margin: '0 0 12px', color: '#102A43', fontSize: 22 }}>Form tidak dapat dimuat</h1>
      <p style={{ margin: '0 0 20px', color: '#52606D', lineHeight: 1.6 }}>{error.message || 'Silakan muat ulang form dan coba lagi.'}</p>
      <button
        onClick={reset}
        style={{ border: 0, borderRadius: 10, background: '#0f4c81', color: '#fff', cursor: 'pointer', fontWeight: 700, padding: '11px 18px' }}
      >
        Coba lagi
      </button>
    </div>
  );
}
