'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, LogOut, User, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

const THEMES = [
  { id: 'default', label: 'Indigo Dark', color: '#6366f1' },
  { id: 'emerald', label: 'Emerald Dark', color: '#10b981' },
  { id: 'rose',    label: 'Rose Dark',   color: '#f43f5e' },
  { id: 'amber',   label: 'Amber Dark',  color: '#f59e0b' },
  { id: 'light',   label: 'Light Mode',  color: '#6366f1', isLight: true },
];

function applyTheme(themeId: string) {
  if (themeId === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeId);
  }
  localStorage.setItem('hz_theme', themeId);
}

export default function Header({ mobileMenuButton, onSearchClick }: { mobileMenuButton?: React.ReactNode; onSearchClick?: () => void }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');

  const { locale, setLocale, t } = useLanguage();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hz_theme') || 'default';
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleThemeSelect = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setThemeMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('hz_access');
    document.cookie = 'hz_refresh=; Max-Age=0; path=/; SameSite=Lax';
    document.cookie = 'hz_access=; Max-Age=0; path=/; SameSite=Lax';
    window.location.replace('/login');
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'vi' : 'en');
  };

  return (
    <header className="header">
      {/* Hamburger — only visible on mobile via CSS */}
      {mobileMenuButton}

      {/* Search bar affordance — clicks open Command Palette */}
      <button
        id="global-search-btn"
        className="header-search-btn"
        onClick={onSearchClick}
        title="Search (Ctrl+K)"
        aria-label="Open command palette"
      >
        <span style={{ opacity: 0.5, fontSize: 15, lineHeight: 1 }}>⌕</span>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', flex: 1, textAlign: 'left' }}>
          {t('common.search')}…
        </span>
        <kbd style={{ fontSize: 10, background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace', color: 'var(--color-text-muted)', flexShrink: 0 }}>⌘K</kbd>
      </button>

      <div className="header-controls">

        {/* Language Toggle */}
        <button
          id="lang-toggle-btn"
          onClick={toggleLocale}
          className="btn btn-ghost"
          title={locale === 'en' ? 'Switch to Tiếng Việt' : 'Switch to English'}
          aria-label="Toggle language"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontWeight: 600, fontSize: 'var(--font-size-xs)', letterSpacing: '0.05em' }}
        >
          <Globe size={14} style={{ opacity: 0.7 }} />
          <span style={{
            background: 'var(--color-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-sm, 4px)',
            padding: '1px 5px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}>
            {locale.toUpperCase()}
          </span>
        </button>

        {/* Theme Switcher */}
        <div ref={themeMenuRef} className="dropdown">
          <button
            id="theme-switcher-btn"
            onClick={() => { setThemeMenuOpen(!themeMenuOpen); setUserMenuOpen(false); }}
            className="btn btn-ghost"
            title="Switch theme"
          >
            <Palette size={16} />
          </button>

          {themeMenuOpen && (
            <div className="dropdown-panel">
              <p className="dropdown-panel__label">{t('settings.theme', 'Theme')}</p>
              {THEMES.map((t_item) => (
                <button
                  key={t_item.id}
                  onClick={() => handleThemeSelect(t_item.id)}
                  className={`dropdown-item${currentTheme === t_item.id ? ' dropdown-item--active' : ''}`}
                >
                  <span
                    className="theme-swatch"
                    style={{
                      background: t_item.color,
                      border: t_item.isLight ? '2px solid var(--color-border)' : 'none',
                    }}
                  />
                  {t_item.label}
                  {currentTheme === t_item.id && (
                    <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontSize: 10 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userMenuRef} className="dropdown">
          <button
            id="user-menu-btn"
            onClick={() => { setUserMenuOpen(!userMenuOpen); setThemeMenuOpen(false); }}
            className="user-menu-trigger"
          >
            <div className="user-avatar">U</div>
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {userMenuOpen && (
            <div className="dropdown-panel dropdown-panel--wide">
              <div className="dropdown-panel__label">{locale === 'en' ? 'Signed in' : 'Đang đăng nhập'}</div>
              <hr className="dropdown-panel__divider" />

              <a href="/settings" className="dropdown-item">
                <User size={14} />
                {locale === 'en' ? 'Profile & Settings' : 'Hồ sơ & Cài đặt'}
              </a>

              <button
                id="logout-btn"
                onClick={handleLogout}
                className="dropdown-item dropdown-item--danger"
              >
                <LogOut size={14} />
                {locale === 'en' ? 'Log out' : 'Đăng xuất'}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
