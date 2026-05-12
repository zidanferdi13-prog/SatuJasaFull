import React from 'react';

interface EmptyStateProps {
  message: string;
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 80,
      color: '#999',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📭</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#666', marginBottom: 8 }}>{message}</p>
      {description && <p style={{ fontSize: 14 }}>{description}</p>}
    </div>
  );
}
