import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 80,
      color: '#999',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <p style={{ fontSize: 16, color: '#c62828', marginBottom: 16 }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 24px',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
