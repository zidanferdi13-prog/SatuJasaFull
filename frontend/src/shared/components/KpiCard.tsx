import React, { ReactNode } from 'react';

interface KpiCardProps {
  icon?: ReactNode;
  value: string | number;
  label: string;
  color?: string;
}

export function KpiCard({ icon, value, label, color = '#007AFF' }: KpiCardProps) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 10,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
    }}>
      {icon && <div style={{ marginBottom: 8 }}>{icon}</div>}
      <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 14, color: '#666' }}>{label}</div>
    </div>
  );
}
