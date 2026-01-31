/**
 * API Route: /api/tasks
 *
 * Proxies task API requests to the backend with JWT authentication.
 * Handles: GET (list tasks), POST (create task)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { auth } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create a JWT token for backend authentication.
 */
async function createToken(userId: string | number, email?: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET || '');

  const token = await new jose.SignJWT({
    sub: String(userId),
    email: email || undefined,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  return token;
}

/**
 * GET /api/tasks - List all tasks for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { detail: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const email = session.user.email;

    const token = await createToken(userId, email);

    const response = await fetch(`${BACKEND_URL}/api/${userId}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { detail: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const email = session.user.email;

    const token = await createToken(userId, email);
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/${userId}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { detail: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
