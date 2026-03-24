'use client';

import { useState, useEffect } from 'react';
import { IzButton } from '@izerp-theme/components/ui/IzButton';
import {
  COMMON_TIMEZONES, CURRENCIES,
  getUserTimezone, setUserTimezone,
  getUserCurrency, setUserCurrency,
  getTimezoneOffset,
} from '@/lib/userTime';

// ---- Theme definitions ----
const THEMES = [
  { id: 'default', label: 'Default (Template)',  color: '#6366f1', isLight: false },
  { id: 'emerald', label: 'Emerald Dark',         color: '#10b981', isLight: false },
  { id: 'rose',    label: 'Rose Dark',            color: '#f43f5e', isLight: false },
  { id: 'amber',   label: 'Amber Dark',           color: '#f59e0b', isLight: false },
  { id: 'light',   label: 'Light Mode',           color: '#6366f1', isLight: true  },
  { id: 'compact', label: 'Compact Layout',       color: '#312e81', isLight: false },
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

// ---- Section header ----
function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{children}</h3>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function AppearancePage() {
  const [currentTheme, setCurrentTheme]       = useState('default');
  const [timezone, setTimezone]               = useState('Asia/Ho_Chi_Minh');
  const [currency, setCurrency]               = useState('VND');
  const [templates, setTemplates]             = useState<any[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState('');
  const [isSaving, setIsSaving]               = useState(false);
  const [nowStr, setNowStr]                   = useState('');

  // Hydrate from localStorage
  useEffect(() => {
    setCurrentTheme(localStorage.getItem('hz_theme') || 'default');
    setTimezone(getUserTimezone());
    setCurrency(getUserCurrency());
  }, []);

  // Live clock in user's timezone
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setNowStr(now.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: timezone,
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  // Load industry templates
  useEffect(() => {
    fetch('/api/v1/tenants/industry')
      .then(r => r.json())
      .then(d => { if (d.templates) setTemplates(d.templates); })
      .catch(console.error);
  }, []);

  const handleTheme = (id: string) => { applyTheme(id); setCurrentTheme(id); };

  const handleTimezone = (tz: string) => {
    setTimezone(tz);
    setUserTimezone(tz);
  };

  const handleCurrency = (cur: string) => {
    setCurrency(cur);
    setUserCurrency(cur);
  };

  const handleTemplateSelect = async (templateId: string) => {
    setIsSaving(true);
    setCurrentTemplateId(templateId);
    try {
      const res = await fetch('/api/v1/tenants/industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: templateId }),
      });
      if (res.ok) window.location.reload();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1>Appearance &amp; Regional</h1>
      </div>

      {/* ── Industry Template ── */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <SectionTitle sub="Instantly applies the Sidebar, Pipeline, and theme colors for your business type.">
          {isSaving ? 'Industry Template (Applying…)' : 'Industry Template'}
        </SectionTitle>
        {templates.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading templates…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 'var(--space-3)' }}>
            {templates.map(tpl => {
              let color = '#94a3b8';
              if (tpl.theme_defaults && typeof tpl.theme_defaults === 'object') {
                color = tpl.theme_defaults['--color-primary'] || color;
              }
              const isSelected = currentTemplateId === tpl.id;
              return (
                <IzButton
                  key={tpl.id}
                  variant="ghost"
                  onClick={() => handleTemplateSelect(tpl.id)}
                  disabled={isSaving}
                  style={{
                    height: 'auto',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 'var(--space-2)', padding: 'var(--space-3)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'var(--color-primary-muted)' : 'var(--color-bg-elevated)',
                    textAlign: 'left', opacity: isSaving && !isSelected ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-md)',
                      background: `${color}22`, color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>{tpl.icon}</div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{tpl.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{tpl.description}</div>
                </IzButton>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Theme + Timezone (side-by-side) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>

        {/* Theme */}
        <div className="card">
          <SectionTitle sub="Color scheme for the entire interface.">Theme</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            {THEMES.map(theme => {
              const isActive = currentTheme === theme.id;
              return (
                <IzButton
                  key={theme.id}
                  variant="ghost"
                  onClick={() => handleTheme(theme.id)}
                  style={{
                    height: 'auto',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: 'var(--space-2)',
                    border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--color-primary-muted)' : 'transparent',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: theme.isLight ? '#f8fafc' : '#0f172a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: theme.isLight ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: theme.color, boxShadow: `0 0 0 3px ${theme.color}33` }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-primary)' : 'var(--color-text)', textAlign: 'center', lineHeight: 1.2 }}>
                    {theme.label}
                  </span>
                  {isActive && <span style={{ position: 'absolute', top: 3, right: 5, color: 'var(--color-primary)', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </IzButton>
              );
            })}
          </div>
        </div>

        {/* Timezone */}
        <div className="card">
          <SectionTitle sub="All dates and times display in this timezone.">
            Timezone
          </SectionTitle>

          {/* Live clock badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              background: 'var(--color-primary-muted)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-sm)', fontWeight: 600,
              color: 'var(--color-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              🕐 {nowStr} &nbsp;·&nbsp; {getTimezoneOffset(timezone)}
            </span>
          </div>

          <select
            value={timezone}
            onChange={e => handleTimezone(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
            }}
          >
            {COMMON_TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Used by all date/time fields in contacts, deals, and activities.
          </p>
        </div>
      </div>

      {/* ── Currency ── */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <SectionTitle sub="Used when displaying prices, deal values, and revenue figures.">Currency</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {CURRENCIES.map(cur => {
            const isActive = currency === cur.value;
            return (
              <IzButton
                key={cur.value}
                variant="ghost"
                onClick={() => handleCurrency(cur.value)}
                style={{
                  height: 'auto',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: '8px 16px',
                  border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--color-primary-muted)' : 'transparent',
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                }}
              >
                <span style={{ fontSize: 18, minWidth: 22, textAlign: 'center' }}>{cur.symbol}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{cur.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{cur.label.split('—')[1]?.trim()}</div>
                </div>
                {isActive && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontSize: 13 }}>✓</span>}
              </IzButton>
            );
          })}
        </div>
      </div>

      {/* ── Language — Coming Soon ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>Language</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Display language for the interface</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginLeft: 'auto',
          }}>
            Coming Soon
          </span>
        </div>
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border)',
          color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
          textAlign: 'center',
        }}>
          🌐 &nbsp; Multi-language support is coming in a future release. The interface currently uses English.
        </div>
      </div>
    </div>
  );
}
