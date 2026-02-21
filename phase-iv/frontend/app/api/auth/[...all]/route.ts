/**
 * Better Auth API route handler - disabled for Phase IV hackathon demo.
 * Returns 410 Gone since auth is bypassed.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ detail: "Auth disabled for demo" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ detail: "Auth disabled for demo" }, { status: 410 });
}
