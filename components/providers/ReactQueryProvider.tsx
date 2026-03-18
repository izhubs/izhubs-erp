'use client';

// =============================================================
// izhubs ERP — ReactQueryProvider
// Wraps the app with TanStack Query (ReactQueryDevtools in dev).
// Import into app/layout.tsx (or app/(dashboard)/layout.tsx).
// Usage: <ReactQueryProvider>{children}</ReactQueryProvider>
// =============================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function ReactQueryProvider({ children }: Props) {
  // One QueryClient per component tree (not module-level) to avoid
  // sharing state between different users/requests in SSR context.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 60 seconds — reduces redundant fetches
            staleTime: 60 * 1000,
            // Keep unused cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests twice (network blips)
            retry: 2,
            // Don't refetch on window focus in production — can cause UX flicker
            refetchOnWindowFocus: process.env.NODE_ENV === 'development',
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
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
