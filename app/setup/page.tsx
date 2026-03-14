// Setup wizard — first-run onboarding
// Steps: 1. Create admin → 2. Choose template → 3. Import data (optional) → 4. Done
export default function SetupPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 560 }}>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>Welcome to izhubs ERP</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
          Let's set up your workspace in a few steps.
        </p>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {['Admin Account', 'Choose Template', 'Import Data', 'Done'].map((step, i) => (
            <div key={step} style={{
              flex: 1, padding: 'var(--space-2)', textAlign: 'center',
              background: i === 0 ? 'var(--color-primary)' : 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)',
              color: i === 0 ? '#fff' : 'var(--color-text-muted)',
            }}>
              {step}
            </div>
          ))}
        </div>

        {/* Step 1: Admin account */}
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>Full Name</label>
            <input className="input" type="text" placeholder="Your name" id="admin-name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>Email</label>
            <input className="input" type="email" placeholder="admin@yourcompany.com" id="admin-email" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>Password</label>
            <input className="input" type="password" placeholder="Min. 8 characters" id="admin-password" />
          </div>
          <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center' }}>
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}
