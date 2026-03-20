'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { IzForm } from '@/components/ui/IzForm';
import { IzFormInput } from '@/components/ui/IzFormInput';
import { IzAsyncButton } from '@/components/ui/IzAsyncButton';
import { IzCard, IzCardHeader, IzCardTitle, IzCardDescription, IzCardContent, IzCardFooter } from '@/components/ui/IzCard';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Email is invalid or missing'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterData) => {
    setError('');

    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    
    if (!res.ok) {
      throw new Error(json.error || 'Failed to register');
    }

    // Automatically redirect to onboarding flow for new users
    window.location.href = '/onboarding';
  };

  const handleAsyncError = (err: unknown) => {
    setError(err instanceof Error ? err.message : 'An unexpected error occurred');
  };

  return (
    <IzCard style={{ width: '100%', maxWidth: 400 }}>
      <IzCardHeader style={{ paddingBottom: 'var(--space-2)' }}>
        <IzCardTitle style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Register</IzCardTitle>
        <IzCardDescription>Create a new workspace member account</IzCardDescription>
      </IzCardHeader>

      <IzCardContent>
        {error && (
          <div style={{ padding: 'var(--space-3)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            {error}
          </div>
        )}

        <IzForm form={form} onSubmit={onSubmit} className="flex flex-col gap-4">
          <IzFormInput
            name="name"
            label="Name"
            type="text"
            placeholder="John Doe"
            required
          />
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
            Register
          </IzAsyncButton>
        </IzForm>
      </IzCardContent>

      <IzCardFooter style={{ justifyContent: 'center', paddingTop: 0 }}>
        <div style={{ fontSize: 'var(--font-size-sm)' }}>
          <Link href="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Already have an account? Sign in
          </Link>
        </div>
      </IzCardFooter>
    </IzCard>
  );
}
