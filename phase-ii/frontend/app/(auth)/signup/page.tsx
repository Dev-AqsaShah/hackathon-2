/**
 * Signup Page - User Registration
 *
 * Public route: Unauthenticated users can access this page
 * Redirects to /dashboard if user is already authenticated (handled by middleware)
 */

import { SignUpForm } from '@/components/SignUpForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <SignUpForm />
    </div>
  );
}
