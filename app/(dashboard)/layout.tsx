import AppLayout from '@/components/ui/AppLayout';

/**
 * Apply no-store cache headers to ALL dashboard pages.
 * This prevents the browser from serving stale authenticated
 * pages after logout when the user presses the back button.
 * The middleware will always re-validate auth before rendering.
 */
export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

