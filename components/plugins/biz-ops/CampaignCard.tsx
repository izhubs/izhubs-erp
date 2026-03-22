'use client';

import styles from './BizOpsProjects.module.scss';

interface CampaignCardProps {
  campaign: {
    id: string;
    contract_id: string;
    name: string;
    type: string;
    allocated_budget: number;
    actual_cogs: number;
    stage: string;
    health: string;
    start_date: string | null;
    end_date: string | null;
  };
  contractTitle?: string;
  onEdit: (e?: React.MouseEvent) => void;
  onDelete: (e?: React.MouseEvent) => void;
  onOpenExpenses: (e?: React.MouseEvent) => void;
  onClick?: () => void;
}

const HEALTH_MAP: Record<string, { dot: string; label: string }> = {
  healthy:   { dot: styles.healthHealthy, label: 'Healthy' },
  at_risk:   { dot: styles.healthAtRisk, label: 'At Risk' },
  delayed:   { dot: styles.healthDelayed, label: 'Delayed' },
  completed: { dot: styles.healthCompleted, label: 'Done' },
};

const TYPE_LABELS: Record<string, string> = {
  seo: 'SEO', ads: 'Ads', social: 'Social', web: 'Web',
  construction: 'Construction', general: 'General',
};

function formatBudget(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

export function CampaignCard({ campaign, contractTitle, onEdit, onDelete, onOpenExpenses, onClick }: CampaignCardProps) {
  const health = HEALTH_MAP[campaign.health] ?? HEALTH_MAP.healthy;
  const budgetPct = campaign.allocated_budget > 0
    ? Math.min((campaign.actual_cogs / campaign.allocated_budget) * 100, 100)
    : 0;

  return (
    <div 
      className={styles.campaignCard} 
      id={`campaign-${campaign.id}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={styles.campaignMeta}>
        <h4 className={styles.campaignName}>{campaign.name}</h4>
        <span className={styles.typeBadge}>{TYPE_LABELS[campaign.type] ?? campaign.type}</span>
      </div>

      {contractTitle && (
        <span className={styles.contractLabel} title={contractTitle}>🔗 {contractTitle}</span>
      )}

      <div className={styles.valueSection}>
        <div className={styles.valueRow}>
          <span className={styles.valueLabel}>Budget spent</span>
          <span className={styles.valueAmount}>
            {formatBudget(campaign.actual_cogs)} / {formatBudget(campaign.allocated_budget)}
          </span>
        </div>
        <div className={styles.valueBar}>
          <div
            className={styles.valueBarFill}
            style={{
              width: `${budgetPct}%`,
              background: budgetPct > 80
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : 'linear-gradient(90deg, #3b82f6, #6366f1)',
            }}
          />
        </div>
      </div>

      <div className={styles.campaignFooter}>
        <span>
          <span className={`${styles.healthDot} ${health.dot}`} />
          {health.label} · {campaign.stage}
        </span>
        <span>
          {campaign.start_date && new Date(campaign.start_date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
          {campaign.start_date && campaign.end_date && ' → '}
          {campaign.end_date && new Date(campaign.end_date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.actionBtn} onClick={onEdit} title="Edit">✏️ Edit</button>
        <button className={styles.actionBtn} onClick={onOpenExpenses} title="Manage Expenses">💸 Expenses</button>
        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={onDelete} title="Delete">🗑️</button>
      </div>
    </div>
  );
}
