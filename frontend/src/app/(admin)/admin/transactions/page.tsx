'use client';

import { useState } from 'react';
import { useTransactions } from '../../../../modules/transactions/hooks/useTransactions';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { Transaction, TransactionStatus } from '../../../../shared/types';
import { formatCurrency, formatDateTime } from '../../../../shared/utils/format';

const filters: Array<{ label: string; value?: TransactionStatus }> = [
  { label: 'All' },
  { label: 'Process', value: 'ON_PROCESS' },
  { label: 'Ready', value: 'READY_TO_PICKUP' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Closed', value: 'CLOSED' },
];

export default function AdminTransactionsPage() {
  const [status, setStatus] = useState<TransactionStatus | undefined>();
  const { data: transactions, isLoading } = useTransactions({ status, limit: 50, sort: 'created_at:desc' });

  if (isLoading) return <LoadingState />;

  const data = transactions?.data ?? [];
  const totalAmount = data.reduce((sum, trx) => sum + Number(trx.finalTotal ?? trx.estimatedTotal ?? 0), 0);

  return (
    <div className="admin-transactions-page">
      <section className="trx-header"><div><span>Platform Ledger</span><h1>Transactions</h1><p>Monitor transaksi dari seluruh tenant biro jasa.</p></div></section>
      <section className="trx-summary"><div><span>Total Rows</span><strong>{data.length}</strong></div><div><span>Gross Value</span><strong>{formatCurrency(totalAmount)}</strong></div><div><span>Filter</span><strong>{status || 'ALL'}</strong></div></section>
      <section className="trx-panel">
        <div className="trx-toolbar">{filters.map((filter) => <button key={filter.label} className={status === filter.value ? 'active' : ''} onClick={() => setStatus(filter.value)}>{filter.label}</button>)}</div>
        {!transactions || data.length === 0 ? <EmptyState message="Belum ada transaksi" /> : (
          <div className="trx-list">
            <div className="trx-list-head"><span>Invoice</span><span>Customer</span><span>Tenant</span><span>Total</span><span>Status</span><span>Date</span></div>
            {data.map((trx: Transaction) => (
              <div className="trx-row" key={trx.id}>
                <strong>{trx.invoiceNumber}</strong>
                <span>{trx.customer?.name ?? '-'}</span>
                <span>{trx.tenant?.code ?? '-'}</span>
                <span>{formatCurrency(trx.finalTotal ?? trx.estimatedTotal ?? 0)}</span>
                <StatusBadge status={trx.status} />
                <span>{formatDateTime(trx.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
      <style jsx global>{`.admin-transactions-page{max-width:1440px;margin:0 auto}.trx-header{margin-bottom:22px}.trx-header span,.trx-summary span{color:#76777d;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.trx-header h1{margin:6px 0 0;font-size:36px;line-height:44px;font-weight:900;letter-spacing:-.03em}.trx-header p{margin:6px 0 0;color:#45464d}.trx-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:22px}.trx-summary div{background:#fff;border:1px solid #c6c6cd;border-radius:18px;padding:20px}.trx-summary strong{display:block;margin-top:10px;font-size:26px;font-weight:900}.trx-panel{background:#fff;border:1px solid #c6c6cd;border-radius:18px;overflow:hidden}.trx-toolbar{display:flex;gap:8px;padding:18px 24px;border-bottom:1px solid #e4e2e4;flex-wrap:wrap}.trx-toolbar button{min-height:36px;padding:0 14px;border-radius:999px;background:#f6f3f5;color:#45464d;font-weight:900}.trx-toolbar button.active{background:#131b2e;color:#fff}.trx-list-head,.trx-row{display:grid;grid-template-columns:minmax(160px,1fr) minmax(160px,1fr) 100px 150px 130px 190px;gap:16px;align-items:center}.trx-list-head{padding:12px 24px;background:#f6f3f5;color:#76777d;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.trx-row{padding:16px 24px;border-top:1px solid #e4e2e4}.trx-row strong{color:#004395;font-family:monospace}.trx-row span{color:#45464d}@media(max-width:1100px){.trx-summary{grid-template-columns:1fr}.trx-list-head{display:none}.trx-row{grid-template-columns:1fr 1fr}}`}</style>
    </div>
  );
}
