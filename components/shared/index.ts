// =============================================================
// izhubs ERP — Shared Component Library
// Barrel export — import from '@/components/shared'
//
// NEVER import individual files directly from this folder.
// Always use the barrel to allow future tree-shaking.
// =============================================================

export { default as KpiCard } from './KpiCard';
export type { KpiCardProps, TrendDirection } from './KpiCard';

export { default as Badge } from './Badge';
export type { BadgeVariant } from './Badge';

export { default as PageHeader } from './PageHeader';

export { default as AvatarGroup } from './AvatarGroup';
export type { Avatar } from './AvatarGroup';

export { default as EmptyState } from './EmptyState';

export { default as DataTable } from './DataTable';
export type { DataTableColumn } from './DataTable';

export { default as SidePanel } from './SidePanel';

export { default as Modal } from './Modal';

// Re-export existing shared components
export { default as Pagination } from './Pagination';
