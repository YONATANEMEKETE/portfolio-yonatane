import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from './lib/session';

/**
 * First gate for the private area: every /manage route except the login page
 * must carry the session cookie, otherwise send it to the login page.
 *
 * Presence-only on purpose — Next's docs say Proxy is for optimistic checks,
 * not full session management, and a DB round-trip would run on every single
 * request before rendering. The real verification (SHA-256 → Session row →
 * expiry) happens in the (private) layout, so a forged or stale cookie still
 * ends at `/manage/login`; this layer just stops obvious traffic before any
 * rendering.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The matcher scopes us, but stay correct if called directly.
  if (!pathname.startsWith('/manage')) {
    return NextResponse.next();
  }

  // /manage/login is the way in — redirecting it to itself would loop every
  // visitor, so it always passes through.
  if (pathname === '/manage/login' || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/manage/login', request.url));
}

export const config = {
  matcher: ['/manage/:path*'],
};
