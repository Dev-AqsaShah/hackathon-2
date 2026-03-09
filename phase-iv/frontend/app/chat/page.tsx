/**
 * Chat Page
 *
 * AI-powered todo assistant with natural language interface.
 * Features beautiful animations and dark theme design.
 *
 * Auth bypassed for Phase IV hackathon demo.
 */

import { AnimatedChatContainer } from '@/components/chat/AnimatedChatContainer';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Default demo user (auth bypassed)
const DEFAULT_USER_ID = 'default-user';
const DEFAULT_EMAIL = 'demo@taskflow.app';
const DEFAULT_NAME = 'Demo User';

export default function ChatPage() {
  const userId = DEFAULT_USER_ID;
  const email = DEFAULT_EMAIL;
  const name = DEFAULT_NAME;

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
