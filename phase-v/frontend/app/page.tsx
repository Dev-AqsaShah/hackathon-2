/**
 * Home page - redirects directly to chat (primary interface).
 * Auth bypassed for Phase IV hackathon demo.
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/chat');
}
