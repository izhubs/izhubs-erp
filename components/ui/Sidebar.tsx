'use client';

// =============================================================
// izhubs ERP — Sidebar (Dumb Component)
// Renders purely from NavItem[] props — zero business logic inside.
// No if (industry === ...) allowed here. Inversion of Control.
//
// Data flow:
//   DB (industry_templates) → lib/nav-config.ts → DashboardLayout → Sidebar props
// =============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Briefcase, FileText,
  Activity, Settings, BarChart2, Zap,
  ChevronLeft, ChevronRight, Upload, ShoppingCart,
  Building2, CalendarHeart, UtensilsCrossed, Box,
  Star, Globe, Headphones, Package, PieChart,
  Layers, Bell, Lock, Database, Cpu,
  LucideIcon,
} from 'lucide-react';
import type { NavItem } from '@/templates/engine/template.schema';

// =============================================================
// ICON_MAP — resolves Lucide icon name (string) → component.
// Add entries here as new templates use new icons.
// =============================================================
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, Briefcase, FileText,
  Activity, Settings, BarChart2, Zap,
  Upload, ShoppingCart, Building2, CalendarHeart,
  UtensilsCrossed, Box, Star, Globe, Headphones,
  Package, PieChart, Layers, Bell, Lock,
  Database, Cpu,
};

function NavIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <span style={{ width: size, height: size, display: 'inline-block' }} />;
  return <Icon size={size} />;
}

// =============================================================

interface SidebarProps {
  /** Main navigation items — pre-filtered by role from lib/nav-config */
  navItems: NavItem[];
  /** Items pinned to the bottom (e.g. Settings) */
  bottomItems?: NavItem[];
  /** Collapsed state controlled by parent */
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  /** Git commit hash or version string */
  version?: string;
}

export default function Sidebar({
  navItems,
  bottomItems = [],
  collapsed = false,
  onCollapse,
  mobileOpen = false,
  onMobileClose,
  version,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.id}
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`nav-link${isActive(item.href) ? ' nav-link--active' : ''}`}
      onClick={onMobileClose}
    >
      <span className="nav-link__icon">
        <NavIcon name={item.icon} />
      </span>
      {!collapsed && (
        <span className="nav-link__label">
          {item.label}
          {item.badge && (
            <span className="nav-link__badge">{item.badge}</span>
          )}
        </span>
      )}
    </Link>
  );

  return (
    <aside id="app-sidebar" className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__mark">iz</div>
        {!collapsed && <span className="sidebar-logo__name">izhubs ERP</span>}
      </div>

      {/* Main Nav — rendered from navItems prop */}
      <nav style={{ padding: 'var(--space-3)', flex: 1 }}>
        {navItems.map(renderNavItem)}
      </nav>

      {/* Bottom: Dynamic bottom items + Collapse toggle */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {bottomItems.map(renderNavItem)}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          marginTop: 'var(--space-2)',
        }}>
          <button
            onClick={() => onCollapse?.(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: 28, height: 28,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
              (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
              (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        
        {version && (
           <div style={{ 
             fontSize: '10px', 
             color: 'var(--color-text-muted)', 
             fontFamily: 'monospace', 
             textAlign: 'center', 
             marginTop: 'var(--space-4)',
             opacity: 0.7
           }}>
             {collapsed ? version : `v${version}`}
           </div>
        )}
      </div>
    </aside>
  );
}
