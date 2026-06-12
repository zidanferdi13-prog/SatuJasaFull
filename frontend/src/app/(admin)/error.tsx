'use client';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="admin-error-card">
      <p className="admin-error-kicker">Admin error</p>
      <h1 className="admin-error-title">Panel admin gagal dimuat</h1>
      <p className="admin-error-message">{error.message || 'Coba lagi untuk memuat ulang panel admin.'}</p>
      <button className="admin-error-button" onClick={reset}>Muat ulang</button>
      <style jsx>{`
        .admin-error-card {
          max-width: 560px;
          padding: 28px;
          border-radius: 18px;
          border: 1px solid #c6c6cd;
          background: #ffffff;
          box-shadow: 0 18px 46px rgba(27, 27, 29, 0.08);
        }

        .admin-error-kicker {
          margin: 0 0 8px;
          color: #ba1a1a;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .admin-error-title {
          margin: 0 0 12px;
          color: #1b1b1d;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .admin-error-message {
          margin: 0 0 20px;
          color: #5f6067;
          line-height: 1.6;
        }

        .admin-error-button {
          border: 0;
          border-radius: 10px;
          background: #2170e4;
          color: #ffffff;
          cursor: pointer;
          font-weight: 900;
          padding: 11px 18px;
        }
      `}</style>
    </section>
  );
}
