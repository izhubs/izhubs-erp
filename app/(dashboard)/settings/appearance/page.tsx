'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { IzButton } from '@/components/ui/IzButton';

const THEMES = [
  { id: 'default', label: 'Bản gốc (Theo Template)',  color: '#6366f1', isLight: false },
  { id: 'emerald', label: 'Emerald Dark', color: '#10b981', isLight: false },
  { id: 'rose',    label: 'Rose Dark',    color: '#f43f5e', isLight: false },
  { id: 'amber',   label: 'Amber Dark',   color: '#f59e0b', isLight: false },
  { id: 'light',   label: 'Light Mode',   color: '#6366f1', isLight: true },
  { id: 'compact', label: 'Compact Layout (Vuông Vức)', color: '#312e81', isLight: false },
];

const LOCALES = [
  { id: 'en', flag: '🇺🇸', label: 'English',     sub: 'English' },
  { id: 'vi', flag: '🇻🇳', label: 'Tiếng Việt',  sub: 'Vietnamese' },
];

function applyTheme(themeId: string) {
  if (themeId === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeId);
  }
  localStorage.setItem('hz_theme', themeId);
  window.dispatchEvent(new Event('hz_theme_changed'));
}

export default function AppearancePage() {
  const { locale, setLocale, t } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState('default');
  const [templates, setTemplates] = useState<any[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hz_theme') || 'default';
    setCurrentTheme(saved);
  }, []);

  useEffect(() => {
    // Fetch available templates
    fetch('/api/v1/tenants/industry')
      .then(res => res.json())
      .then(data => {
        if (data.templates) setTemplates(data.templates);
      })
      .catch(console.error);
      
    // Ideally we should know the current tenant's template, but for now we rely on DB update visually.
    // If the user hasn't switched, it defaults to what's in DB.
  }, []);

  const handleTheme = (themeId: string) => {
    applyTheme(themeId);
    setCurrentTheme(themeId);
  };

  const handleTemplateSelect = async (templateId: string) => {
    setIsSaving(true);
    setCurrentTemplateId(templateId);
    try {
      const res = await fetch('/api/v1/tenants/industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: templateId })
      });
      if (res.ok) {
        // Reload to apply new nav-config and themeDefaults variables from layout.tsx
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const isVi = locale === 'vi';

  return (
    <div>
      <div className="page-header">
        <h1>{isVi ? 'Giao diện & Ngôn ngữ' : 'Appearance & Language'}</h1>
      </div>

      {/* ── Industry Template ── */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <h3 style={{ marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isVi ? 'Mô hình kinh doanh (Industry Template)' : 'Industry Template'}
          {isSaving && <span style={{ fontSize: 12, fontWeight: 'normal', color: 'var(--color-text-muted)' }}>(Saving & Applying...)</span>}
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          {isVi 
            ? 'Thay đổi template kinh doanh. Thao tác này sẽ áp dụng ngay Sidebar, Pipeline, báo cáo và màu sắc đặc trưng của ngành đó.'
            : 'Change your business template. This instantly applies the industry-specific Sidebar, Pipeline, dashboard, and theme colors.'}
        </p>
        
        {templates.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading templates...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {templates.map(tpl => {
              // Parse primary color from theme_defaults if available to use as the swatch color
              let color = '#94a3b8';
              if (tpl.theme_defaults && typeof tpl.theme_defaults === 'object') {
                color = tpl.theme_defaults['--color-primary'] || color;
              }
              const isSelected = currentTemplateId === tpl.id; // Just for visual click feedback during reload
              
              return (
                <IzButton
                  key={tpl.id}
                  variant="ghost"
                  onClick={() => handleTemplateSelect(tpl.id)}
                  disabled={isSaving}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 'var(--space-2)', padding: 'var(--space-3)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'var(--color-primary-muted)' : 'var(--color-bg-elevated)',
                    textAlign: 'left',
                    opacity: isSaving && !isSelected ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (isSaving) return;
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    if (isSaving) return;
                    (e.currentTarget as HTMLElement).style.borderColor = isSelected ? 'var(--color-primary)' : 'var(--color-border)';
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-md)',
                      background: `${color}22`, color: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                    }}>
                      {tpl.icon}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                      {tpl.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {tpl.description}
                  </div>
                </IzButton>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Theme ── */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>

        <h3 style={{ marginBottom: 'var(--space-1)' }}>
          {isVi ? 'Màu sắc giao diện' : 'Theme'}
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          {isVi ? 'Chọn bộ màu cho toàn bộ giao diện.' : 'Choose the color scheme for the interface.'}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {THEMES.map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <IzButton
                key={theme.id}
                variant="ghost"
                onClick={() => handleTheme(theme.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  background: isActive ? 'var(--color-primary-muted)' : 'transparent',
                  position: 'relative',
                }}
              >
                {/* Preview swatch */}
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-md)',
                  background: theme.isLight ? '#f8fafc' : '#0f172a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: theme.isLight ? '1px solid var(--color-border)' : 'none',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: theme.color,
                    boxShadow: `0 0 0 4px ${theme.color}33`,
                  }} />
                </div>
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                }}>
                  {theme.label}
                </span>
                {isActive && (
                  <span style={{
                    position: 'absolute', top: 4, right: 6,
                    color: 'var(--color-primary)', fontSize: 12, fontWeight: 700,
                  }}>✓</span>
                )}
              </IzButton>
            );
          })}
        </div>
      </div>

      {/* ── Language ── */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-1)' }}>
          {t('settings.language', 'Language')}
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          {isVi ? 'Chọn ngôn ngữ hiển thị cho giao diện.' : 'Choose the display language for the interface.'}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {LOCALES.map((lang) => {
            const isActive = locale === lang.id;
            return (
              <IzButton
                key={lang.id}
                variant="ghost"
                onClick={() => setLocale(lang.id as 'en' | 'vi')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-5)',
                  border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  background: isActive ? 'var(--color-primary-muted)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: isActive ? 600 : 400,
                  minWidth: 170,
                }}
              >
                <span style={{ fontSize: 28 }}>{lang.flag}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{lang.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{lang.sub}</div>
                </div>
                {isActive && (
                  <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontSize: 16 }}>✓</span>
                )}
              </IzButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}
