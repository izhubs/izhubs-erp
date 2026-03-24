// =============================================================
// izhubs ERP — EmptyState (shim → IzEmptyState)
// Preserves legacy props API; delegates to IzEmptyState.
// =============================================================

import React from 'react';
import { IzEmptyState } from '@izerp-theme/components/ui/IzEmptyState';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary call-to-action — rendered below description */
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <IzEmptyState icon={icon} title={title} description={description} />
      {action && <div style={{ marginTop: 'var(--space-4)' }}>{action}</div>}
    </div>
  );
}
