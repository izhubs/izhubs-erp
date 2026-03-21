'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
  config?: Record<string, any>;
}

interface UsePluginsReturn {
  plugins: PluginStatus[];
  isLoading: boolean;
  install: (pluginId: string) => Promise<void>;
  uninstall: (pluginId: string) => Promise<void>;
  updateConfig: (pluginId: string, config: Record<string, any>) => Promise<void>;
  setPlugins: React.Dispatch<React.SetStateAction<PluginStatus[]>>;
}

export function usePlugins(initialPlugins: PluginStatus[]): UsePluginsReturn {
  const [plugins, setPlugins] = useState<PluginStatus[]>(initialPlugins);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      router.refresh(); // Refresh Server Components to update Sidebar Menu
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
      router.refresh(); // Refresh Server Components to update Sidebar Menu
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (pluginId: string, newConfig: Record<string, any>) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/plugins/${pluginId}/config`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Bạn không có quyền quản lý cấu hình Plugin');
        }
        const err = await res.json();
        throw new Error(typeof err?.error === 'string' ? err.error : (err?.error?.message || 'Lỗi cập nhật cấu hình'));
      }
      const data = await res.json();
      setPlugins(prev =>
        prev.map(p => p.id === pluginId ? { ...p, config: data.data.config } : p)
      );
      router.refresh(); // Refresh Server Components if allowedRoles changes
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { plugins, isLoading, install, uninstall, updateConfig, setPlugins };
}
