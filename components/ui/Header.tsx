'use client';

import { useState, useRef, useEffect } from 'react';
import { Sun, Monitor, Palette, LogOut, User, ChevronDown } from 'lucide-react';

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

export default function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Restore saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('hz_theme') || 'default';
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  // Close dropdowns when clicking outside
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
    document.cookie = 'hz_refresh=; Max-Age=0; path=/';
    window.location.href = '/login';
  };

  // Read display name from JWT stored in localStorage
  const getUserName = () => {
    try {
      const token = localStorage.getItem('hz_access');
      if (!token) return 'User';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email?.split('@')[0] || 'User';
    } catch {
      return 'User';
    }
  };

  return (
    <header className="header" style={{ justifyContent: 'flex-end' }}>
      {/* Theme Switcher */}
      <div ref={themeMenuRef} style={{ position: 'relative' }}>
        <button
          id="theme-switcher-btn"
          onClick={() => { setThemeMenuOpen(!themeMenuOpen); setUserMenuOpen(false); }}
          className="btn btn-ghost"
          style={{ gap: 'var(--space-2)', padding: 'var(--space-2)' }}
          title="Switch theme"
        >
          <Palette size={16} />
        </button>

        {themeMenuOpen && (
          <div
            className="dropdown-menu"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 'var(--space-2)',
              minWidth: 180,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--space-2)',
              zIndex: 'var(--z-dropdown)',
            }}
          >
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', padding: 'var(--space-2) var(--space-3)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Theme
            </p>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeSelect(t.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  background: currentTheme === t.id ? 'var(--color-bg-hover)' : 'transparent',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: t.color,
                  flexShrink: 0,
                  border: t.isLight ? '2px solid var(--color-border)' : 'none',
                }} />
                {t.label}
                {currentTheme === t.id && (
                  <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontSize: 10 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Menu */}
      <div ref={userMenuRef} style={{ position: 'relative' }}>
        <button
          id="user-menu-btn"
          onClick={() => { setUserMenuOpen(!userMenuOpen); setThemeMenuOpen(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Avatar initials */}
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}>
            U
          </div>
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>

        {userMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 'var(--space-2)',
              minWidth: 200,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--space-2)',
              zIndex: 'var(--z-dropdown)',
            }}
          >
            {/* User info */}
            <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-2)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Signed in</p>
            </div>

            <a
              href="/settings"
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontSize: 'var(--font-size-sm)',
                textDecoration: 'none',
              }}
              className="dropdown-item"
            >
              <User size={14} />
              Profile &amp; Settings
            </a>

            <button
              id="logout-btn"
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: 'var(--color-danger)',
                fontSize: 'var(--font-size-sm)',
                textAlign: 'left',
                marginTop: 'var(--space-1)',
              }}
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
