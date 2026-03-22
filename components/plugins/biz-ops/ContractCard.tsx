'use client';

import styles from './BizOpsProjects.module.scss';

interface ContractCardProps {
  contract: {
    id: string;
    title: string;
    code: string | null;
    status: string;
    total_value: number;
    collected_value: number;
    currency: string;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
  };
  campaignCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onOpenPayments: () => void;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  draft:       { label: 'Draft',       className: styles.badgeDraft },
  signed:      { label: 'Signed',      className: styles.badgeSigned },
  in_progress: { label: 'In Progress', className: styles.badgeInProgress },
  completed:   { label: 'Completed',   className: styles.badgeCompleted },
  cancelled:   { label: 'Cancelled',   className: styles.badgeCancelled },
};

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value);
}

export function ContractCard({ contract, campaignCount, onEdit, onDelete, onClick, onOpenPayments }: ContractCardProps) {
  const pct = contract.total_value > 0
    ? Math.min((contract.collected_value / contract.total_value) * 100, 100)
    : 0;
  const status = STATUS_MAP[contract.status] ?? STATUS_MAP.draft;

  return (
    <div className={styles.contractCard} onClick={onClick} id={`contract-${contract.id}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>{contract.title}</h3>
          {contract.code && <span className={styles.cardCode}>{contract.code}</span>}
        </div>
        <span className={`${styles.badge} ${status.className}`}>{status.label}</span>
      </div>

      <div className={styles.valueSection}>
        <div className={styles.valueRow}>
          <span className={styles.valueLabel}>Collected</span>
          <span className={styles.valueAmount}>
            {formatMoney(contract.collected_value, contract.currency)} / {formatMoney(contract.total_value, contract.currency)}
          </span>
        </div>
        <div className={styles.valueBar}>
          <div className={styles.valueBarFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={styles.cardMeta}>
        <span>📋 {campaignCount} project{campaignCount !== 1 ? 's' : ''}</span>
        {contract.start_date && (
          <span>📅 {new Date(contract.start_date).toLocaleDateString('vi-VN')}</span>
        )}
      </div>

      <div className={styles.cardActions}>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Edit"
        >
          ✏️ Edit
        </button>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onOpenPayments(); }}
          title="Manage Payments"
        >
          💰 Payments
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
