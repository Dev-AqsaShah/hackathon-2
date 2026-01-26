/**
 * Dashboard page (protected route).
 */

'use client';

import { useSession } from '@/lib/auth-client';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Loading } from '@/components/ui/Loading';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Loading size="lg" message="Loading your dashboard..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            {session?.user && (
              <p className="text-gray-600 mt-1">
                Welcome, {session.user.email}
              </p>
            )}
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Todos</CardTitle>
              <CardDescription>Manage your tasks and stay organized</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Todo list will be implemented in the next phase.</p>
              <a
                href="/todos"
                className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                Go to Todos →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{session?.user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="text-sm text-gray-900">{session?.user?.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
