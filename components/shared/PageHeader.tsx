// =============================================================
// izhubs ERP — PageHeader
// Standard page header: title + subtitle + actions slot.
// Renders .page-header from _layout.scss.
// =============================================================

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Buttons/actions aligned to the right */
  actions?: React.ReactNode;
  /** Breadcrumb rendered above title */
  breadcrumb?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {breadcrumb && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
            {breadcrumb}
          </div>
        )}
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}
