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
import { TaskList } from '@/components/TaskList';
import { Task } from '@/types/task';
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
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const email = session.user.email;
  const name = session.user.name || email?.split('@')[0] || 'User';

  const tasks = await getTasks(userId, email);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-100">My Tasks</h1>
            <p className="mt-1 text-dark-400">Manage your tasks and stay organized</p>
          </div>
          <Link
            href="/tasks/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                       bg-gradient-to-r from-accent-600 to-accent-500 text-white font-medium
                       shadow-lg shadow-accent-500/25
                       hover:from-accent-500 hover:to-accent-400 hover:shadow-accent-500/40
                       transition-all duration-200 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">Total Tasks</p>
                <p className="mt-1 text-2xl font-bold text-dark-100">{totalTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">Completed</p>
                <p className="mt-1 text-2xl font-bold text-success-400">{completedTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">Pending</p>
                <p className="mt-1 text-2xl font-bold text-warning-400">{pendingTasks}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">Progress</p>
                <p className="mt-1 text-2xl font-bold text-primary-400">{completionRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="animate-fade-in-up">
          <TaskList tasks={tasks} />
        </div>
      </main>
    </div>
  );
}
