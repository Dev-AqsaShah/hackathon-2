/**
 * Home page - redirects to login or chat based on auth status.
 * Phase III: AI Chatbot is the primary interface.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user) {
      // Phase III: Chat is the primary interface
      redirect('/chat');
    } else {
      redirect('/login');
    }
  } catch (error) {
    // If session check fails, redirect to login
    console.error('Session check failed:', error);
    redirect('/login');
  }
}
