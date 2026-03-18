'use client';

import Link from 'next/link';
import { Palette, Sliders, Puzzle, Link2, Shield, Zap, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

const SETTINGS_SECTIONS = [
  {
    href: '/settings/appearance',
    icon: Palette,
    titleEn: 'Appearance',
    titleVi: 'Giao diện & Ngôn ngữ',
    descEn: 'Theme colors and display language',
    descVi: 'Màu sắc giao diện và ngôn ngữ hiển thị',
    badge: null,
  },
  {
    href: '/settings/automation',
    icon: Zap,
    titleEn: 'Automation Rules',
    titleVi: 'Automation Rules',
    descEn: 'Configure auto-task triggers (renewal, follow-up…)',
    descVi: 'Cấu hình rule tự động tạo task (gia hạn, follow-up…)',
    badge: null,
  },
  {
    href: '/settings/pipeline-stages',
    icon: Sliders,
    titleEn: 'Pipeline Stages',
    titleVi: 'Giai đoạn Pipeline',
    descEn: 'Customize your sales funnel stages',
    descVi: 'Tuỳ chỉnh các giai đoạn bán hàng',
    badge: null,
  },
  {
    href: '/settings/custom-fields',
    icon: Puzzle,
    titleEn: 'Custom Fields',
    titleVi: 'Trường tuỳ chỉnh',
    descEn: 'Add extra fields to contacts and deals',
    descVi: 'Thêm trường dữ liệu cho liên hệ và cơ hội',
    badge: null,
  },
  {
    href: '/settings/integrations',
    icon: Link2,
    titleEn: 'Integrations',
    titleVi: 'Tích hợp',
    descEn: 'Connect third-party services',
    descVi: 'Kết nối dịch vụ bên thứ ba',
    badge: 'soon',
  },
  {
    href: '/settings/gdpr',
    icon: Shield,
    titleEn: 'Data & Privacy',
    titleVi: 'Dữ liệu & Quyền riêng tư',
    descEn: 'GDPR erasure and data export',
    descVi: 'Xoá dữ liệu GDPR và xuất dữ liệu',
    badge: null,
  },
];

export default function SettingsPage() {
  const { locale, t } = useLanguage();
  const isVi = locale === 'vi';

  return (
    <div>
      <div className="page-header">
        <h1>{t('nav.settings', 'Settings')}</h1>
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
                  {isVi ? s.titleVi : s.titleEn}
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
                {isVi ? s.descVi : s.descEn}
              </div>
            </div>

            <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
