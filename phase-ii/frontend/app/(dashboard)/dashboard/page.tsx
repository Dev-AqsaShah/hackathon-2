/**
 * Dashboard Page - Task List Display
 *
 * Fetches and displays user's tasks
 * Server Component for optimal performance
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TaskList } from '@/components/TaskList';
import { Task } from '@/types/task';

async function getTasks(userId: number): Promise<Task[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Get session to extract JWT token
    const session = await auth.api.getSession();
    if (!session?.session?.token) {
      throw new Error('No auth token available');
    }

    const response = await fetch(`${API_URL}/api/${userId}/tasks`, {
      headers: {
        'Authorization': `Bearer ${(session.session as any).token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (response.status === 401) {
      // Token expired or invalid
      redirect('/signin');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const tasks: Task[] = await response.json();

    // Sort by created_at (newest first)
    return tasks.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    // Return empty array on error (error state will be handled in US2 refinement)
    return [];
  }
}

export default async function DashboardPage() {
  // Get authenticated session
  const session = await auth.api.getSession();

  if (!session?.user) {
    redirect('/signin');
  }

  // Fetch user's tasks
  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
  const tasks = await getTasks(userId);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {session.user.email}
        </p>
      </div>

      {/* Task List */}
      <TaskList tasks={tasks} />
    </div>
  );
}
