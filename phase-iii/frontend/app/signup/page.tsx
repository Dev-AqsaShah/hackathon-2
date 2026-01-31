/**
 * Premium Signup Page
 *
 * Features:
 * - Dark theme with gradient background
 * - Glass morphism card
 * - Animated logo
 * - Professional design
 */

import { SignupForm } from '@/components/auth/SignupForm';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up | TaskFlow',
  description: 'Create your TaskFlow account',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-3xl font-bold gradient-text">TaskFlow</span>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-dark-100">Create your account</h1>
          <p className="mt-2 text-dark-400">Start organizing your tasks today</p>
        </div>

        {/* Signup Form Card */}
        <div className="glass-card p-8">
          <SignupForm />
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-dark-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
    </div>
  );
}
