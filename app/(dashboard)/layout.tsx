// Dashboard layout — sidebar + header shell
// TODO: implement sidebar nav, mobile hamburger, user menu
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <nav style={{ padding: 'var(--space-4)' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            [Sidebar — TODO]
          </p>
        </nav>
      </aside>
      <header className="header">
        <span style={{ fontWeight: 600 }}>izhubs ERP</span>
      </header>
      <main className="main-content">
        <div className="page">{children}</div>
      </main>
    </div>
  );
}
