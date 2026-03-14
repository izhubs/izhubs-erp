'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams?.get('redirect') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to login');
      }

      // We have access token, and refresh is in HTTP Only Cookie.
      // E.g. save access token to Zustand store. We'll store temporarily in memory or local storage.
      if (typeof window !== 'undefined') {
        localStorage.setItem('hz_access', json.data.accessToken);
      }
      
      router.push(redirectParams);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ width: '100%', maxWidth: 400 }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>izhubs ERP</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>Sign in to your workspace</p>

      {error && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>Email</label>
          <input 
            className="input" 
            type="email" 
            placeholder="you@company.com" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>Password</label>
          <input 
            className="input" 
            type="password" 
            placeholder="••••••••" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
        <a href="/register" className="text-muted" style={{ textDecoration: 'none' }}>Create an account</a>
        <a href="/setup" className="text-muted" style={{ textDecoration: 'none' }}>First time? Set up workspace →</a>
      </div>
    </div>
  );
}
