import React, { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = 'Tidak ada data',
}: DataTableProps<T>) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e5e5e5',
      }}>
        {columns.map((col) => (
          <div key={col.key} style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#666' }}>
            {col.header}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading...</div>
      ) : data.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>{emptyMessage}</div>
      ) : (
        data.map((item) => (
          <div
            key={keyExtractor(item)}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
              borderBottom: '1px solid #e5e5e5',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
          >
            {columns.map((col) => (
              <div key={col.key} style={{ padding: '12px 16px', fontSize: 14, color: '#333' }}>
                {col.render(item)}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
