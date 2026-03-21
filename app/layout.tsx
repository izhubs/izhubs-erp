import '@/app/styles/globals.scss';
import type { Metadata, Viewport } from 'next';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import CurrencyProvider from '@/components/providers/CurrencyProvider';
import { IzToaster } from '@/components/ui/IzToaster';
import { cookies } from 'next/headers';
import type { Currency } from '@/lib/userTime';

export const metadata: Metadata = {
  title: { default: 'izhubs ERP', template: '%s | izhubs ERP' },
  description: 'AI-extensible business management that adapts to your business',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'izhubs ERP' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialCurrency = (cookieStore.get('hz_currency')?.value as Currency) || 'VND';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('hz_theme');
                if (theme && theme !== 'default') {
                  document.documentElement.setAttribute('data-theme', theme);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ReactQueryProvider>
          <CurrencyProvider initialCurrency={initialCurrency}>
            {children}
            <IzToaster />
          </CurrencyProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
