'use client';

import { useState, useEffect } from 'react';
import client from '../api/client';
import styles from './page.module.css';

interface Tenant {
  id: string;
  name: string;
  code: string;
  status: string;
  subscriptionEnd: string;
  _count: {
    transactions: number;
    users: number;
  };
}

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data } = await client.get('/admin/tenants');
      setTenants(data);
    } catch (error) {
      console.error('Failed to fetch tenants', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className="flex justify-between items-center w-full">
          <div>
            <h1>Management Tenant</h1>
            <p>Onboard and manage your SaaS clients</p>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={() => setShowModal(true)}
          >
            + New Tenant
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-sm font-semibold text-gray-600">Tenant Info</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Stats</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Subscription</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{tenant.name}</div>
                  <div className="text-xs text-blue-600 font-mono">{tenant.code}</div>
                </td>
                <td className="p-4 text-sm">
                  <div>{tenant._count.transactions} Trx</div>
                  <div className="text-gray-400">{tenant._count.users} Staff</div>
                </td>
                <td className="p-4 text-sm">
                  <div className={new Date(tenant.subscriptionEnd) < new Date() ? 'text-red-600 font-bold' : ''}>
                    {new Date(tenant.subscriptionEnd).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`${styles.badge} ${styles[`badge${tenant.status}`]}`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 hover:underline text-sm font-medium mr-4">Edit</button>
                  <button className="text-gray-400 hover:text-red-600 transition">
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
