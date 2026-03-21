// =============================================================
// izhubs ERP — useCurrency hook
// Reactive currency formatter. Components that use this hook
// will re-render automatically when the user changes their
// currency preference in Settings → Appearance.
//
// Usage:
//   const { fmt } = useCurrency();
//   <span>{fmt(deal.value)}</span>
// =============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserCurrency, formatMoney, type Currency } from '@/lib/userTime';

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('VND');

  useEffect(() => {
    setCurrency(getUserCurrency());

    const handler = () => setCurrency(getUserCurrency());
    window.addEventListener('hz_currency_changed', handler);
    return () => window.removeEventListener('hz_currency_changed', handler);
  }, []);

  const fmt = useCallback(
    (amount: number | string | null | undefined) => formatMoney(amount, currency),
    [currency],
  );

  return { currency, fmt };
}
