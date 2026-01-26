/**
 * Login page.
 */

import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Todo App',
  description: 'Sign in to your Todo account',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
          <p className="mt-2 text-gray-600">Welcome back!</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
