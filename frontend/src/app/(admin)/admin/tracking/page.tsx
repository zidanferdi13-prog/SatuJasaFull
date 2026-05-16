'use client';

import { useState } from 'react';
import { useTracking } from '../../../../modules/tracking/hooks/useTracking';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { formatCurrency, formatDateTime } from '../../../../shared/utils/format';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="tracking-detail-row"><span>{label}</span><strong>{children}</strong></div>;
}

export default function AdminTrackingPage() {
  const [code, setCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const { data, isLoading, isError } = useTracking(submittedCode);

  const handleSearch = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed) setSubmittedCode(trimmed);
  };

  return (
    <div className="tracking-page">
      <section className="tracking-hero">
        <div className="tracking-copy">
          <span>Public Tracking Monitor</span>
          <h1>Cari status berkas kendaraan</h1>
          <p>Masukkan kode tracking untuk melihat detail transaksi, pembayaran, dan progres status yang dilihat pelanggan.</p>
        </div>
        <div className="tracking-search-card">
          <label>Kode Tracking</label>
          <div className="tracking-search-box">
            <input
              placeholder="TRK-ABC123"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>Cari</button>
          </div>
          <small>Gunakan kode dari invoice atau link tracking WhatsApp.</small>
        </div>
      </section>

      {isLoading && <LoadingState />}

      {isError && submittedCode && (
        <section className="tracking-error">
          <strong>Kode tracking tidak ditemukan</strong>
          <span>{submittedCode}</span>
        </section>
      )}

      {!submittedCode && !data && !isLoading && (
        <section className="tracking-empty">
          <span>⌕</span>
          <h2>Belum ada pencarian</h2>
          <p>Status transaksi akan tampil lengkap setelah kode tracking dimasukkan.</p>
        </section>
      )}

      {data && (
        <section className="tracking-result-grid">
          <div className="tracking-summary-card">
            <div className="tracking-card-head">
              <div><span>Transaction</span><h2>{data.invoiceNumber}</h2></div>
              <StatusBadge status={data.status} />
            </div>
            <div className="tracking-code-box">
              <span>Tracking Code</span>
              <strong>{data.trackingCode}</strong>
            </div>
            <DetailRow label="Pelanggan">{data.customer.name}</DetailRow>
            <DetailRow label="Tenant">{data.tenant.name} ({data.tenant.code})</DetailRow>
            <DetailRow label="Cabang">{data.branch.name}</DetailRow>
          </div>

          <div className="tracking-payment-card">
            <div className="tracking-card-head"><div><span>Payment</span><h2>Ringkasan Biaya</h2></div></div>
            <DetailRow label="Total Estimasi">{formatCurrency(data.estimatedTotal)}</DetailRow>
            <DetailRow label="Total Final">{formatCurrency(data.finalTotal)}</DetailRow>
            <DetailRow label="DP">{formatCurrency(data.dpAmount)}</DetailRow>
            <div className="remaining-box">
              <span>Sisa Bayar</span>
              <strong className={data.remainingAmount > 0 ? 'danger-text' : 'success-text'}>{formatCurrency(data.remainingAmount)}</strong>
            </div>
          </div>

          <div className="tracking-timeline-card">
            <div className="tracking-card-head"><div><span>Timeline</span><h2>Perjalanan Status</h2></div></div>
            {data.timeline.length === 0 ? (
              <div className="timeline-empty">Belum ada perubahan status.</div>
            ) : (
              <div className="tracking-timeline">
                {data.timeline.map((item, index) => (
                  <div className="timeline-item" key={`${item.createdAt}-${index}`}>
                    <div className="timeline-marker" />
                    <div>
                      <strong>{item.fromStatus ? `${item.fromStatus} → ` : ''}{item.toStatus}</strong>
                      {item.notes && <p>{item.notes}</p>}
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <style jsx global>{`.tracking-page{max-width:1440px;margin:0 auto}.tracking-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.7fr);gap:24px;align-items:stretch;margin-bottom:24px}.tracking-copy,.tracking-search-card,.tracking-summary-card,.tracking-payment-card,.tracking-timeline-card,.tracking-empty,.tracking-error{background:#fff;border:1px solid #c6c6cd;border-radius:18px}.tracking-copy{position:relative;overflow:hidden;min-height:260px;padding:34px;background:#131b2e;color:#fff}.tracking-copy:after{content:'';position:absolute;right:-90px;bottom:-110px;width:260px;height:260px;border-radius:999px;background:#2170e4;opacity:.28}.tracking-copy span,.tracking-search-card label,.tracking-card-head span{font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.tracking-copy span{color:#d8e2ff}.tracking-copy h1{position:relative;margin:10px 0 0;max-width:720px;font-size:44px;line-height:50px;font-weight:900;letter-spacing:-.04em}.tracking-copy p{position:relative;margin:12px 0 0;max-width:620px;color:rgba(255,255,255,.74);font-size:15px;line-height:25px}.tracking-search-card{display:grid;align-content:center;gap:10px;padding:24px}.tracking-search-card label,.tracking-card-head span{color:#76777d}.tracking-search-box{display:flex;gap:10px}.tracking-search-box input{flex:1;min-width:0;min-height:48px;border:1px solid #c6c6cd;border-radius:13px;background:#f6f3f5;padding:0 14px;font-weight:900;text-transform:uppercase}.tracking-search-box button{min-height:48px;padding:0 20px;border-radius:13px;background:#2170e4;color:#fff;font-weight:900}.tracking-search-card small{color:#76777d}.tracking-error{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px;padding:16px 20px;background:#ffdad6;color:#93000a}.tracking-error span{font-family:monospace;font-weight:900}.tracking-empty{display:grid;place-items:center;padding:70px 24px;text-align:center}.tracking-empty span{display:grid;place-items:center;width:58px;height:58px;border-radius:18px;background:#d8e2ff;color:#004395;font-size:30px}.tracking-empty h2{margin:16px 0 0;font-size:24px;font-weight:900}.tracking-empty p{margin:6px 0 0;color:#76777d}.tracking-result-grid{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:24px}.tracking-summary-card,.tracking-payment-card,.tracking-timeline-card{padding:24px}.tracking-timeline-card{grid-column:1/-1}.tracking-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.tracking-card-head h2{margin:6px 0 0;font-size:24px;font-weight:900}.tracking-code-box{padding:18px;border-radius:16px;background:#f6f3f5;margin-bottom:12px}.tracking-code-box span,.remaining-box span{color:#76777d;font-size:12px;font-weight:900;text-transform:uppercase}.tracking-code-box strong{display:block;margin-top:6px;color:#004395;font-family:monospace;font-size:22px}.tracking-detail-row{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-top:1px solid #e4e2e4}.tracking-detail-row span{color:#76777d}.tracking-detail-row strong{text-align:right}.remaining-box{margin-top:14px;padding:18px;border-radius:16px;background:#f6f3f5}.remaining-box strong{display:block;margin-top:7px;font-size:30px;font-weight:900}.danger-text{color:#93000a}.success-text{color:#2e7d32}.tracking-timeline{display:grid}.timeline-item{position:relative;display:grid;grid-template-columns:22px minmax(0,1fr);gap:14px;padding:16px 0;border-top:1px solid #e4e2e4}.timeline-item:first-child{border-top:0}.timeline-item:before{content:'';position:absolute;left:6px;top:0;bottom:0;width:2px;background:#e4e2e4}.timeline-marker{position:relative;z-index:1;width:14px;height:14px;margin-top:3px;border:3px solid #d8e2ff;border-radius:999px;background:#2170e4}.timeline-item strong{font-weight:900}.timeline-item p{margin:5px 0 0;color:#45464d}.timeline-item span,.timeline-empty{display:block;margin-top:5px;color:#76777d;font-size:12px}@media(max-width:1000px){.tracking-hero,.tracking-result-grid{grid-template-columns:1fr}.tracking-copy h1{font-size:36px;line-height:42px}}@media(max-width:640px){.tracking-search-box{flex-direction:column}.tracking-detail-row{display:grid}.tracking-detail-row strong{text-align:left}}`}</style>
    </div>
  );
}
