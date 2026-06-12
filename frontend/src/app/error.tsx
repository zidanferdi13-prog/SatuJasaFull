'use client';

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="id">
      <body>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#F5F7FA' }}>
          <section style={{ width: '100%', maxWidth: 460, padding: 28, borderRadius: 16, background: '#fff', boxShadow: '0 16px 48px rgba(15, 76, 129, 0.12)' }}>
            <p style={{ margin: '0 0 8px', color: '#d32f2f', fontSize: 13, fontWeight: 700 }}>Terjadi kesalahan</p>
            <h1 style={{ margin: '0 0 12px', color: '#102A43', fontSize: 24 }}>Halaman tidak dapat dimuat</h1>
            <p style={{ margin: '0 0 20px', color: '#52606D', lineHeight: 1.6 }}>{error.message || 'Silakan coba lagi beberapa saat.'}</p>
            <button
              onClick={reset}
              style={{ border: 0, borderRadius: 10, background: '#0f4c81', color: '#fff', cursor: 'pointer', fontWeight: 700, padding: '11px 18px' }}
            >
              Coba lagi
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
