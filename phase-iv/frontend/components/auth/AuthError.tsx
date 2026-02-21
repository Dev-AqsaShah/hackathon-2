/**
 * Authentication error display component.
 */

'use client';

import { formatAuthError } from '@/lib/auth-utils';

interface AuthErrorProps {
  error: unknown;
  className?: string;
}

export function AuthError({ error, className = '' }: AuthErrorProps) {
  if (!error) return null;

  const message = formatAuthError(error);

  return (
    <div
      role="alert"
      className={`p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md ${className}`}
    >
      <div className="flex items-start">
        <svg
          className="w-5 h-5 mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
}

/**
 * Authentication success message component.
 */
interface AuthSuccessProps {
  message: string;
  className?: string;
}

export function AuthSuccess({ message, className = '' }: AuthSuccessProps) {
  return (
    <div
      role="status"
      className={`p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md ${className}`}
    >
      <div className="flex items-start">
        <svg
          className="w-5 h-5 mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
}
