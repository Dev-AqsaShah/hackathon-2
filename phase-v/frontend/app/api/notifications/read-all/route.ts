/**
 * PUT /api/notifications/read-all — mark all notifications as read.
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

export async function PUT(request: NextRequest) {
  const userId = DEFAULT_USER_ID;
  try {
    const token = await createToken(userId);
    await fetch(`${BACKEND_URL}/api/${userId}/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
