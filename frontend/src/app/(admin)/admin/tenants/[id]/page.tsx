'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useTenant,
  useUpdateTenant,
  useUpdateTenantStatus,
  useImpersonateTenant,
  useResetOwnerPassword,
} from '../../../../../modules/tenants/hooks/useTenants';
import { LoadingState } from '../../../../../shared/components/LoadingState';
import { StatusBadge } from '../../../../../shared/components/StatusBadge';
import { Modal } from '../../../../../shared/components/Modal';
import { formatDate, formatCurrency } from '../../../../../shared/utils/format';
import { useAuthStore } from '../../../../../store/authStore';

function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value ?? '—'}</strong>
    </div>
  );
}

function ErrorBanner({ error }: { error: unknown }) {
  const err = error as any;
  const msg: string = err?.response?.data?.message || 'Terjadi kesalahan';
  const errors: { field: string; message: string }[] = err?.response?.data?.errors || [];
  return (
    <div className="detail-error-box">
      <strong>{msg}</strong>
      {errors.map((e) => (
        <div key={e.field}>• <b>{e.field.replace('body.', '')}</b>: {e.message}</div>
      ))}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-tile">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function TenantDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const setToken = useAuthStore((s: { setToken: (t: string) => void }) => s.setToken);

  const { data: tenant, isLoading } = useTenant(id);
  const updateInfo = useUpdateTenant(id);
  const updateStatus = useUpdateTenantStatus();
  const impersonate = useImpersonateTenant();
  const resetPassword = useResetOwnerPassword(id);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: '', phone: '', address: '' });
  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState({ subscriptionEnd: '', subscriptionStatus: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED' | 'EXPIRED', isActive: true });
  const [showPwModal, setShowPwModal] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  const openInfoModal = () => {
    setInfoForm({ name: tenant?.name ?? '', phone: tenant?.phone ?? '', address: tenant?.address ?? '' });
    setShowInfoModal(true);
  };

  const openSubModal = () => {
    setSubForm({
      subscriptionEnd: tenant?.subscriptionEnd ? tenant.subscriptionEnd.slice(0, 10) : '',
      subscriptionStatus: tenant?.subscriptionStatus ?? 'ACTIVE',
      isActive: tenant?.isActive ?? true,
    });
    setShowSubModal(true);
  };

  const handleSaveInfo = () => updateInfo.mutate(infoForm, { onSuccess: () => setShowInfoModal(false) });

  const handleSaveSub = () => {
    updateStatus.mutate({
      id,
      payload: {
        subscriptionStatus: subForm.subscriptionStatus,
        subscriptionEnd: subForm.subscriptionEnd ? `${subForm.subscriptionEnd}T00:00:00.000Z` : undefined,
        isActive: subForm.isActive,
      },
    }, { onSuccess: () => setShowSubModal(false) });
  };

  const handleResetPassword = () => {
    if (newPw.length < 8) { setPwError('Password minimal 8 karakter'); return; }
    if (newPw !== confirmPw) { setPwError('Password tidak cocok'); return; }
    setPwError('');
    resetPassword.mutate(newPw, {
      onSuccess: () => { setShowPwModal(false); setNewPw(''); setConfirmPw(''); },
    });
  };

  const handleImpersonate = () => {
    if (!confirm(`Login sebagai owner ${tenant?.name}? Session admin akan digantikan sementara.`)) return;
    impersonate.mutate(id, {
      onSuccess: (result) => {
        setToken(result.accessToken);
        router.push('/dashboard');
      },
    });
  };

  if (isLoading || !tenant) return <LoadingState />;

  const daysLeft = Math.ceil((new Date(tenant.subscriptionEnd).getTime() - Date.now()) / 86_400_000);
  const initials = tenant.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="tenant-detail-page">
      <section className="detail-hero">
        <button className="ghost-action" onClick={() => router.push('/admin/tenants')}>← Kembali</button>
        <div className="detail-avatar">{initials}</div>
        <div className="detail-title-wrap">
          <div className="detail-title-line">
            <h1>{tenant.name}</h1>
            <span className="tenant-code-chip">{tenant.code}</span>
            <StatusBadge status={tenant.subscriptionStatus} type="tenant" />
            {!tenant.isActive && <StatusBadge status="INACTIVE" />}
          </div>
          <p>Dibuat {formatDate(tenant.createdAt)} • {tenant.phone || 'Nomor belum diisi'}</p>
        </div>
        <button className="primary-action" onClick={handleImpersonate} disabled={impersonate.isPending}>Login Owner</button>
      </section>

      <section className="detail-grid">
        <div className="detail-left">
          <div className="detail-panel">
            <div className="panel-head">
              <div><span>Tenant Profile</span><h2>Profil Tenant</h2></div>
              <button className="small-action" onClick={openInfoModal}>Edit</button>
            </div>
            <InfoRow label="Nama" value={tenant.name} />
            <InfoRow label="Telepon" value={tenant.phone} />
            <InfoRow label="Alamat" value={tenant.address} />
          </div>

          <div className="stats-grid">
            <StatTile label="Transaksi" value={tenant._count?.transactions ?? 0} />
            <StatTile label="Staff" value={tenant._count?.users ?? 0} />
            <StatTile label="Cabang" value={tenant._count?.branches ?? 0} />
          </div>

          {tenant.branches?.length > 0 && (
            <div className="detail-panel">
              <div className="panel-head"><div><span>Branches</span><h2>Cabang</h2></div></div>
              <div className="branch-list">
                {tenant.branches.map((branch) => (
                  <div key={branch.id} className="branch-row">
                    <strong>{branch.name}</strong>
                    <span className={branch.isActive ? 'active-chip' : 'danger-chip'}>{branch.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-right">
          <div className="detail-panel subscription-panel">
            <div className="panel-head">
              <div><span>Subscription</span><h2>Langganan</h2></div>
              <button className="small-action" onClick={openSubModal}>Edit</button>
            </div>
            <InfoRow label="Status" value={tenant.subscriptionStatus} />
            <InfoRow label="Mulai" value={formatDate(tenant.subscriptionStart)} />
            <InfoRow label="Berakhir" value={formatDate(tenant.subscriptionEnd)} />
            <div className="days-card">
              <span>Sisa Hari</span>
              <strong className={daysLeft <= 7 ? 'danger-text' : daysLeft <= 30 ? 'warning-text' : ''}>{daysLeft > 0 ? `${daysLeft} hari` : 'Kedaluwarsa'}</strong>
            </div>
          </div>

          {tenant.subscriptions?.length > 0 && (
            <div className="detail-panel">
              <div className="panel-head"><div><span>History</span><h2>Riwayat Paket</h2></div></div>
              <div className="package-list">
                {tenant.subscriptions.map((subscription) => (
                  <div key={subscription.id} className="package-row">
                    <div><strong>{subscription.planName}</strong><span>{formatDate(subscription.startDate)} – {formatDate(subscription.endDate)}</span></div>
                    <div><strong>{formatCurrency(subscription.price)}</strong><span className={subscription.status === 'ACTIVE' ? 'active-chip' : 'neutral-chip'}>{subscription.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-panel action-panel">
            <div className="panel-head"><div><span>Security</span><h2>Tindakan</h2></div></div>
            <button className="primary-action wide" onClick={handleImpersonate} disabled={impersonate.isPending}>Login sebagai Owner Tenant</button>
            <button className="ghost-action wide" onClick={() => setShowPwModal(true)}>Reset Password Owner</button>
          </div>
        </div>
      </section>

      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Edit Profil Tenant">
        <div className="modal-form">
          {([{ key: 'name', label: 'Nama Tenant' }, { key: 'phone', label: 'Telepon' }, { key: 'address', label: 'Alamat' }] as { key: keyof typeof infoForm; label: string }[]).map(({ key, label }) => (
            <div className="field" key={key}><label>{label}</label><input value={infoForm[key]} onChange={(e) => setInfoForm({ ...infoForm, [key]: e.target.value })} /></div>
          ))}
          {updateInfo.isError && <ErrorBanner error={updateInfo.error} />}
          <div className="modal-actions"><button className="ghost-action" onClick={() => setShowInfoModal(false)}>Batal</button><button className="primary-action" onClick={handleSaveInfo} disabled={updateInfo.isPending}>{updateInfo.isPending ? 'Menyimpan...' : 'Simpan'}</button></div>
        </div>
      </Modal>

      <Modal isOpen={showSubModal} onClose={() => setShowSubModal(false)} title="Edit Langganan">
        <div className="modal-form">
          <div className="field"><label>Tanggal Berakhir</label><input type="date" value={subForm.subscriptionEnd} onChange={(e) => setSubForm({ ...subForm, subscriptionEnd: e.target.value })} /></div>
          <div className="field"><label>Status Langganan</label><select value={subForm.subscriptionStatus} onChange={(e) => setSubForm({ ...subForm, subscriptionStatus: e.target.value as typeof subForm.subscriptionStatus })}><option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option><option value="EXPIRED">EXPIRED</option></select></div>
          <label className="checkbox-row"><input type="checkbox" checked={subForm.isActive} onChange={(e) => setSubForm({ ...subForm, isActive: e.target.checked })} /> Tenant Aktif</label>
          {updateStatus.isError && <ErrorBanner error={updateStatus.error} />}
          <div className="modal-actions"><button className="ghost-action" onClick={() => setShowSubModal(false)}>Batal</button><button className="primary-action" onClick={handleSaveSub} disabled={updateStatus.isPending}>{updateStatus.isPending ? 'Menyimpan...' : 'Simpan'}</button></div>
        </div>
      </Modal>

      <Modal isOpen={showPwModal} onClose={() => { setShowPwModal(false); setNewPw(''); setConfirmPw(''); setPwError(''); }} title="Reset Password Owner">
        <div className="modal-form">
          <div className="field"><label>Password Baru</label><input type="password" placeholder="Min. 8 karakter" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
          <div className="field"><label>Konfirmasi Password</label><input type="password" placeholder="Ulangi password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} /></div>
          {pwError && <p className="form-error">{pwError}</p>}
          {resetPassword.isError && <ErrorBanner error={resetPassword.error} />}
          <div className="modal-actions"><button className="ghost-action" onClick={() => { setShowPwModal(false); setNewPw(''); setConfirmPw(''); setPwError(''); }}>Batal</button><button className="danger-action" onClick={handleResetPassword} disabled={resetPassword.isPending}>{resetPassword.isPending ? 'Mereset...' : 'Reset Password'}</button></div>
        </div>
      </Modal>

      <style jsx global>{`
        .tenant-detail-page{max-width:1440px;margin:0 auto}.detail-hero{display:flex;align-items:center;gap:16px;margin-bottom:24px}.detail-avatar{width:64px;height:64px;border-radius:20px;background:#dae2fd;color:#131b2e;display:grid;place-items:center;font-weight:900;font-size:20px}.detail-title-wrap{flex:1;min-width:0}.detail-title-line{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.detail-title-line h1{margin:0;font-size:34px;line-height:40px;font-weight:900;letter-spacing:-.03em}.detail-title-wrap p{margin:5px 0 0;color:#76777d}.tenant-code-chip,.active-chip,.danger-chip,.neutral-chip{display:inline-flex;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:900}.tenant-code-chip{background:#d8e2ff;color:#004395}.active-chip{background:#e8f5e9;color:#2e7d32}.danger-chip{background:#ffdad6;color:#93000a}.neutral-chip{background:#f0edef;color:#45464d}.detail-grid{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:24px}.detail-left,.detail-right{display:grid;gap:18px;align-content:start}.detail-panel,.stat-tile{background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:22px}.panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}.panel-head span{color:#76777d;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.panel-head h2{margin:5px 0 0;font-size:22px;line-height:28px;font-weight:900}.detail-row,.branch-row,.package-row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-top:1px solid #e4e2e4}.detail-row:first-of-type{border-top:0}.detail-row span{color:#76777d}.detail-row strong{text-align:right}.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.stat-tile strong{display:block;font-size:32px;line-height:38px;font-weight:900}.stat-tile span{color:#76777d;font-size:12px;font-weight:800;text-transform:uppercase}.days-card{margin-top:14px;padding:18px;border-radius:16px;background:#f6f3f5}.days-card span{color:#76777d;font-size:12px;font-weight:900;text-transform:uppercase}.days-card strong{display:block;margin-top:8px;font-size:28px}.danger-text{color:#93000a}.warning-text{color:#b45309}.package-row>div{display:grid;gap:4px}.package-row>div:last-child{text-align:right}.package-row span{color:#76777d;font-size:12px}.action-panel{display:grid;gap:10px}.primary-action,.ghost-action,.danger-action,.small-action{border-radius:11px;min-height:40px;padding:0 16px;font-weight:900}.primary-action{background:#131b2e;color:white}.ghost-action{background:white;border:1px solid #c6c6cd;color:#45464d}.danger-action{background:#ba1a1a;color:white}.small-action{background:#2170e4;color:white}.wide{width:100%}.modal-form{display:grid;gap:14px}.field{display:grid;gap:6px}.field label,.checkbox-row{font-size:13px;font-weight:800;color:#1b1b1d}.field input,.field select{width:100%;min-height:42px;border:1px solid #c6c6cd;border-radius:10px;padding:0 12px}.checkbox-row{display:flex;gap:10px;align-items:center}.modal-actions{display:flex;justify-content:flex-end;gap:10px}.detail-error-box,.form-error{padding:12px;border:1px solid #ffb4ab;border-radius:10px;background:#ffdad6;color:#93000a;font-size:13px}.form-error{margin:0}@media(max-width:1000px){.detail-grid{grid-template-columns:1fr}.detail-hero{align-items:flex-start;flex-wrap:wrap}.stats-grid{grid-template-columns:1fr}}`}</style>
    </div>
  );
}
