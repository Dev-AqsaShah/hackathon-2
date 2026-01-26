/**
 * Signin Page - User Login
 *
 * Public route: Unauthenticated users can access this page
 * Redirects to /dashboard if user is already authenticated (handled by middleware)
 */

import { SignInForm } from '@/components/SignInForm';

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  );
}
