'use client';

import { PageHeader } from '../../../../shared/components/PageHeader';
import { EmptyState } from '../../../../shared/components/EmptyState';

export default function AuditLogsPage() {
  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Track all admin and tenant actions for compliance"
      />
      <EmptyState
        message="Belum ada audit log"
        description="Log aktivitas akan muncul di sini"
      />
    </div>
  );
}
