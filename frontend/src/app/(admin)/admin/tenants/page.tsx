'use client';

import { useState } from 'react';
import { useTenants, useCreateTenant } from '../../../../modules/tenants/hooks/useTenants';
import { PageHeader } from '../../../../shared/components/PageHeader';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { Modal } from '../../../../shared/components/Modal';
import { Tenant } from '../../../../shared/types';
import { formatDate, isExpired } from '../../../../shared/utils/format';

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

export default function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const createMutation = useCreateTenant();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    subscriptionMonths: 12,
  });

  const handleCreate = () => {
    if (!form.code || !form.name || !form.ownerName || !form.ownerEmail || !form.ownerPassword)
      return;

    createMutation.mutate(form, {
      onSuccess: () => {
        setShowModal(false);
        setForm({ code: '', name: '', ownerName: '', ownerEmail: '', ownerPassword: '', subscriptionMonths: 12 });
      },
    });
  };

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Tenant Management"
        subtitle="Onboard and manage bureau service clients"
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

      {!tenants || tenants.data.length === 0 ? (
        <EmptyState message="Belum ada tenant" description="Buat tenant baru untuk memulai" />
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'white',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Tenant</th>
              <th style={thStyle}>Stats</th>
              <th style={thStyle}>Subscription End</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.data.map((tenant: Tenant) => (
              <tr
                key={tenant.id}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{tenant.name}</div>
                  <div style={{ fontSize: 12, color: '#007AFF', fontFamily: 'monospace' }}>{tenant.code}</div>
                </td>
                <td style={tdStyle}>
                  <div>{tenant._count?.transactions ?? 0} Trx</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{tenant._count?.users ?? 0} Staff</div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    color: isExpired(tenant.subscriptionEnd) ? '#c62828' : '#333',
                    fontWeight: isExpired(tenant.subscriptionEnd) ? 700 : 400,
                  }}>
                    {formatDate(tenant.subscriptionEnd)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <StatusBadge status={tenant.subscriptionStatus} type="tenant" />
                </td>
                <td style={tdStyle}>
                  <a
                    href={`/admin/tenants/${tenant.id}`}
                    style={{ color: '#007AFF', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
                  >
                    Detail →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Tenant Baru">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Kode Tenant', key: 'code', placeholder: 'birojasa1', type: 'text' },
            { label: 'Nama Tenant', key: 'name', placeholder: 'Biro Jasa STNK Jakarta Pusat', type: 'text' },
            { label: 'Nama Owner', key: 'ownerName', placeholder: 'Budi Santoso', type: 'text' },
            { label: 'Email Owner', key: 'ownerEmail', placeholder: 'owner@example.com', type: 'email' },
            { label: 'Password Owner', key: 'ownerPassword', placeholder: 'Min. 8 karakter', type: 'password' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {label}
              </label>
              <input
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                type={type}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ flex: 1, padding: 12, border: '1px solid #e5e5e5', borderRadius: 8, background: 'white', color: '#666', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Batal
            </button>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              style={{
                flex: 2,
                padding: 12,
                border: 'none',
                borderRadius: 8,
                background: '#007AFF',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: createMutation.isPending ? 0.6 : 1,
              }}
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Buat Tenant'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
