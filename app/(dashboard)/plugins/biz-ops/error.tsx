'use client';
import { useEffect } from 'react';
import { IzButton } from '@izerp-theme/components/ui/IzButton';

export default function BizOpsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[BizOps Route Error]', error);
  }, [error]);

  return (
    <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-bg-surface)', borderRadius: '12px', marginTop: '2rem', border: '1px solid var(--color-border)' }}>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}>⚠️ Đã xảy ra lỗi kỹ thuật</h2>
      <p style={{ color: 'var(--color-status-error)', fontSize: '0.875rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
        {error.message || 'Lỗi không xác định'}
      </p>
      <IzButton onClick={() => reset()} variant="outline">
        Thử lại
      </IzButton>
    </div>
  );
}
