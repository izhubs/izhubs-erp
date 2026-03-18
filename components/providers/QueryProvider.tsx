'use client';

// =============================================================
// QueryProvider — wraps the entire client-side app with
// TanStack Query's QueryClientProvider.
// Place this inside AppLayout (or layout.tsx).
// =============================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function QueryProvider({ children }: Props) {
  // Create one QueryClient per browser session (not module-level,
  // so different tabs/users get isolated caches).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 60s — reduces unnecessary refetches
            staleTime: 60 * 1000,
            // Keep deleted cache entries for 5 minutes for instant back-navigation
            gcTime: 5 * 60 * 1000,
            // Retry once on network error, then give up
            retry: 1,
            // Don't refetch just because user switches tabs
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Dev tools — tree-shaken in production builds */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
