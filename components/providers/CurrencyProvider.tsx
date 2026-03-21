'use client';
import { createContext, useEffect, useState } from 'react';
import { type Currency, getUserCurrency } from '@/lib/userTime';

type CurrencyContextType = {
  currency: Currency;
};

export const CurrencyContext = createContext<CurrencyContextType>({ currency: 'VND' });

export default function CurrencyProvider({ children, initialCurrency }: { children: React.ReactNode, initialCurrency: Currency }) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency);

  useEffect(() => {
    const handleSync = () => setCurrency(getUserCurrency());
    window.addEventListener('hz_currency_changed', handleSync);
    window.addEventListener('storage', handleSync);
    // Final sync on mount to ensure localStorage exact match if user deleted cookies
    handleSync();

    return () => {
      window.removeEventListener('hz_currency_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency }}>
      {children}
    </CurrencyContext.Provider>
  );
}
