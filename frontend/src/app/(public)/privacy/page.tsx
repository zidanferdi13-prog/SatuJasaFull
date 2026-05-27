import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SatuJasa',
  description: 'Kebijakan privasi layanan SatuJasa',
};

const sections = [
  {
    title: 'Data yang Kami Kumpulkan',
    body: 'SatuJasa memproses data akun, tenant, pelanggan, kendaraan, transaksi, dokumen pendukung, token perangkat, dan riwayat operasional yang diperlukan untuk menjalankan layanan pengurusan dokumen kendaraan.',
  },
  {
    title: 'Penggunaan Data',
    body: 'Data digunakan untuk autentikasi, pengelolaan tenant, pemrosesan transaksi, pelacakan status, pengingat masa berlaku STNK, notifikasi WhatsApp/push, audit operasional, keamanan, dan peningkatan layanan.',
  },
  {
    title: 'Penyimpanan dan Keamanan',
    body: 'Kami menerapkan autentikasi berbasis token, HttpOnly cookie untuk web, isolasi tenant, rate limiting, soft delete, dan kontrol akses berbasis peran. Dokumen transaksi disimpan sesuai konfigurasi storage backend.',
  },
  {
    title: 'Berbagi Data',
    body: 'Data dapat diproses oleh penyedia infrastruktur, layanan WhatsApp, layanan push notification, dan monitoring error hanya sejauh diperlukan untuk menjalankan fitur aplikasi.',
  },
  {
    title: 'Penghapusan Akun',
    body: 'Pengguna dapat meminta penghapusan akun melalui aplikasi. Akun akan dinonaktifkan dan ditandai terhapus, sesi aktif akan dicabut, sementara data transaksi yang diperlukan untuk audit dan kewajiban operasional tetap disimpan.',
  },
  {
    title: 'Kontak',
    body: 'Untuk pertanyaan privasi atau permintaan penghapusan data, hubungi administrator tenant atau tim pengelola SatuJasa.',
  },
];

export default function PrivacyPage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>SatuJasa</p>
        <h1 style={styles.title}>Kebijakan Privasi</h1>
        <p style={styles.subtitle}>
          Halaman ini menjelaskan bagaimana SatuJasa mengumpulkan, menggunakan, menyimpan, dan melindungi data pengguna.
        </p>
        <p style={styles.updated}>Terakhir diperbarui: 27 Mei 2026</p>
      </section>

      <section style={styles.card}>
        {sections.map((section) => (
          <article key={section.title} style={styles.section}>
            <h2 style={styles.sectionTitle}>{section.title}</h2>
            <p style={styles.body}>{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F7FAFC 0%, #EEF4FF 100%)',
    color: '#172033',
    padding: '56px 20px',
  },
  hero: {
    maxWidth: 860,
    margin: '0 auto 28px',
  },
  eyebrow: {
    margin: 0,
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    margin: '10px 0 14px',
    fontSize: 44,
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    maxWidth: 720,
    color: '#526070',
    fontSize: 18,
    lineHeight: 1.65,
  },
  updated: {
    margin: '18px 0 0',
    color: '#7A8797',
    fontSize: 14,
  },
  card: {
    maxWidth: 860,
    margin: '0 auto',
    background: '#FFFFFF',
    border: '1px solid #E3EAF6',
    borderRadius: 24,
    boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
    padding: 34,
  },
  section: {
    padding: '20px 0',
    borderBottom: '1px solid #EDF2F7',
  },
  sectionTitle: {
    margin: '0 0 10px',
    fontSize: 22,
  },
  body: {
    margin: 0,
    color: '#526070',
    fontSize: 16,
    lineHeight: 1.7,
  },
};
