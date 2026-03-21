'use client';

import { useState } from 'react';
import styles from './ModuleCard.module.scss';
import { IzButton } from '@/components/ui/IzButton';
import { IzBadge } from '@/components/ui/IzBadge';
import { Icon } from '@/components/ui/Icon';

interface PluginCardProps {
  id: string;
  name: string;
  description: string | null;
  version: string;
  category: 'core' | 'finance' | 'operations' | 'communication';
  icon: string | null;
  isOfficial: boolean;
  isActive: boolean;
  config?: Record<string, any>;
  onInstall: (id: string) => Promise<void>;
  onUninstall: (id: string) => Promise<void>;
  onUpdateConfig?: (id: string, config: Record<string, any>) => Promise<void>;
}

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core',
  finance: 'Finance',
  operations: 'Operations',
  communication: 'Communication',
};

const CATEGORY_COLORS: Record<string, string> = {
  core: '#6366f1',
  finance: '#10b981',
  operations: '#f59e0b',
  communication: '#3b82f6',
};

export function PluginCard({
  id, name, description, version, category, icon,
  isOfficial, isActive, config, onInstall, onUninstall, onUpdateConfig
}: PluginCardProps) {
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
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const isCorePlugin = id === 'crm'; // core plugins cannot be uninstalled

  const RolesSelector = () => {
    if (!isActive || !onUpdateConfig) return null;
    const currentRoles = Array.isArray(config?.allowedRoles) ? config.allowedRoles : ['admin', 'member'];
    const rolesList = [
      { id: 'admin', label: 'Admin' },
      { id: 'member', label: 'Member' },
      { id: 'guest', label: 'Guest' },
    ];

    const toggleRole = async (roleId: string) => {
      const newRoles = currentRoles.includes(roleId) 
        ? currentRoles.filter(r => r !== roleId)
        : [...currentRoles, roleId];
      
      if (newRoles.length === 0) return;

      try {
        await onUpdateConfig(id, { allowedRoles: newRoles });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error updating roles');
      }
    };

    return (
      <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          Allowed roles:
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {rolesList.map(role => {
            const isSelected = currentRoles.includes(role.id);
            return (
              <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleRole(role.id)}
                  style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                {role.label}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.card} ${isActive ? styles.active : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.icon}>
          {icon && !icon.includes(' ') && icon.length > 2 ? <Icon name={icon as any} size={28} /> : <span>{icon ?? '📦'}</span>}
        </div>
        <div className={styles.meta}>
          <IzBadge
            variant="secondary"
            style={{ 
              backgroundColor: CATEGORY_COLORS[category] + '20', 
              color: CATEGORY_COLORS[category],
              border: 'none'
            }}
          >
            {CATEGORY_LABELS[category]}
          </IzBadge>
          {isOfficial && (
            <IzBadge variant="outline" className={styles.officialBadge}>Official</IzBadge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {description && <p className={styles.description}>{description}</p>}
        <span className={styles.version}>v{version}</span>
        
        <RolesSelector />
      </div>

      {/* Status + Action */}
      <div className={styles.footer}>
        <div className={styles.status}>
          <span className={`${styles.statusDot} ${isActive ? styles.dotActive : styles.dotInactive}`} />
          <span className={styles.statusLabel}>{isActive ? 'Active' : 'Not installed'}</span>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <IzButton
          variant={isCorePlugin ? 'secondary' : (isActive ? 'outline' : 'default')}
          className="w-full"
          onClick={handleToggle}
          disabled={loading || isCorePlugin}
          title={isCorePlugin ? 'Core plugins cannot be uninstalled' : undefined}
        >
          {loading ? '...' : isActive ? (isCorePlugin ? '🔒 Core' : 'Uninstall') : 'Install'}
        </IzButton>
      </div>
    </div>
  );
}
