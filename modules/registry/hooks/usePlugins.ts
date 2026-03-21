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
        if (res.status === 403) {
          throw new Error('Bạn không có quyền cài đặt Plugin (Yêu cầu quyền admin)');
        }
        const err = await res.json();
        throw new Error(typeof err?.error === 'string' ? err.error : (err?.error?.message || 'Lỗi cài đặt'));
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
        if (res.status === 403) {
          throw new Error('Bạn không có quyền gỡ hoặc plugin này bắt buộc');
        }
        const err = await res.json();
        throw new Error(typeof err?.error === 'string' ? err.error : (err?.error?.message || 'Lỗi gỡ plugin'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { plugins, isLoading, install, uninstall, setPlugins };
}
