'use client';

import { useState } from 'react';
import { useCustomers, useCreateCustomer } from '../../../../modules/customers/hooks/useCustomers';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { Modal } from '../../../../shared/components/Modal';
import { Customer } from '../../../../shared/types';
import { formatDate } from '../../../../shared/utils/format';

const thStyle: React.CSSProperties = { padding: 12, fontSize: 14, fontWeight: 600, color: '#666', textAlign: 'left', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f8f9fa' };
const tdStyle: React.CSSProperties = { padding: 12, fontSize: 14, color: '#333', borderBottom: '1px solid #e5e5e5' };

export default function DashboardCustomersPage() {
  const { data: customers, isLoading } = useCustomers();
  const createMutation = useCreateCustomer();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const handleCreate = () => {
    if (!form.name || !form.phone) return;
    createMutation.mutate(
      { name: form.name, phone: form.phone, email: form.email || undefined, address: form.address || undefined },
      {
        onSuccess: () => {
          setShowModal(false);
          setForm({ name: '', phone: '', email: '', address: '' });
        },
      },
    );
  };

  if (isLoading) return <LoadingState />;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 12 };

  return (
    <div>
      <PageHeader
        title="Pelanggan"
        subtitle="Kelola data pelanggan bengkel"
        actions={
          <button
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: '#007AFF', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            + Tambah Pelanggan
          </button>
        }
      />

      {!customers || customers.length === 0 ? (
        <EmptyState message="Belum ada pelanggan" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nama</th>
              <th style={thStyle}>Telepon</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Alamat</th>
              <th style={thStyle}>Terdaftar</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c: Customer) => (
              <tr key={c.id} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}>
                <td style={tdStyle}><strong>{c.name}</strong></td>
                <td style={tdStyle}>{c.phone}</td>
                <td style={tdStyle}>{c.email ?? '-'}</td>
                <td style={tdStyle}>{c.address ?? '-'}</td>
                <td style={tdStyle}>{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Pelanggan">
        <input style={inputStyle} placeholder="Nama *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input style={inputStyle} placeholder="Nomor Telepon *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input style={inputStyle} placeholder="Email (opsional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input style={inputStyle} placeholder="Alamat (opsional)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
