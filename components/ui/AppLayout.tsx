'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import CommandPalette from '@/components/ui/CommandPalette';
import QueryProvider from '@/components/providers/QueryProvider';
import { Menu } from 'lucide-react';
import { ToastProvider } from '@/lib/toast';
import type { NavItem } from '@/templates/engine/template.schema';

interface Props {
  children: React.ReactNode;
  navItems: NavItem[];
  bottomItems?: NavItem[];
  /** CSS variable overrides from industry_templates.theme_defaults */
  themeDefaults?: Record<string, string>;
}

function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Demo emails follow the pattern demo_{industry}_{role}@izhubs.com
    // We check by decoding the JWT payload (no verification needed here — just UX)
    try {
      const token = document.cookie
        .split('; ')
        .find(r => r.startsWith('hz_access='))
        ?.split('=')[1];
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.email?.startsWith('demo_') && payload.email?.endsWith('@izhubs.com')) {
        setIsDemo(true);
      }
    } catch {
      // Not a valid JWT or cookie missing — silent fail
    }
  }, []);

  if (!isDemo) return null;

  return (
    <div style={{
      background: 'var(--color-primary)',
      color: '#fff',
      textAlign: 'center',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 500,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexShrink: 0,
    }}>
      <span>💡 This is a demo session. Data resets every hour.</span>
      <a
        href="/register"
        style={{
          color: '#fff',
          fontWeight: 700,
          textDecoration: 'underline',
          whiteSpace: 'nowrap',
        }}
      >
        Sign up to keep your data →
      </a>
    </div>
  );
}

export default function AppLayout({ children, navItems, bottomItems, themeDefaults }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Apply industry-specific CSS variables from themeDefaults
  // e.g. { "--color-primary": "#10b981", "--color-accent": "#0ea5e9" }
  useEffect(() => {
    if (!themeDefaults || Object.keys(themeDefaults).length === 0) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(themeDefaults)) {
      root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(themeDefaults)) {
        root.style.removeProperty(key);
      }
    };
  }, [themeDefaults]);

  // Global Ctrl+K / ⌘+K → open command palette
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setPaletteOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);


  return (
    <QueryProvider>
    <ToastProvider>
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Command Palette — global Ctrl+K / ⌘K */}
      <CommandPalette
        navItems={[...navItems, ...(bottomItems ?? [])].filter(i => i.href)}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
      {/* Demo session banner — only visible to demo users */}
      <DemoBanner />

      {/* Mobile overlay — tap to close sidebar drawer */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        navItems={navItems}
        bottomItems={bottomItems}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Header
        onSearchClick={() => setPaletteOpen(true)}
        mobileMenuButton={
          <button
            className="btn btn-ghost mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            title="Menu"
          >
            <Menu size={20} />
          </button>
        }
      />

      <main className="main-content">
        <div className="page">{children}</div>
      </main>
    </div>
    </ToastProvider>
    </QueryProvider>
  );
}


