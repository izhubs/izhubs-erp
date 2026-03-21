'use client';

import { useState, useMemo } from 'react';
import { PluginCard } from './PluginCard';
import { usePlugins } from '../hooks/usePlugins';
import styles from './AppStore.module.scss';
import { IzInput } from '@/components/ui/IzInput';
import { IzTabs, IzTabsList, IzTabsTrigger } from '@/components/ui/IzTabs';
import { PageHeader } from '@/components/shared';

interface Plugin {
  id: string;
  name: string;
  description: string | null;
  version: string;
  category: 'core' | 'finance' | 'operations' | 'communication';
  icon: string | null;
  isOfficial: boolean;
  isActive: boolean;
  installedAt: string | null;
  config?: Record<string, any>;
}

interface AppStoreProps {
  initialPlugins: Plugin[];
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'core', label: 'Core' },
  { key: 'finance', label: 'Tài chính' },
  { key: 'operations', label: 'Vận hành' },
  { key: 'communication', label: 'Liên lạc' },
];

export function AppStore({ initialPlugins }: AppStoreProps) {
  const { plugins, install, uninstall, updateConfig } = usePlugins(initialPlugins);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return plugins.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchCat && matchSearch;
    });
  }, [plugins, activeCategory, search]);

  const activeCount = plugins.filter(p => p.isActive).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <PageHeader
        title="Quản lý Plugins"
        subtitle={`${activeCount}/${plugins.length} plugins đang hoạt động`}
      />

      {/* Filters */}
      <div className={styles.filters}>
        {/* Category tabs */}
        <IzTabs value={activeCategory} onValueChange={setActiveCategory}>
          <IzTabsList>
            {CATEGORIES.map(cat => (
              <IzTabsTrigger key={cat.key} value={cat.key}>
                {cat.label}
              </IzTabsTrigger>
            ))}
          </IzTabsList>
        </IzTabs>

        {/* Search */}
        <IzInput
          type="search"
          placeholder="Tìm plugin..."
          value={search}
          onChange={(e: { target: { value: string } }) => setSearch(e.target.value)}
          id="plugin-search"
          aria-label="Tìm kiếm plugin"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Không tìm thấy plugin nào.</p>
        </div>
      ) : (
        <div className={styles.grid} role="list">
          {filtered.map(p => (
            <div key={p.id} role="listitem">
              <PluginCard
                {...p}
                onInstall={install}
                onUninstall={uninstall}
                onUpdateConfig={updateConfig}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
