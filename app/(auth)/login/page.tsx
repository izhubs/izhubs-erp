'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { IzForm } from '@/components/ui/IzForm';
import { IzFormInput } from '@/components/ui/IzFormInput';
import { IzAsyncButton } from '@/components/ui/IzAsyncButton';
import { IzCard, IzCardHeader, IzCardTitle, IzCardDescription, IzCardContent, IzCardFooter } from '@/components/ui/IzCard';

const loginSchema = z.object({
  email: z.string().email('Email is invalid or missing'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});
type LoginData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams?.get('redirect') || '/dashboard';
  
  const [error, setError] = useState('');

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginData) => {
    setError('');

    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (!res.ok) {
      throw new Error(json.error?.message || json.message || 'Login failed');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('hz_access', json.data.accessToken);
    }
    
    router.push(redirectParams);
    router.refresh();
  };

  const handleAsyncError = (err: unknown) => {
    setError(err instanceof Error ? err.message : 'An unexpected error occurred');
  };

  return (
    <IzCard style={{ width: '100%', maxWidth: 400 }}>
      <IzCardHeader style={{ paddingBottom: 'var(--space-2)' }}>
        <IzCardTitle style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>izhubs ERP</IzCardTitle>
        <IzCardDescription>Sign in to your workspace</IzCardDescription>
      </IzCardHeader>

      <IzCardContent>
        {error && (
          <div style={{ padding: 'var(--space-3)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            {error}
          </div>
        )}

        <IzForm form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
          <IzFormInput
            name="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            required
          />
          <IzFormInput
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            required
          />
          <IzAsyncButton 
            variant="default" 
            type="submit" 
            style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
            onError={handleAsyncError}
          >
            Sign in
          </IzAsyncButton>
        </IzForm>
      </IzCardContent>

      <IzCardFooter style={{ flexDirection: 'column', gap: 'var(--space-3)', paddingTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 'var(--font-size-sm)' }}>
          <Link href="/register" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Create an account</Link>
          <Link href="/setup" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>First time? Set up workspace →</Link>
        </div>
        <div style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', width: '100%' }}>
          <Link href="/demo" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            ✨ Try live demo — no signup needed
          </Link>
        </div>
      </IzCardFooter>
    </IzCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<IzCard style={{ width: '100%', maxWidth: 400 }}><IzCardContent>Loading...</IzCardContent></IzCard>}>
      <LoginForm />
    </Suspense>
  );
}
