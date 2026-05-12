'use client';

import { useState } from 'react';
import { useTenants, useCreateTenant } from '../modules/tenants/hooks/useTenants';
import { PageHeader } from '../shared/components/PageHeader';
import { StatusBadge } from '../shared/components/StatusBadge';
import { LoadingState } from '../shared/components/LoadingState';
import { EmptyState } from '../shared/components/EmptyState';
import { Modal } from '../shared/components/Modal';
import { Tenant } from '../shared/types';
import { formatDate, isExpired } from '../shared/utils/format';

export default function TenantManagement() {
  const { data: tenants, isLoading, isError } = useTenants();
  const createMutation = useCreateTenant();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    ownerEmail: '',
    ownerPassword: '',
    subscriptionEnd: '',
  });

  const handleCreate = async () => {
    if (!form.code || !form.name || !form.ownerEmail || !form.ownerPassword || !form.subscriptionEnd) return;

    createMutation.mutate(
      {
        code: form.code,
        name: form.name,
        ownerEmail: form.ownerEmail,
        ownerPassword: form.ownerPassword,
        subscriptionEnd: form.subscriptionEnd,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setForm({ code: '', name: '', ownerEmail: '', ownerPassword: '', subscriptionEnd: '' });
        },
      }
    );
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  };

  const thStyle: React.CSSProperties = {
    padding: 12,
    fontSize: 14,
    fontWeight: 600,
    color: '#666',
    textAlign: 'left',
    borderBottom: '1px solid #e5e5e5',
    backgroundColor: '#f8f9fa',
  };

  const tdStyle: React.CSSProperties = {
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderBottom: '1px solid #e5e5e5',
  };

  if (isLoading) return <LoadingState />;

  return (
    <div style={{ padding: '24px 0' }}>
      <PageHeader
        title="Management Tenant"
        subtitle="Onboard and manage your SaaS clients"
        actions={
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#007AFF',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + New Tenant
          </button>
        }
      />

      {!tenants || tenants.length === 0 ? (
        <EmptyState message="Belum ada tenant" description="Buat tenant baru untuk memulai" />
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Tenant Info</th>
              <th style={thStyle}>Stats</th>
              <th style={thStyle}>Subscription</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant: Tenant) => (
              <tr key={tenant.id}
                style={{ transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700, color: '#333' }}>{tenant.name}</div>
                  <div style={{ fontSize: 12, color: '#007AFF', fontFamily: 'monospace' }}>{tenant.code}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontSize: 14 }}>{tenant._count?.transactions || 0} Trx</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{tenant._count?.users || 0} Staff</div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    color: isExpired(tenant.subscriptionEnd) ? '#c62828' : 'inherit',
                    fontWeight: isExpired(tenant.subscriptionEnd) ? 700 : 400,
                  }}>
                    {formatDate(tenant.subscriptionEnd)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <StatusBadge status={tenant.status} type="tenant" />
                </td>
                <td style={tdStyle}>
                  <button style={{ color: '#007AFF', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Tenant Baru">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>Kode Tenant</label>
            <input
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14 }}
              placeholder="birojasa1"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>Nama Tenant</label>
            <input
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14 }}
              placeholder="Biro Jasa STNK Jakarta Pusat"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>Email Owner</label>
            <input
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14 }}
              type="email"
              placeholder="owner@example.com"
              value={form.ownerEmail}
              onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>Password Owner</label>
            <input
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14 }}
              type="password"
              placeholder="Min. 8 karakter"
              value={form.ownerPassword}
              onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>Subscription End</label>
            <input
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14 }}
              type="date"
              value={form.subscriptionEnd}
              onChange={(e) => setForm({ ...form, subscriptionEnd: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                background: 'white',
                color: '#666',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              onClick={handleCreate}
              disabled={createMutation.isLoading}
              style={{
                flex: 2,
                padding: '12px',
                border: 'none',
                borderRadius: 8,
                background: '#007AFF',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: createMutation.isLoading ? 0.6 : 1,
              }}
            >
              {createMutation.isLoading ? 'Menyimpan...' : 'Buat Tenant'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
