'use client';

import { PageHeader } from '../../../../shared/components/PageHeader';
import { EmptyState } from '../../../../shared/components/EmptyState';

export default function PromotionsPage() {
  return (
    <div>
      <PageHeader
        title="Promotions"
        subtitle="Manage platform-wide discount campaigns and promo codes"
        actions={
          <button
            style={{
              backgroundColor: '#007AFF',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + New Promotion
          </button>
        }
      />
      <EmptyState
        message="Belum ada promosi"
        description="Fitur manajemen promosi segera hadir"
      />
    </div>
  );
}
