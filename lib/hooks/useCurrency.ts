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

import { useCallback, useContext } from 'react';
import { CurrencyContext } from '@/components/providers/CurrencyProvider';
import { type Currency, formatMoney } from '../userTime';

export function useCurrency() {
  const { currency } = useContext(CurrencyContext);

  const fmt = useCallback(
    (amount: number | string | null | undefined) => formatMoney(amount, currency),
    [currency],
  );

  const fmtCompact = useCallback(
    (amount: number | string | null | undefined) => formatMoney(amount, currency, { compact: true }),
    [currency],
  );

  return { currency, fmt, fmtCompact };
}
