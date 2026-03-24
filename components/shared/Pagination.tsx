'use client';

// =============================================================
// izhubs ERP — Pagination (shim)
// Keeps simple page/totalPages/onPageChange API.
// Uses IzButton internally — no external dependency on IzPagination
// which has an incompatible TanStack Table API.
// =============================================================

import { IzButton } from '@izerp-theme/components/ui/IzButton';
import styles from './shared.module.scss';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className={styles.paginationBar}>
      <IzButton variant="ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Prev
      </IzButton>
      <span className={styles.paginationInfo}>{start}–{end} of {total}</span>
      <IzButton variant="ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next →
      </IzButton>
    </div>
  );
}
