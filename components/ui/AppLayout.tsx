'use client';

import { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import { Menu } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

/**
 * AppLayout — Client Component.
 * Manages sidebar collapsed state (desktop) and mobile drawer open state.
 * On mobile (<768px): sidebar is hidden, hamburger button toggles a drawer.
 */
export default function AppLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Mobile overlay — tap to close sidebar drawer */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Header
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
  );
}

