import { redirect } from 'next/navigation';

/**
 * Root route (/) → always redirect to /dashboard
 * The canonical dashboard URL is /dashboard (what the sidebar and middleware use).
 * Keeping this redirect avoids a blank page if anyone navigates to /.
 */
export default function RootRedirect() {
  redirect('/dashboard');
}
