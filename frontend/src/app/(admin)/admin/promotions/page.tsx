'use client';

export default function PromotionsPage() {
  return (
    <div className="promotions-page">
      <section className="promo-hero">
        <div>
          <span>Campaign Studio</span>
          <h1>Promotions</h1>
          <p>Ruang untuk mengelola promo platform, voucher tenant, dan campaign diskon saat backend fitur promosi sudah tersedia.</p>
        </div>
        <button disabled>+ New Promotion</button>
      </section>

      <section className="promo-empty-panel">
        <div className="promo-orb">%</div>
        <span>Coming Soon</span>
        <h2>Belum ada promosi aktif</h2>
        <p>Fitur manajemen promosi belum memiliki endpoint backend. UI ini disiapkan agar konsisten dengan halaman super admin lainnya.</p>
        <div className="promo-preview-grid">
          <div><strong>Voucher Code</strong><span>Potongan khusus tenant atau pelanggan.</span></div>
          <div><strong>Campaign Rules</strong><span>Tanggal aktif, kuota, dan minimum transaksi.</span></div>
          <div><strong>Performance</strong><span>Monitoring penggunaan promo per tenant.</span></div>
        </div>
      </section>

      <style jsx global>{`.promotions-page{max-width:1440px;margin:0 auto}.promo-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:24px}.promo-hero span,.promo-empty-panel>span{color:#76777d;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.promo-hero h1{margin:6px 0 0;font-size:36px;line-height:44px;font-weight:900;letter-spacing:-.03em}.promo-hero p{margin:6px 0 0;max-width:760px;color:#45464d}.promo-hero button{min-height:42px;padding:0 16px;border-radius:11px;background:#131b2e;color:#fff;font-weight:900;opacity:.5;cursor:not-allowed}.promo-empty-panel{position:relative;overflow:hidden;display:grid;place-items:center;min-height:520px;padding:48px 24px;border:1px solid #c6c6cd;border-radius:24px;background:#fff;text-align:center}.promo-empty-panel:before{content:'';position:absolute;inset:24px;border:1px dashed #c6c6cd;border-radius:18px}.promo-orb{position:relative;z-index:1;display:grid;place-items:center;width:88px;height:88px;border-radius:28px;background:#131b2e;color:#fff;font-size:38px;font-weight:900;box-shadow:0 22px 60px rgba(19,27,46,.22)}.promo-empty-panel>span,.promo-empty-panel h2,.promo-empty-panel p,.promo-preview-grid{position:relative;z-index:1}.promo-empty-panel>span{display:block;margin-top:24px}.promo-empty-panel h2{margin:8px 0 0;font-size:30px;font-weight:900;letter-spacing:-.03em}.promo-empty-panel p{max-width:620px;margin:8px 0 0;color:#45464d;line-height:24px}.promo-preview-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:min(920px,100%);margin-top:28px}.promo-preview-grid div{padding:18px;border-radius:16px;background:#f6f3f5;text-align:left}.promo-preview-grid strong{display:block;font-weight:900}.promo-preview-grid span{display:block;margin-top:5px;color:#76777d;font-size:13px;line-height:20px}@media(max-width:800px){.promo-hero{flex-direction:column;align-items:stretch}.promo-preview-grid{grid-template-columns:1fr}}`}</style>
    </div>
  );
}
