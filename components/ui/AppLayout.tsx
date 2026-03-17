'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import { Menu } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Demo emails follow the pattern demo_{industry}_{role}@izhubs.com
    // We check by decoding the JWT payload (no verification needed here — just UX)
    try {
      const token = document.cookie
        .split('; ')
        .find(r => r.startsWith('hz_access='))
        ?.split('=')[1];
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.email?.startsWith('demo_') && payload.email?.endsWith('@izhubs.com')) {
        setIsDemo(true);
      }
    } catch {
      // Not a valid JWT or cookie missing — silent fail
    }
  }, []);

  if (!isDemo) return null;

  return (
    <div style={{
      background: 'var(--color-primary)',
      color: '#fff',
      textAlign: 'center',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 500,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexShrink: 0,
    }}>
      <span>💡 This is a demo session. Data resets every hour.</span>
      <a
        href="/register"
        style={{
          color: '#fff',
          fontWeight: 700,
          textDecoration: 'underline',
          whiteSpace: 'nowrap',
        }}
      >
        Sign up to keep your data →
      </a>
    </div>
  );
}

export default function AppLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Demo session banner — only visible to demo users */}
      <DemoBanner />

      {/* Mobile overlay — tap to close sidebar drawer */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Header
        mobileMenuButton={
          <button
            className="btn btn-ghost mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            title="Menu"
          >
            <Menu size={20} />
          </button>
        }
      />

      <main className="main-content">
        <div className="page">{children}</div>
      </main>
    </div>
  );
}


