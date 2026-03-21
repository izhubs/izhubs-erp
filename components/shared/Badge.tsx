// =============================================================
// izhubs ERP — Badge (shim → IzBadge)
// Keeps legacy BadgeVariant API; delegates rendering to IzBadge.
// All call sites continue working without changes.
// =============================================================

import React from 'react';
import { IzBadge, type IzBadgeVariant } from '@/components/ui/IzBadge';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'neutral';

/** Map legacy variant names to IzBadge variants */
function toIzVariant(v: BadgeVariant): IzBadgeVariant {
  const map: Record<BadgeVariant, IzBadgeVariant> = {
    success: 'success',
    warning: 'warning',
    danger: 'destructive',
    info: 'secondary',
    primary: 'default',
    neutral: 'outline',
  };
  return map[v];
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <IzBadge variant={toIzVariant(variant)} className={className}>
      {children}
    </IzBadge>
  );
}
