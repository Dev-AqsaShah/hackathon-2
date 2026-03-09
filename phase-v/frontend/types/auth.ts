// types/auth.ts
// Authentication and user session types

/**
 * Authenticated user session (managed by Better Auth)
 * Provided by Better Auth after successful signin
 * Frontend extracts token and attaches to all backend API requests
 */
export interface UserSession {
  user: {
    /** Unique user identifier */
    id: number;

    /** User's email address */
    email: string;
  };

  /** JWT token for backend API authentication */
  token: string;

  /** Session expiration timestamp (ISO 8601) */
  expiresAt: string;
}

/**
 * User signup input
 * Used in signup form
 */
export interface SignupInput {
  /** User's email address */
  email: string;

  /** User's password (minimum 8 characters) */
  password: string;
}

/**
 * User signin input
 * Used in signin form
 */
export interface SigninInput {
  /** User's email address */
  email: string;

  /** User's password */
  password: string;
}
