'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '16px',
      padding: '32px',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: 40 }}>⚠️</span>
      <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem' }}>
        Something went wrong loading the dashboard
      </h2>
      <pre style={{
        background: 'var(--color-bg-elevated, #f3f4f6)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '12px',
        textAlign: 'left',
        maxWidth: '600px',
        overflow: 'auto',
        color: 'var(--color-danger, #ef4444)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {error.message}
        {error.digest && `\n\nDigest: ${error.digest}`}
      </pre>
      <button
        onClick={reset}
        style={{
          padding: '8px 20px',
          background: 'var(--color-primary, #6366f1)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        Try again
      </button>
    </div>
  );
}
