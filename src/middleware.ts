import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'placementhub_token';

// Paths that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/tests',
  '/test-engine',
  '/results',
  '/company-hub',
  '/roadmaps',
  '/practice',
  '/notes',
  '/interview-experiences',
  '/admin',
  '/recruiter',
  '/college-admin',
  '/pyq',
  '/search',
];

// Auth-only pages (login, signup)
const AUTH_ROUTES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 1. Redirect root to /dashboard if logged in
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Logged-out users can view the landing page at /
  }

  // 2. Check if the path is protected
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !token) {
    // Redirect to login, remembering the origin destination
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirect authenticated users away from login/signup to dashboard
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
