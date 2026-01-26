/**
 * Task Creation Page
 *
 * Protected route: Only authenticated users can access
 * Displays TaskForm for creating new tasks
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TaskForm } from '@/components/TaskForm';

export default async function CreateTaskPage() {
  // Check authentication server-side
  const session = await auth.api.getSession();

  if (!session?.user) {
    redirect('/signin');
  }

  // Get user ID
  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <TaskForm userId={userId} mode="create" />
    </div>
  );
}
