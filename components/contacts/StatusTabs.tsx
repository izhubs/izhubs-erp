'use client';

// =============================================================
// A2: Status Tabs — extracted from ContactsTable (Rule #8: <150 lines)
// =============================================================

export const STATUS_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'lead',     label: 'Lead' },
  { key: 'customer', label: 'Customer' },
  { key: 'prospect', label: 'Prospect' },
  { key: 'churned',  label: 'Churned' },
] as const;

export type StatusTabKey = typeof STATUS_TABS[number]['key'];

interface Props {
  active: string;
  counts: Record<string, number>;
  onChange: (tab: string) => void;
}

import styles from './contacts.module.scss';

export default function StatusTabs({ active, counts, onChange }: Props) {
  return (
    <div className={styles.tabBar}>
      {STATUS_TABS.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tab}${active === tab.key ? ` ${styles.tabActive}` : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {counts[tab.key] !== undefined && (
            <span className={styles.tabCount}>{counts[tab.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
