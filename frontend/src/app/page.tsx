import Link from 'next/link';

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', padding: 24 }}>
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 0' }}>
        <p style={{ margin: '0 0 12px', color: '#0f4c81', fontWeight: 700 }}>SatuJasa</p>
        <h1 style={{ margin: '0 0 16px', fontSize: 44, lineHeight: 1.1, color: '#102A43' }}>
          Platform pengurusan dokumen kendaraan untuk biro jasa.
        </h1>
        <p style={{ margin: '0 0 28px', maxWidth: 680, color: '#52606D', fontSize: 18, lineHeight: 1.7 }}>
          Landing page publik akan ditempatkan di route utama. Untuk saat ini halaman ini menjadi placeholder agar struktur route siap sebelum desain final dibuat.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/login" style={{ padding: '12px 18px', borderRadius: 10, background: '#0f4c81', color: '#fff', fontWeight: 700 }}>
            Masuk Dashboard
          </Link>
          <Link href="/privacy" style={{ padding: '12px 18px', borderRadius: 10, background: '#fff', color: '#0f4c81', fontWeight: 700, border: '1px solid #D9E2EC' }}>
            Kebijakan Privasi
          </Link>
        </div>
      </section>
    </main>
  );
}
