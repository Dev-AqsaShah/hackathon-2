/**
 * Premium Dashboard Page
 *
 * Features:
 * - Dark theme with gradient background
 * - Glass morphism header
 * - Task statistics
 * - Premium task list
 * - Responsive design
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import * as jose from 'jose';
import { auth } from '@/lib/auth';
import { Task } from '@/types/task';
import { EnhancedDashboard } from '@/components/dashboard';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create a JWT token for backend authentication.
 */
async function createToken(userId: string, email?: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET || '');

  const token = await new jose.SignJWT({
    sub: userId,
    email: email || undefined,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  return token;
}

/**
 * Fetch tasks from the backend API.
 */
async function getTasks(userId: string, email?: string): Promise<Task[]> {
  try {
    const token = await createToken(userId, email);

    const response = await fetch(`${BACKEND_URL}/api/${userId}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch tasks:', response.status);
      return [];
    }

    const tasks: Task[] = await response.json();

    return tasks.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
}

export default async function DashboardPage() {
  let session;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error('Session check failed:', error);
    redirect('/login');
  }

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const email = session.user.email;
  const name = session.user.name || email?.split('@')[0] || 'User';

  const tasks = await getTasks(userId, email);

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-dark-700/50 bg-dark-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:inline">TaskFlow</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-lg bg-accent-600/20 text-accent-400 text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="px-3 py-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors text-sm"
              >
                AI Chat
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-dark-100">{name}</p>
                  <p className="text-xs text-dark-500">{email}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-medium text-sm">
                  {name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Logout */}
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
                  title="Sign out"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedDashboard
          userId={userId}
          userEmail={email || undefined}
          userName={name}
          initialTasks={tasks}
        />
      </main>
    </div>
  );
}
