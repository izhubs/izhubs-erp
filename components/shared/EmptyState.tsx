// =============================================================
// izhubs ERP — EmptyState
// Generic empty state card: icon, title, description, CTA.
// Used when DataTable has 0 rows or a module has no data.
// =============================================================

import React from 'react';

interface EmptyStateProps {
  /** Main icon — pass an SVG or Lucide icon component */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary call-to-action button */
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-8)',
        gap: 'var(--space-3)',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            color: 'var(--color-text-subtle)',
            opacity: 0.5,
            marginBottom: 'var(--space-2)',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            maxWidth: 400,
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 'var(--space-4)' }}>{action}</div>}
    </div>
  );
}
