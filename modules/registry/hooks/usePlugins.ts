'use client';

import { useState, useCallback } from 'react';

interface PluginStatus {
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

interface UsePluginsReturn {
  plugins: PluginStatus[];
  isLoading: boolean;
  install: (pluginId: string) => Promise<void>;
  uninstall: (pluginId: string) => Promise<void>;
  setPlugins: React.Dispatch<React.SetStateAction<PluginStatus[]>>;
}

export function usePlugins(initialPlugins: PluginStatus[]): UsePluginsReturn {
  const [plugins, setPlugins] = useState<PluginStatus[]>(initialPlugins);
  const [isLoading, setIsLoading] = useState(false);

  const install = useCallback(async (pluginId: string) => {
    // Optimistic update — flip immediately, revert on error
    setPlugins(prev =>
      prev.map(p => p.id === pluginId ? { ...p, isActive: true, installedAt: new Date().toISOString() } : p)
    );

    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/plugins/${pluginId}/install`, { method: 'POST' });
      if (!res.ok) {
        // Revert on failure
        setPlugins(prev =>
          prev.map(p => p.id === pluginId ? { ...p, isActive: false, installedAt: null } : p)
        );
        const err = await res.json();
        throw new Error(err?.error?.message || 'Install failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uninstall = useCallback(async (pluginId: string) => {
    // Optimistic update
    setPlugins(prev =>
      prev.map(p => p.id === pluginId ? { ...p, isActive: false } : p)
    );

    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/plugins/${pluginId}/install`, { method: 'DELETE' });
      if (!res.ok) {
        // Revert on failure (e.g. trying to uninstall crm)
        setPlugins(prev =>
          prev.map(p => p.id === pluginId ? { ...p, isActive: true } : p)
        );
        const err = await res.json();
        throw new Error(err?.error?.message || 'Uninstall failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { plugins, isLoading, install, uninstall, setPlugins };
}
