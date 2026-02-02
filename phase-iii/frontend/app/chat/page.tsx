/**
 * Chat Page
 *
 * AI-powered todo assistant with natural language interface.
 * Features beautiful animations and dark theme design.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { AnimatedChatContainer } from '@/components/chat/AnimatedChatContainer';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  let session;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error('Session check failed:', error);
    redirect('/login');
  }

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const email = session.user.email;
  const name = session.user.name || email?.split('@')[0] || 'User';

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Navigation Header */}
      <header className="flex-shrink-0 sticky top-0 z-40 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent hidden sm:inline">
                TaskFlow
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-medium"
              >
                AI Chat
              </Link>
            </nav>

            {/* User section */}
            <div className="flex items-center gap-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white">{name}</p>
                  <p className="text-xs text-slate-500">{email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-cyan-500/20">
                  {name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Logout */}
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
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

      {/* Chat Container - takes remaining height */}
      <main className="flex-1 overflow-hidden">
        <AnimatedChatContainer userId={userId} userEmail={email} />
      </main>
    </div>
  );
}
