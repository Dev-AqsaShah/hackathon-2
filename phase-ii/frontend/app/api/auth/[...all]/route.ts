/**
 * Better Auth API route handler.
 * Handles all authentication endpoints: /api/auth/*
 *
 * Supported endpoints:
 * - POST /api/auth/sign-up - User registration
 * - POST /api/auth/sign-in - User login
 * - POST /api/auth/sign-out - User logout
 * - GET  /api/auth/session - Get current session
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
