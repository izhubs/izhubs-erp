'use client';

import { useState, useCallback } from 'react';

interface ModuleStatus {
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

interface UseModulesReturn {
  modules: ModuleStatus[];
  isLoading: boolean;
  install: (moduleId: string) => Promise<void>;
  uninstall: (moduleId: string) => Promise<void>;
  setModules: React.Dispatch<React.SetStateAction<ModuleStatus[]>>;
}

export function useModules(initialModules: ModuleStatus[]): UseModulesReturn {
  const [modules, setModules] = useState<ModuleStatus[]>(initialModules);
  const [isLoading, setIsLoading] = useState(false);

  const install = useCallback(async (moduleId: string) => {
    // Optimistic update — flip immediately, revert on error
    setModules(prev =>
      prev.map(m => m.id === moduleId ? { ...m, isActive: true, installedAt: new Date().toISOString() } : m)
    );

    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/modules/${moduleId}/install`, { method: 'POST' });
      if (!res.ok) {
        // Revert on failure
        setModules(prev =>
          prev.map(m => m.id === moduleId ? { ...m, isActive: false, installedAt: null } : m)
        );
        const err = await res.json();
        throw new Error(err?.error?.message || 'Install failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uninstall = useCallback(async (moduleId: string) => {
    // Optimistic update
    setModules(prev =>
      prev.map(m => m.id === moduleId ? { ...m, isActive: false } : m)
    );

    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/modules/${moduleId}/install`, { method: 'DELETE' });
      if (!res.ok) {
        // Revert on failure (e.g. trying to uninstall crm)
        setModules(prev =>
          prev.map(m => m.id === moduleId ? { ...m, isActive: true } : m)
        );
        const err = await res.json();
        throw new Error(err?.error?.message || 'Uninstall failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { modules, isLoading, install, uninstall, setModules };
}
