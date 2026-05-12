import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 32,
    }}>
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#333' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 16, color: '#666', marginTop: 8 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 12 }}>{actions}</div>}
    </div>
  );
}
