'use client';

import { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';

interface Props {
  children: React.ReactNode;
}

/**
 * AppLayout — Client Component.
 * Manages sidebar collapsed state so .app-layout can receive
 * .sidebar-collapsed class → fixes grid column gap (Bug 1).
 */
export default function AppLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Header />
      <main className="main-content">
        <div className="page">{children}</div>
      </main>
    </div>
  );
}
