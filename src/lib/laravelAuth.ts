// Laravel-compatible auth wrapper
// Wraps existing auth functions for compatibility with legacy route naming

import { NextRequest } from 'next/server';
import { verifyAdminToken, AuthUser } from '@/lib/auth';

/**
 * Verify Laravel-style JWT token for dashboard authentication
 * This is an alias for verifyAdminToken for compatibility with routes
 * that expect Laravel-style auth
 */
export async function verifyLaravelToken(request: NextRequest): Promise<AuthUser | null> {
  return verifyAdminToken(request);
}

// Re-export AuthUser type for convenience
export type { AuthUser };
