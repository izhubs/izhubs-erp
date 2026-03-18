'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

const THEMES = [
  { id: 'default', label: 'Indigo Dark',  color: '#6366f1', isLight: false },
  { id: 'emerald', label: 'Emerald Dark', color: '#10b981', isLight: false },
  { id: 'rose',    label: 'Rose Dark',    color: '#f43f5e', isLight: false },
  { id: 'amber',   label: 'Amber Dark',   color: '#f59e0b', isLight: false },
  { id: 'light',   label: 'Light Mode',   color: '#6366f1', isLight: true },
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
}

export default function AppearancePage() {
  const { locale, setLocale, t } = useLanguage();
  // useState so active state re-renders when changed
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    const saved = localStorage.getItem('hz_theme') || 'default';
    setCurrentTheme(saved);
  }, []);

  const handleTheme = (themeId: string) => {
    applyTheme(themeId);
    setCurrentTheme(themeId);
  };

  const isVi = locale === 'vi';

  return (
    <div>
      <div className="page-header">
        <h1>{isVi ? 'Giao diện & Ngôn ngữ' : 'Appearance & Language'}</h1>
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
              <button
                key={theme.id}
                onClick={() => handleTheme(theme.id)}
                className="btn btn-ghost"
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
              </button>
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
              <button
                key={lang.id}
                onClick={() => setLocale(lang.id as 'en' | 'vi')}
                className="btn btn-ghost"
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
