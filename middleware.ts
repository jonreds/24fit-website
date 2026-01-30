import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware is now minimal - maintenance mode is handled by Nginx
// This middleware only handles Daily Pass disabled check via rewrite

export async function middleware(request: NextRequest) {
  // Allow all requests to pass through
  // Maintenance mode is handled by Nginx checking .maintenance file
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
