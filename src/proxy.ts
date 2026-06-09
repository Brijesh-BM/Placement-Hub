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
  '/saved',
  '/onboarding',
  '/analysis',
  '/baseline-info',
  '/placement-snapshot',
];

// Auth-only pages (login, signup)
const AUTH_ROUTES = ['/login', '/signup'];

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

async function verifyJwtSignature(token: string, secretStr: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [header, payload, signature] = parts;
    const dataToVerify = `${header}.${payload}`;

    // Convert secret to CryptoKey
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretStr);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode base64url signature to ArrayBuffer
    let sigBase64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    while (sigBase64.length % 4) {
      sigBase64 += '=';
    }
    const sigBinary = atob(sigBase64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    // Verify
    const dataBytes = encoder.encode(dataToVerify);
    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      dataBytes
    );
  } catch (e) {
    return false;
  }
}

async function checkTokenValidity(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secretStr = process.env.JWT_SECRET || 'your-super-secret-jwt-key-rotate-in-production';
  
  // 1. Verify signature
  const signatureOk = await verifyJwtSignature(token, secretStr);
  if (!signatureOk) return false;

  // 2. Decode and check expiration
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return false;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp >= now;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isTokenValid = await checkTokenValidity(token);

  console.log(`[Proxy] Path: ${pathname} | Token present: ${!!token} | Valid: ${isTokenValid}`);

  // 1. Redirect root to /dashboard if logged in
  if (pathname === '/') {
    if (isTokenValid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 2. Check if the path is protected
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !isTokenValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete(COOKIE_NAME);
    }
    return response;
  }

  // 3. Role-Based Access Control (RBAC) if logged in
  if (isTokenValid && token) {
    const payload = decodeJwt(token);
    if (payload && payload.role) {
      const role = payload.role;

      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        console.log(`[Proxy] Unauthorized role ${role} accessed /admin. Redirecting to /unauthorized`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (pathname.startsWith('/recruiter') && role !== 'RECRUITER') {
        console.log(`[Proxy] Unauthorized role ${role} accessed /recruiter. Redirecting to /unauthorized`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (pathname.startsWith('/college-admin') && role !== 'COLLEGE_ADMIN') {
        console.log(`[Proxy] Unauthorized role ${role} accessed /college-admin. Redirecting to /unauthorized`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // 4. Redirect authenticated users away from login/signup to dashboard
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  if (isAuthRoute && isTokenValid) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
