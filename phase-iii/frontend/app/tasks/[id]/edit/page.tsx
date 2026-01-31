/**
 * Task Edit Page
 *
 * Features:
 * - Fetches existing task data
 * - Reuses TaskForm in edit mode
 * - Protected route
 * - Consistent header with dashboard
 */

import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import * as jose from 'jose';
import { auth } from '@/lib/auth';
import { TaskForm } from '@/components/TaskForm';
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
 * Fetch a single task from the backend API.
 */
async function getTask(userId: string, taskId: string, email?: string): Promise<Task | null> {
  try {
    const token = await createToken(userId, email);

    const response = await fetch(`${BACKEND_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch task:', response.status);
      return null;
    }

    const task: Task = await response.json();
    return task;
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return null;
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: PageProps) {
  const { id: taskId } = await params;

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

  // Fetch the task
  const task = await getTask(userId, taskId, email);

  if (!task) {
    notFound();
  }

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
              {/* Back to dashboard */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           text-dark-300 hover:text-dark-100 hover:bg-dark-800
                           transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>

              {/* User avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-medium text-sm">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <TaskForm userId={userId} mode="edit" initialData={task} />
        </div>
      </main>
    </div>
  );
}
