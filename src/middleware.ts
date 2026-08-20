import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight edge gate. This checks only for the *presence* of a session
 * cookie to avoid an obvious unauthenticated flash on protected routes. Real
 * signature verification and per-record authorization happen server-side in
 * layouts, server actions and route handlers — never trust this alone.
 */
const COOKIE_NAME = "lm_session";

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has(COOKIE_NAME);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    // No login — send visitors to the landing page to create a workspace.
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
