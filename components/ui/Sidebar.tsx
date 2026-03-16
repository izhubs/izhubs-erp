'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Briefcase, FileText,
  Activity, Settings, BarChart2, Zap,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
  { href: '/contacts',   label: 'Contacts',   icon: <Users size={18} /> },
  { href: '/deals',      label: 'Deals',      icon: <Briefcase size={18} /> },
  { href: '/contracts',  label: 'Contracts',  icon: <FileText size={18} /> },
  { href: '/automation', label: 'Automation', icon: <Zap size={18} /> },
  { href: '/reports',    label: 'Reports',    icon: <BarChart2 size={18} /> },
  { href: '/audit-log',  label: 'Audit Log',  icon: <Activity size={18} /> },
];

const BOTTOM_ITEMS = [
  { href: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

export default function Sidebar({
  collapsed = false,
  onCollapse,
  mobileOpen = false,
  onMobileClose,
}: {
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__mark">iz</div>
        {!collapsed && <span className="sidebar-logo__name">izhubs ERP</span>}
      </div>

      {/* Main Nav */}
      <nav style={{ padding: 'var(--space-3)', flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`nav-link${isActive(item.href) ? ' nav-link--active' : ''}`}
            onClick={onMobileClose}
          >
            <span className="nav-link__icon">{item.icon}</span>
            {!collapsed && <span className="nav-link__label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom: Settings + Collapse toggle */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-3)' }}>
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`nav-link${isActive(item.href) ? ' nav-link--active' : ''}`}
          >
            <span className="nav-link__icon">{item.icon}</span>
            {!collapsed && <span className="nav-link__label">{item.label}</span>}
          </Link>
        ))}

        <button
          onClick={() => onCollapse?.(!collapsed)}
          className="nav-link"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="nav-link__icon">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </span>
          {!collapsed && <span className="nav-link__label">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
