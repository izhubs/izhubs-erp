'use client';

import Link from 'next/link';
import { Palette, Sliders, Puzzle, Link2, Shield, Zap, ChevronRight } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    href: '/settings/users',
    icon: Shield,
    title: 'User Management',
    desc: 'Manage workspace members and roles',
    badge: null,
  },
  {
    href: '/settings/appearance',
    icon: Palette,
    title: 'Appearance',
    desc: 'Theme colors and display language',
    badge: null,
  },
  {
    href: '/settings/automation',
    icon: Zap,
    title: 'Automation Rules',
    desc: 'Configure auto-task triggers (renewal, follow-up…)',
    badge: null,
  },
  {
    href: '/settings/pipeline-stages',
    icon: Sliders,
    title: 'Pipeline Stages',
    desc: 'Customize your sales funnel stages',
    badge: null,
  },
  {
    href: '/settings/custom-fields',
    icon: Puzzle,
    title: 'Custom Fields',
    desc: 'Add extra fields to contacts and deals',
    badge: null,
  },
  {
    href: '/settings/integrations',
    icon: Link2,
    title: 'Integrations',
    desc: 'Connect third-party services',
    badge: 'soon',
  },
  {
    href: '/settings/gdpr',
    icon: Shield,
    title: 'Data & Privacy',
    desc: 'GDPR erasure and data export',
    badge: null,
  },
];

export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 640 }}>
        {SETTINGS_SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-4) var(--space-5)',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
              (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-card)';
            }}
          >
            {/* Icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <s.icon size={18} style={{ color: 'var(--color-primary)' }} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                  {s.title}
                </span>
                {s.badge === 'soon' && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 6px',
                    background: 'var(--color-bg-elevated, var(--color-bg-hover))',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    soon
                  </span>
                )}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {s.desc}
              </div>
            </div>

            <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
