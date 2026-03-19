'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import CommandPalette from '@/components/ui/CommandPalette';
import QueryProvider from '@/components/providers/QueryProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { Menu } from 'lucide-react';
import { ToastProvider } from '@/lib/toast';
import type { NavItem } from '@/templates/engine/template.schema';
import DevResetDbButton from './DevResetDbButton';


interface Props {
  children: React.ReactNode;
  navItems: NavItem[];
  bottomItems?: NavItem[];
  /** CSS variable overrides from industry_templates.theme_defaults */
  themeDefaults?: Record<string, string>;
}

function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
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
    } catch { /* silent fail */ }
  }, []);

  if (!isDemo || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '8px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(20, 22, 34, 0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '100px',
      padding: '8px 16px 8px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.2)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.72)',
      }}>
        <span style={{
          width: '7px', height: '7px',
          background: 'var(--color-primary)',
          borderRadius: '50%',
          display: 'inline-block',
          boxShadow: '0 0 8px var(--color-primary)',
          flexShrink: 0,
          animation: 'demoP 2s ease-in-out infinite',
        }} />
        Demo session
      </span>
      <a
        href="/register"
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-primary)',
          textDecoration: 'none',
          padding: '3px 12px',
          background: 'rgba(99,102,241,0.18)',
          borderRadius: '100px',
          border: '1px solid rgba(99,102,241,0.3)',
        }}
      >
        Sign up free →
      </a>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer', padding: '0 2px',
          fontSize: '13px', lineHeight: 1,
        }}
      >✕</button>
      <style>{`@keyframes demoP{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
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
    <LanguageProvider>
    <QueryProvider>
    <ToastProvider>
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Dev only specific floating controls */}
      <DevResetDbButton />
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
    </LanguageProvider>
  );
}


