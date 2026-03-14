export default function LoginPage() {
  return (
    <div className="card" style={{ width: '100%', maxWidth: 400 }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>izhubs ERP</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>Sign in to your workspace</p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>Email</label>
          <input className="input" type="email" placeholder="you@company.com" id="email" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>Password</label>
          <input className="input" type="password" placeholder="••••••••" id="password" />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
          Sign in
        </button>
      </form>

      <p style={{ marginTop: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
        <a href="/setup">First time? Set up your workspace →</a>
      </p>
    </div>
  );
}
