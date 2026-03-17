'use client';

import { useState, useMemo } from 'react';
import { ModuleCard } from './ModuleCard';
import { useModules } from '../hooks/useModules';
import styles from './AppStore.module.scss';

interface Module {
  id: string;
  name: string;
  description: string | null;
  version: string;
  category: 'core' | 'finance' | 'operations' | 'communication';
  icon: string | null;
  isOfficial: boolean;
  isActive: boolean;
  installedAt: string | null;
}

interface AppStoreProps {
  initialModules: Module[];
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'core', label: 'Core' },
  { key: 'finance', label: 'Tài chính' },
  { key: 'operations', label: 'Vận hành' },
  { key: 'communication', label: 'Liên lạc' },
];

export function AppStore({ initialModules }: AppStoreProps) {
  const { modules, install, uninstall } = useModules(initialModules);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return modules.filter(m => {
      const matchCat = activeCategory === 'all' || m.category === activeCategory;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchCat && matchSearch;
    });
  }, [modules, activeCategory, search]);

  const activeCount = modules.filter(m => m.isActive).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Quản lý Modules</h1>
          <p className={styles.subtitle}>
            {activeCount}/{modules.length} modules đang hoạt động
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {/* Category tabs */}
        <div className={styles.tabs} role="tablist">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              role="tab"
              aria-selected={activeCategory === cat.key}
              className={`${styles.tab} ${activeCategory === cat.key ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Tìm module..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.search}
          id="module-search"
          aria-label="Tìm kiếm module"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Không tìm thấy module nào.</p>
        </div>
      ) : (
        <div className={styles.grid} role="list">
          {filtered.map(m => (
            <div key={m.id} role="listitem">
              <ModuleCard
                {...m}
                onInstall={install}
                onUninstall={uninstall}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
