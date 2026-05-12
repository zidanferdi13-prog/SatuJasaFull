import React from 'react';
import { STATUS_COLORS, STATUS_LABELS, TENANT_STATUS_COLORS, TENANT_STATUS_BG } from '../constants';

interface StatusBadgeProps {
  status: string;
  type?: 'transaction' | 'tenant';
}

export function StatusBadge({ status, type = 'transaction' }: StatusBadgeProps) {
  const label = type === 'transaction' ? STATUS_LABELS[status] : status;
  const color = type === 'transaction' ? STATUS_COLORS[status] : TENANT_STATUS_COLORS[status];
  const bg = type === 'tenant' ? TENANT_STATUS_BG[status] : `${color}18`;

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      color: color || '#999',
      backgroundColor: bg || '#f5f5f5',
    }}>
      {label || status}
    </span>
  );
}
