/**
 * Next.js 16 proxy - auth bypassed for Phase IV hackathon demo.
 * All routes are accessible without authentication.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
