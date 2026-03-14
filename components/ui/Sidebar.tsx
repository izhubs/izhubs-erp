'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Activity,
  Settings,
  BarChart2,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
  { href: '/contacts',   label: 'Contacts',   icon: <Users size={18} /> },
  { href: '/deals',      label: 'Deals',      icon: <Briefcase size={18} /> },
  { href: '/contracts',  label: 'Contracts',  icon: <FileText size={18} /> },
  { href: '/automation', label: 'Automation', icon: <Zap size={18} /> },
  { href: '/reports',    label: 'Reports',    icon: <BarChart2 size={18} /> },
  { href: '/audit-log',  label: 'Audit Log',  icon: <Activity size={18} /> },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={`sidebar${collapsed ? ' collapsed' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      {/* Logo */}
      <div>
        <div
          style={{
            padding: collapsed ? 'var(--space-4) var(--space-3)' : 'var(--space-4) var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
            minHeight: 'var(--header-height)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontWeight: 700,
              fontSize: 13,
              color: '#fff',
            }}
          >
            iz
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', letterSpacing: '-0.02em' }}>
              izhubs ERP
            </span>
          )}
        </div>

        {/* Main Nav */}
        <nav style={{ padding: 'var(--space-3)' }}>
          {NAV_ITEMS.map((item) => (
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
        </nav>
      </div>

      {/* Bottom: Settings + Collapse toggle */}
      <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
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

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="nav-link"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
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
