// =============================================================
// izhubs ERP — Badge
// Semantic badge component. Wraps .badge CSS class.
// Variant drives color — always uses CSS variable tokens.
// =============================================================

import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** Extra class for custom styling */
  className?: string;
}

export default function Badge({
  children,
  variant = 'neutral',
  className = '',
}: BadgeProps) {
  const variantClass =
    variant === 'neutral' ? '' : `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
