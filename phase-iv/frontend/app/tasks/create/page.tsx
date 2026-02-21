/**
 * Premium Task Creation Page
 *
 * Auth bypassed for Phase IV hackathon demo.
 */

import { TaskForm } from '@/components/TaskForm';
import Link from 'next/link';

// Default demo user (auth bypassed)
const DEFAULT_USER_ID = 'default-user';
const DEFAULT_NAME = 'Demo User';

export default function CreateTaskPage() {
  const userId = DEFAULT_USER_ID;
  const name = DEFAULT_NAME;

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
          <TaskForm userId={userId} mode="create" />
        </div>
      </main>
    </div>
  );
}
