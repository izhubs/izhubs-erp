'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { INDUSTRY_IDS, ROLE_IDS, INDUSTRIES, ROLES } from '@/core/types/demo';
import type { IndustryId, RoleId } from '@/core/types/demo';

// INDUSTRIES and ROLES are imported from core/types/demo.ts
// Convert to arrays for iteration
const INDUSTRY_LIST = INDUSTRY_IDS.map(id => INDUSTRIES[id]);
const ROLE_LIST = ROLE_IDS.map(id => ROLES[id]);

export default function DemoPage() {
  const router = useRouter();
  const [step, setStep] = useState<'industry' | 'role' | 'loading'>('industry');
  const [industry, setIndustry] = useState<IndustryId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRoleSelect(role: RoleId) {
    if (!industry) return;
    setStep('loading');
    setError(null);

    try {
      const res = await fetch('/api/v1/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, role }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Demo login failed');
      }

      // Cookie is set server-side. Redirect to dashboard.
      router.push('/');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
      setStep('role');
    }
  }

  return (
    <div className="demo-wizard">
      {/* Brand */}
      <div className="demo-brand">
        <div className="demo-brand__mark">iz</div>
        izhubs
      </div>

      {/* Step 1: Industry */}
      {step === 'industry' && (
        <div className="demo-step">
          <p className="demo-step__eyebrow">Interactive Demo</p>
          <h1 className="demo-step__title">What type of business are you running?</h1>
          <p className="demo-step__subtitle">
            Choose your industry to see a dashboard pre-loaded with relevant sample data.
          </p>
          <div className="demo-cards demo-cards--industry">
            {INDUSTRY_LIST.map((ind) => (
              <button
                key={ind.id}
                className="demo-card"
                onClick={() => { setIndustry(ind.id); setStep('role'); }}
              >
                <span className="demo-card__icon">{ind.icon}</span>
                <span className="demo-card__title">{ind.label}</span>
                <span className="demo-card__desc">{ind.description}</span>
              </button>
            ))}
          </div>
          <p className="demo-login-cta">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      )}

      {/* Step 2: Role */}
      {step === 'role' && (
        <div className="demo-step">
          <p className="demo-step__eyebrow">
            {industry && INDUSTRIES[industry].icon}{' '}
            {industry && INDUSTRIES[industry].label}
          </p>
          <h1 className="demo-step__title">Which perspective do you want to see?</h1>
          <p className="demo-step__subtitle">
            Each role shows a different view of the same data. No signup needed.
          </p>
          {error && (
            <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
              ⚠️ {error}
            </div>
          )}
          <div className="demo-cards demo-cards--role">
            {ROLE_LIST.map((r) => (
              <button
                key={r.id}
                className="demo-card"
                onClick={() => handleRoleSelect(r.id)}
              >
                <span className="demo-card__icon">{r.icon}</span>
                <span className="demo-card__title">{r.label}</span>
                <span className="demo-card__desc">{r.description}</span>
              </button>
            ))}
          </div>
          <button className="demo-back" onClick={() => setStep('industry')}>
            ← Back to industry selection
          </button>
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 'loading' && (
        <div className="demo-step">
          <div className="demo-loading">
            <div className="demo-loading__spinner" />
            <p className="demo-loading__text">
              Preparing your personalized demo…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
