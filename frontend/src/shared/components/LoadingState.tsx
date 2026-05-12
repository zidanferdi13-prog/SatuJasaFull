import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Memuat...' }: LoadingStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 80,
      color: '#999',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #e5e5e5',
        borderTopColor: '#007AFF',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 16,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  );
}
