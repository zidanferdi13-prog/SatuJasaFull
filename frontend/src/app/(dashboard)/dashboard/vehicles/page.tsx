'use client';

import { useState } from 'react';
import { useVehicles, useCreateVehicle } from '../../../../modules/vehicles/hooks/useVehicles';
import { useCustomers } from '../../../../modules/customers/hooks/useCustomers';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { Modal } from '../../../../shared/components/Modal';
import { Vehicle } from '../../../../modules/vehicles/services/vehicle.service';
import { Customer } from '../../../../shared/types';

const thStyle: React.CSSProperties = { padding: 12, fontSize: 14, fontWeight: 600, color: '#666', textAlign: 'left', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f8f9fa' };
const tdStyle: React.CSSProperties = { padding: 12, fontSize: 14, color: '#333', borderBottom: '1px solid #e5e5e5' };

export default function DashboardVehiclesPage() {
  const { data, isLoading } = useVehicles();
  const { data: customers } = useCustomers();
  const createMutation = useCreateVehicle();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customerId: '', plateNumber: '', brand: '', model: '', year: '', color: '' });

  const handleCreate = () => {
    if (!form.customerId || !form.plateNumber || !form.brand || !form.model) return;
    createMutation.mutate(
      {
        customerId: form.customerId,
        plateNumber: form.plateNumber,
        brand: form.brand,
        model: form.model,
        year: form.year ? parseInt(form.year) : undefined,
        color: form.color || undefined,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setForm({ customerId: '', plateNumber: '', brand: '', model: '', year: '', color: '' });
        },
      },
    );
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 12 };
  const vehicles = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Kendaraan"
        subtitle="Daftar kendaraan pelanggan"
        actions={
          <button
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: '#007AFF', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            + Tambah Kendaraan
          </button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : vehicles.length === 0 ? (
        <EmptyState message="Belum ada kendaraan" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr>
              <th style={thStyle}>Plat Nomor</th>
              <th style={thStyle}>Merek / Model</th>
              <th style={thStyle}>Tahun</th>
              <th style={thStyle}>Warna</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v: Vehicle) => (
              <tr key={v.id} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}>
                <td style={tdStyle}><strong style={{ fontFamily: 'monospace' }}>{v.plateNumber}</strong></td>
                <td style={tdStyle}>{v.brand} {v.model}</td>
                <td style={tdStyle}>{v.year ?? '-'}</td>
                <td style={tdStyle}>{v.color ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Kendaraan">
        <select style={inputStyle} value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
          <option value="">Pilih Pelanggan *</option>
          {(customers ?? []).map((c: Customer) => (
            <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
          ))}
        </select>
        <input style={inputStyle} placeholder="Plat Nomor *" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} />
        <input style={inputStyle} placeholder="Merek *" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <input style={inputStyle} placeholder="Model *" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        <input style={inputStyle} placeholder="Tahun (opsional)" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <input style={inputStyle} placeholder="Warna (opsional)" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
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
