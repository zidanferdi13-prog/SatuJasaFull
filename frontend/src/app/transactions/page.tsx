'use client';

import { useTransactions } from '../../modules/transactions/hooks/useTransactions';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { LoadingState } from '../../shared/components/LoadingState';
import { EmptyState } from '../../shared/components/EmptyState';
import { DataTable } from '../../shared/components/DataTable';
import { Transaction } from '../../shared/types';
import { formatCurrency, formatDateTime } from '../../shared/utils/format';

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();

  if (isLoading) return <LoadingState />;

  return (
    <div style={{ padding: '24px 0' }}>
      <PageHeader
        title="Transactions"
        subtitle="Monitor all platform transactions"
      />

      {!transactions || transactions.length === 0 ? (
        <EmptyState message="Belum ada transaksi" />
      ) : (
        <DataTable
          columns={[
            {
              key: 'invoice',
              header: 'Invoice',
              render: (t: Transaction) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#007AFF' }}>
                  {t.invoiceNumber}
                </span>
              ),
            },
            {
              key: 'customer',
              header: 'Customer',
              render: (t: Transaction) => t.customer?.name || '-',
            },
            {
              key: 'tenant',
              header: 'Tenant',
              render: (t: Transaction) => t.tenant?.code || '-',
            },
            {
              key: 'total',
              header: 'Total',
              render: (t: Transaction) => formatCurrency(t.finalTotal || t.estimatedTotal || 0),
            },
            {
              key: 'status',
              header: 'Status',
              render: (t: Transaction) => <StatusBadge status={t.status} />,
            },
            {
              key: 'date',
              header: 'Date',
              render: (t: Transaction) => formatDateTime(t.createdAt),
            },
          ]}
          data={transactions}
          keyExtractor={(t: Transaction) => t.id}
        />
      )}
    </div>
  );
}
