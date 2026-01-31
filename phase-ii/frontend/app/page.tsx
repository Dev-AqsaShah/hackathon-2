/**
 * Home page - redirects to login or dashboard based on auth status.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
