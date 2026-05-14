'use client';

import { useState } from 'react';
import { useBranches, useCreateBranch } from '../../../../modules/branches/hooks/useBranches';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { Modal } from '../../../../shared/components/Modal';
import { Branch } from '../../../../shared/types';

const thStyle: React.CSSProperties = { padding: 12, fontSize: 14, fontWeight: 600, color: '#666', textAlign: 'left', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f8f9fa' };
const tdStyle: React.CSSProperties = { padding: 12, fontSize: 14, color: '#333', borderBottom: '1px solid #e5e5e5' };

export default function DashboardBranchesPage() {
  const { data: branches, isLoading } = useBranches();
  const createMutation = useCreateBranch();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  const handleCreate = () => {
    if (!form.name) return;
    createMutation.mutate(
      { name: form.name, address: form.address || undefined, phone: form.phone || undefined },
      {
        onSuccess: () => {
          setShowModal(false);
          setForm({ name: '', address: '', phone: '' });
        },
      },
    );
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 12 };

  return (
    <div>
      <PageHeader
        title="Cabang"
        subtitle="Kelola cabang bengkel Anda"
        actions={
          <button
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: '#007AFF', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            + Tambah Cabang
          </button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : !branches || branches.length === 0 ? (
        <EmptyState message="Belum ada cabang" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nama Cabang</th>
              <th style={thStyle}>Alamat</th>
              <th style={thStyle}>Telepon</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b: Branch) => (
              <tr key={b.id} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}>
                <td style={tdStyle}><strong>{b.name}</strong></td>
                <td style={tdStyle}>{b.address ?? '-'}</td>
                <td style={tdStyle}>{b.phone ?? '-'}</td>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                    fontSize: 12, fontWeight: 600,
                    backgroundColor: b.isActive ? '#e8f5e9' : '#fce4ec',
                    color: b.isActive ? '#2e7d32' : '#c62828',
                  }}>
                    {b.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Cabang">
        <input style={inputStyle} placeholder="Nama Cabang *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input style={inputStyle} placeholder="Alamat (opsional)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input style={inputStyle} placeholder="Telepon (opsional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 14 }}>Batal</button>
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#007AFF', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
