/**
 * API Route: /api/notifications
 *
 * Proxies notification requests to the backend.
 * GET  - list notifications (with unread_count)
 * PUT  - mark all read (/api/notifications/read-all)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEFAULT_USER_ID = 'default-user';
const DEFAULT_EMAIL = 'demo@taskflow.app';

async function createToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.BETTER_AUTH_SECRET || 'demo-secret-for-hackathon-phase-iv-min32'
  );
  return new jose.SignJWT({ sub: userId, email: DEFAULT_EMAIL })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function GET(request: NextRequest) {
  const userId = DEFAULT_USER_ID;
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ?? '20';
  const unread = searchParams.get('unread');

  try {
    const token = await createToken(userId);
    const params = new URLSearchParams({ limit });
    if (unread) params.set('unread', unread);

    const res = await fetch(
      `${BACKEND_URL}/api/${userId}/notifications?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json({ items: [], unread_count: 0 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ items: [], unread_count: 0 });
  }
}
