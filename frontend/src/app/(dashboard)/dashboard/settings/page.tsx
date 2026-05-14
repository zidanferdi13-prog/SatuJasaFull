'use client';

import { useState, useEffect } from 'react';
import { useTenant, useUpdateTenantStatus } from '../../../../modules/tenants/hooks/useTenants';
import { useAuthStore } from '../../../../store/authStore';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { LoadingState } from '../../../../shared/components/LoadingState';
import api from '../../../../shared/services/api';

export default function DashboardSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const tenantId = user?.tenantId ?? '';

  const { data: tenant, isLoading } = useTenant(tenantId);
  const updateMutation = useUpdateTenantStatus();

  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name ?? '',
        phone: tenant.phone ?? '',
        address: tenant.address ?? '',
      });
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenantId) return;
    setIsSaving(true);
    setSavedMsg('');
    try {
      await api.put(`/tenants/${tenantId}`, { name: form.name, phone: form.phone, address: form.address });
      setSavedMsg('Pengaturan berhasil disimpan.');
    } catch {
      setSavedMsg('Gagal menyimpan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState />;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 12,
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 };

  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Kelola profil bengkel Anda" />

      <div style={{ maxWidth: 560, background: 'white', borderRadius: 10, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt="Logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '1px solid #eee' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: 12, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#0f4c81' }}>
              {tenant?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>{tenant?.name}</div>
            <div style={{ fontSize: 13, color: '#007AFF', fontFamily: 'monospace' }}>{tenant?.code}</div>
          </div>
        </div>

        <label style={labelStyle}>Nama Bengkel</label>
        <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label style={labelStyle}>Nomor Telepon</label>
        <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <label style={labelStyle}>Alamat</label>
        <textarea
          style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        {savedMsg && (
          <div style={{ marginBottom: 12, fontSize: 13, color: savedMsg.startsWith('Berhasil') ? '#2e7d32' : '#c62828', fontWeight: 600 }}>
            {savedMsg}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: '#007AFF', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}
