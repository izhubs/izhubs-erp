'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, LogOut, User, ChevronDown, Globe, HelpCircle, History } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useTour } from '@/components/onboarding/TourContext';
import { GlobalHistorySlideOver } from '@/components/shared/GlobalHistorySlideOver';
import { ViewAsRoleSelector } from '@/components/ui/ViewAsRoleSelector';
import {
  IzDropdownMenu,
  IzDropdownMenuTrigger,
  IzDropdownMenuContent,
  IzDropdownMenuItem,
  IzDropdownMenuLabel,
  IzDropdownMenuSeparator,
} from '@/components/ui/IzDropdownMenu';
import { IzButton } from '@/components/ui/IzButton';

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
  const [historyOpen, setHistoryOpen] = useState(false);

  const { locale, setLocale, t } = useLanguage();
  const { startTour } = useTour();

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

  const handleLogout = async () => {
    localStorage.removeItem('hz_access');
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
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

        {/* View As Role Selector for SuperAdmins */}
        <ViewAsRoleSelector />

        {/* Language Toggle */}
        <IzButton
          id="lang-toggle-btn"
          onClick={toggleLocale}
          variant="ghost"
          size="sm"
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
        </IzButton>

        {/* Help/Tour Button */}
        <IzButton
          className="btn-help-tour"
          onClick={() => startTour(true)}
          variant="ghost"
          size="icon"
          title="Show Guide for this screen"
        >
          <HelpCircle size={16} />
        </IzButton>

        {/* Global History Button */}
        <IzButton
          className="btn-global-history"
          onClick={() => setHistoryOpen(true)}
          variant="ghost"
          size="icon"
          title="System Activity History"
        >
          <History size={16} />
        </IzButton>

        {/* Theme Switcher */}
        <IzDropdownMenu open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
          <IzDropdownMenuTrigger asChild>
            <IzButton
              id="theme-switcher-btn"
              variant="ghost"
              size="icon"
              title="Switch theme"
            >
              <Palette size={16} />
            </IzButton>
          </IzDropdownMenuTrigger>

          <IzDropdownMenuContent align="end" style={{ width: '200px' }}>
            <IzDropdownMenuLabel>{t('settings.theme', 'Theme')}</IzDropdownMenuLabel>
            {THEMES.map((t_item) => (
              <IzDropdownMenuItem
                key={t_item.id}
                onClick={() => handleThemeSelect(t_item.id)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <span
                  className="theme-swatch"
                  style={{
                    width: 14, height: 14, borderRadius: '50%', marginRight: 8,
                    background: t_item.color,
                    border: t_item.isLight ? '1px solid var(--color-border)' : 'none',
                  }}
                />
                <span style={{ flex: 1 }}>{t_item.label}</span>
                {currentTheme === t_item.id && (
                  <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>✓</span>
                )}
              </IzDropdownMenuItem>
            ))}
          </IzDropdownMenuContent>
        </IzDropdownMenu>

        {/* User Menu */}
        <IzDropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <IzDropdownMenuTrigger asChild>
            <button
              id="user-menu-btn"
              className="user-menu-trigger"
            >
              <div className="user-avatar">U</div>
              <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </IzDropdownMenuTrigger>

          <IzDropdownMenuContent align="end" style={{ width: '220px' }}>
            <IzDropdownMenuLabel>{locale === 'en' ? 'Signed in' : 'Đang đăng nhập'}</IzDropdownMenuLabel>
            <IzDropdownMenuSeparator />

            <IzDropdownMenuItem asChild>
              <a href="/settings" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <User size={14} style={{ marginRight: 8 }} />
                {locale === 'en' ? 'Profile & Settings' : 'Hồ sơ & Cài đặt'}
              </a>
            </IzDropdownMenuItem>

            <IzDropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={14} style={{ marginRight: 8 }} />
              {locale === 'en' ? 'Log out' : 'Đăng xuất'}
            </IzDropdownMenuItem>
          </IzDropdownMenuContent>
        </IzDropdownMenu>

      </div>
      
      {/* Global History SlideOver Panel */}
      <GlobalHistorySlideOver open={historyOpen} onOpenChange={setHistoryOpen} />
    </header>
  );
}
