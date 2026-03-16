import { redirect } from 'next/navigation';

/**
 * /dashboard → redirect to / (root dashboard page)
 * The actual dashboard is at app/(dashboard)/page.tsx which renders at /.
 * This redirect makes sidebar links (/dashboard) and middleware redirects work.
 */
export default function DashboardRedirect() {
  redirect('/');
}
