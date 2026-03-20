'use client';

import { useState } from 'react';
import styles from './ModuleCard.module.scss';
import { IzButton } from '@/components/ui/IzButton';

interface ModuleCardProps {
  id: string;
  name: string;
  description: string | null;
  version: string;
  category: 'core' | 'finance' | 'operations' | 'communication';
  icon: string | null;
  isOfficial: boolean;
  isActive: boolean;
  onInstall: (id: string) => Promise<void>;
  onUninstall: (id: string) => Promise<void>;
}

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core',
  finance: 'Tài chính',
  operations: 'Vận hành',
  communication: 'Liên lạc',
};

const CATEGORY_COLORS: Record<string, string> = {
  core: '#6366f1',
  finance: '#10b981',
  operations: '#f59e0b',
  communication: '#3b82f6',
};

export function ModuleCard({
  id, name, description, version, category, icon,
  isOfficial, isActive, onInstall, onUninstall,
}: ModuleCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isActive) {
        await onUninstall(id);
      } else {
        await onInstall(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const isCoreModule = id === 'crm'; // core modules cannot be uninstalled

  return (
    <div className={`${styles.card} ${isActive ? styles.active : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.icon} role="img" aria-label={name}>
          {icon ?? '📦'}
        </span>
        <div className={styles.meta}>
          <span
            className={styles.categoryBadge}
            style={{ backgroundColor: CATEGORY_COLORS[category] + '20', color: CATEGORY_COLORS[category] }}
          >
            {CATEGORY_LABELS[category]}
          </span>
          {isOfficial && (
            <span className={styles.officialBadge}>Official</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {description && <p className={styles.description}>{description}</p>}
        <span className={styles.version}>v{version}</span>
      </div>

      {/* Status + Action */}
      <div className={styles.footer}>
        <div className={styles.status}>
          <span className={`${styles.statusDot} ${isActive ? styles.dotActive : styles.dotInactive}`} />
          <span className={styles.statusLabel}>{isActive ? 'Đang hoạt động' : 'Chưa cài đặt'}</span>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <IzButton
          variant={isActive ? 'outline' : 'default'}
          className={styles.btn}
          onClick={handleToggle}
          disabled={loading || isCoreModule}
          title={isCoreModule ? 'Module này không thể gỡ cài đặt' : undefined}
        >
          {loading ? '...' : isActive ? (isCoreModule ? '🔒 Bắt buộc' : 'Gỡ cài đặt') : 'Cài đặt'}
        </IzButton>
      </div>
    </div>
  );
}
