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

/* ─── styles ─── */
const card: React.CSSProperties = {
  background: 'white', borderRadius: 12, padding: 24,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20,
};
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 };
const input: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5',
  borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
};
const btnPrimary: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 8, border: 'none',
  background: '#007AFF', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
const btnSecondary: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e5e5',
  background: 'white', color: '#333', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
const btnDanger: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 8, border: 'none',
  background: '#F44336', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 16, marginTop: 0 };
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', paddingBlock: 8, borderBottom: '1px solid #f0f0f0', fontSize: 14 };

function InfoRow({ label: l, value }: { label: string; value?: string | number | boolean | null }) {
  return (
    <div style={row}>
      <span style={{ color: '#888' }}>{l}</span>
      <span style={{ fontWeight: 600, color: '#333' }}>{value ?? '—'}</span>
    </div>
  );
}

function ErrorBanner({ error }: { error: unknown }) {
  const err = error as any;
  const msg: string = err?.response?.data?.message || 'Terjadi kesalahan';
  const errors: { field: string; message: string }[] = err?.response?.data?.errors || [];
  return (
    <div style={{ background: '#fce4ec', border: '1px solid #ef9a9a', borderRadius: 8, padding: 12, fontSize: 13, color: '#c62828', marginTop: 12 }}>
      <strong>{msg}</strong>
      {errors.map((e) => (
        <div key={e.field} style={{ marginTop: 4 }}>• <b>{e.field.replace('body.', '')}</b>: {e.message}</div>
      ))}
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

  /* ── info form ── */
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: '', phone: '', address: '' });

  const openInfoModal = () => {
    setInfoForm({ name: tenant?.name ?? '', phone: tenant?.phone ?? '', address: tenant?.address ?? '' });
    setShowInfoModal(true);
  };
  const handleSaveInfo = () => {
    updateInfo.mutate(infoForm, { onSuccess: () => setShowInfoModal(false) });
  };

  /* ── subscription form ── */
  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState({ subscriptionEnd: '', subscriptionStatus: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED' | 'EXPIRED', isActive: true });

  const openSubModal = () => {
    setSubForm({
      subscriptionEnd: tenant?.subscriptionEnd ? tenant.subscriptionEnd.slice(0, 10) : '',
      subscriptionStatus: tenant?.subscriptionStatus ?? 'ACTIVE',
      isActive: tenant?.isActive ?? true,
    });
    setShowSubModal(true);
  };
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

  /* ── password reset ── */
  const [showPwModal, setShowPwModal] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  const handleResetPassword = () => {
    if (newPw.length < 8) { setPwError('Password minimal 8 karakter'); return; }
    if (newPw !== confirmPw) { setPwError('Password tidak cocok'); return; }
    setPwError('');
    resetPassword.mutate(newPw, {
      onSuccess: () => { setShowPwModal(false); setNewPw(''); setConfirmPw(''); },
    });
  };

  /* ── impersonate ── */
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

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.push('/admin/tenants')} style={{ ...btnSecondary, padding: '8px 14px' }}>
          ← Kembali
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>{tenant.name}</h1>
            <span style={{ fontFamily: 'monospace', fontSize: 13, background: '#e8f0fe', color: '#1a56db', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
              {tenant.code}
            </span>
            <StatusBadge status={tenant.subscriptionStatus} type="tenant" />
            {!tenant.isActive && <StatusBadge status="INACTIVE" />}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>Dibuat {formatDate(tenant.createdAt)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── LEFT column ── */}
        <div>
          {/* Tenant Profile */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={sectionTitle}>Profil Tenant</h2>
              <button onClick={openInfoModal} style={{ ...btnPrimary, padding: '7px 16px', fontSize: 13 }}>Edit</button>
            </div>
            <InfoRow label="Nama" value={tenant.name} />
            <InfoRow label="Telepon" value={tenant.phone} />
            <InfoRow label="Alamat" value={tenant.address} />
          </div>

          {/* Stats */}
          <div style={card}>
            <h2 style={sectionTitle}>Statistik</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Transaksi', value: tenant._count?.transactions ?? 0, color: '#007AFF' },
                { label: 'Staff', value: tenant._count?.users ?? 0, color: '#4CAF50' },
                { label: 'Cabang', value: tenant._count?.branches ?? 0, color: '#FF9800' },
              ].map(({ label: l, value, color }) => (
                <div key={l} style={{ background: '#f8f9fa', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Branches */}
          {tenant.branches?.length > 0 && (
            <div style={card}>
              <h2 style={sectionTitle}>Cabang</h2>
              {tenant.branches.map((b) => (
                <div key={b.id} style={{ ...row, alignItems: 'center' }}>
                  <span>{b.name}</span>
                  <span style={{
                    fontSize: 12, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                    background: b.isActive ? '#e8f5e9' : '#fce4ec',
                    color: b.isActive ? '#2e7d32' : '#c62828',
                  }}>
                    {b.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT column ── */}
        <div>
          {/* Subscription */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={sectionTitle}>Langganan</h2>
              <button onClick={openSubModal} style={{ ...btnPrimary, padding: '7px 16px', fontSize: 13 }}>Edit</button>
            </div>
            <InfoRow label="Status" value={tenant.subscriptionStatus} />
            <InfoRow label="Mulai" value={formatDate(tenant.subscriptionStart)} />
            <InfoRow label="Berakhir" value={formatDate(tenant.subscriptionEnd)} />
            <div style={{ ...row, borderBottom: 'none' }}>
              <span style={{ color: '#888' }}>Sisa Hari</span>
              <span style={{ fontWeight: 700, color: daysLeft <= 7 ? '#F44336' : daysLeft <= 30 ? '#FF9800' : '#4CAF50' }}>
                {daysLeft > 0 ? `${daysLeft} hari` : 'Kedaluwarsa'}
              </span>
            </div>
          </div>

          {/* Subscription History */}
          {tenant.subscriptions?.length > 0 && (
            <div style={card}>
              <h2 style={sectionTitle}>Riwayat Paket</h2>
              {tenant.subscriptions.map((s) => (
                <div key={s.id} style={{ ...row, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.planName}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{formatDate(s.startDate)} – {formatDate(s.endDate)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{formatCurrency(s.price)}</div>
                    <span style={{
                      fontSize: 11, padding: '2px 7px', borderRadius: 20, fontWeight: 600,
                      background: s.status === 'ACTIVE' ? '#e8f5e9' : '#f5f5f5',
                      color: s.status === 'ACTIVE' ? '#2e7d32' : '#888',
                    }}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={card}>
            <h2 style={sectionTitle}>Tindakan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleImpersonate}
                disabled={impersonate.isPending}
                style={{ ...btnPrimary, background: '#4CAF50', opacity: impersonate.isPending ? 0.6 : 1, textAlign: 'left' }}
              >
                🔑 Login sebagai Owner Tenant
              </button>
              <button
                onClick={() => setShowPwModal(true)}
                style={{ ...btnSecondary }}
              >
                🔒 Reset Password Owner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Edit Profil ── */}
      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Edit Profil Tenant">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { key: 'name', label: 'Nama Tenant' },
            { key: 'phone', label: 'Telepon' },
            { key: 'address', label: 'Alamat' },
          ] as { key: keyof typeof infoForm; label: string }[]).map(({ key, label: l }) => (
            <div key={key}>
              <label style={label}>{l}</label>
              <input
                style={input}
                value={infoForm[key]}
                onChange={(e) => setInfoForm({ ...infoForm, [key]: e.target.value })}
              />
            </div>
          ))}
          {updateInfo.isError && <ErrorBanner error={updateInfo.error} />}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setShowInfoModal(false)} style={{ ...btnSecondary, flex: 1 }}>Batal</button>
            <button onClick={handleSaveInfo} disabled={updateInfo.isPending} style={{ ...btnPrimary, flex: 2, opacity: updateInfo.isPending ? 0.6 : 1 }}>
              {updateInfo.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Edit Subscription ── */}
      <Modal isOpen={showSubModal} onClose={() => setShowSubModal(false)} title="Edit Langganan">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={label}>Tanggal Berakhir</label>
            <input
              style={input} type="date" value={subForm.subscriptionEnd}
              onChange={(e) => setSubForm({ ...subForm, subscriptionEnd: e.target.value })}
            />
          </div>
          <div>
            <label style={label}>Status Langganan</label>
            <select
              style={{ ...input }}
              value={subForm.subscriptionStatus}
              onChange={(e) => setSubForm({ ...subForm, subscriptionStatus: e.target.value as typeof subForm.subscriptionStatus })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              id="isActive" type="checkbox" checked={subForm.isActive}
              onChange={(e) => setSubForm({ ...subForm, isActive: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            <label htmlFor="isActive" style={{ ...label, margin: 0, cursor: 'pointer' }}>Tenant Aktif</label>
          </div>
          {updateStatus.isError && <ErrorBanner error={updateStatus.error} />}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setShowSubModal(false)} style={{ ...btnSecondary, flex: 1 }}>Batal</button>
            <button onClick={handleSaveSub} disabled={updateStatus.isPending} style={{ ...btnPrimary, flex: 2, opacity: updateStatus.isPending ? 0.6 : 1 }}>
              {updateStatus.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Reset Password ── */}
      <Modal isOpen={showPwModal} onClose={() => { setShowPwModal(false); setNewPw(''); setConfirmPw(''); setPwError(''); }} title="Reset Password Owner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={label}>Password Baru</label>
            <input style={input} type="password" placeholder="Min. 8 karakter" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div>
            <label style={label}>Konfirmasi Password</label>
            <input style={input} type="password" placeholder="Ulangi password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          {pwError && <p style={{ margin: 0, fontSize: 13, color: '#c62828' }}>{pwError}</p>}
          {resetPassword.isError && <ErrorBanner error={resetPassword.error} />}
          {resetPassword.isSuccess && (
            <p style={{ margin: 0, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>✓ Password berhasil direset</p>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => { setShowPwModal(false); setNewPw(''); setConfirmPw(''); setPwError(''); }} style={{ ...btnSecondary, flex: 1 }}>Batal</button>
            <button onClick={handleResetPassword} disabled={resetPassword.isPending} style={{ ...btnDanger, flex: 2, opacity: resetPassword.isPending ? 0.6 : 1 }}>
              {resetPassword.isPending ? 'Mereset...' : 'Reset Password'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
