/**
 * Authentication provider component.
 * Wraps the app to provide authentication context to all components.
 */

'use client';

import { useSession } from '@/lib/auth-client';
import { Loading } from '@/components/ui/Loading';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}

/**
 * Hook to access current session data from any component.
 * Re-exports the useSession hook from auth-client for convenience.
 */
export { useSession };
