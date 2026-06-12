'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section style={{ maxWidth: 560, padding: 28, borderRadius: 16, background: '#fff', boxShadow: '0 14px 40px rgba(15, 76, 129, 0.10)' }}>
      <p style={{ margin: '0 0 8px', color: '#d32f2f', fontSize: 13, fontWeight: 700 }}>Dashboard error</p>
      <h1 style={{ margin: '0 0 12px', color: '#102A43', fontSize: 24 }}>Data dashboard gagal dimuat</h1>
      <p style={{ margin: '0 0 20px', color: '#52606D', lineHeight: 1.6 }}>{error.message || 'Coba lagi untuk memuat ulang halaman ini.'}</p>
      <button
        onClick={reset}
        style={{ border: 0, borderRadius: 10, background: '#0f4c81', color: '#fff', cursor: 'pointer', fontWeight: 700, padding: '11px 18px' }}
      >
        Muat ulang
      </button>
    </section>
  );
}
