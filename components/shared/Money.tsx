'use client';

import { useCurrency } from '@/lib/hooks/useCurrency';
import React from 'react';

export function Money({ value, compact }: { value: number | string | null | undefined, compact?: boolean }) {
  const { fmt, fmtCompact } = useCurrency();
  return <>{compact ? fmtCompact(value) : fmt(value)}</>;
}
