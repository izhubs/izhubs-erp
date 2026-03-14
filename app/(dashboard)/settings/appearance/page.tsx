// Theme picker — user can switch between preset themes
// Preference stored in DB: users.theme_preference
// Applied via data-theme attribute on <html>
export default function AppearancePage() {
  const themes = [
    { id: 'indigo', label: 'Indigo Dark', color: '#6366f1' },
    { id: 'emerald', label: 'Emerald',    color: '#10b981' },
    { id: 'rose',   label: 'Rose',        color: '#f43f5e' },
    { id: 'amber',  label: 'Amber',       color: '#f59e0b' },
    { id: 'light',  label: 'Light',       color: '#6366f1', light: true },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Appearance</h1>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Theme</h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {themes.map((t) => (
            <button key={t.id} className="btn btn-ghost" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'var(--space-2)', padding: 'var(--space-3)',
              border: '2px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: t.light ? '#f8fafc' : '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: t.color }} />
              </div>
              <span style={{ fontSize: 'var(--font-size-xs)' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
