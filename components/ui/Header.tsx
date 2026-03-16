'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, LogOut, User, ChevronDown } from 'lucide-react';

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

export default function Header({ mobileMenuButton }: { mobileMenuButton?: React.ReactNode }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');

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
    // Clear all auth tokens from localStorage
    localStorage.removeItem('hz_access');
    // Expire both cookies — refresh (httpOnly) and access (readable by JS)
    document.cookie = 'hz_refresh=; Max-Age=0; path=/; SameSite=Lax';
    document.cookie = 'hz_access=; Max-Age=0; path=/; SameSite=Lax';
    // Use replace() not href= so the dashboard page is removed from history.
    // Pressing the browser back button after logout will NOT return here.
    window.location.replace('/login');
  };

  return (
    <header className="header">
      {/* Hamburger — only visible on mobile via CSS */}
      {mobileMenuButton}
      <div className="header-controls">

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
              <p className="dropdown-panel__label">Theme</p>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeSelect(t.id)}
                  className={`dropdown-item${currentTheme === t.id ? ' dropdown-item--active' : ''}`}
                >
                  <span
                    className="theme-swatch"
                    style={{
                      background: t.color,
                      border: t.isLight ? '2px solid var(--color-border)' : 'none',
                    }}
                  />
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
              <div className="dropdown-panel__label">Signed in</div>
              <hr className="dropdown-panel__divider" />

              <a href="/settings" className="dropdown-item">
                <User size={14} />
                Profile &amp; Settings
              </a>

              <button
                id="logout-btn"
                onClick={handleLogout}
                className="dropdown-item dropdown-item--danger"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
