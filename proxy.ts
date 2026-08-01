// proxy.ts - Security headers & route protection (Next.js 16)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/admin', '/waiter', '/chef', '/owner'];
const PUBLIC_ROUTES = ['/login', '/_next', '/api'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Check session cookie on protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const session = request.cookies.get('session');
    if (!session?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.webp|logo-que-bravazo.png|login.png|login.mp4|menú.webp).*)',
  ],
};
