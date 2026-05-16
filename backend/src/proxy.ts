import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/supabase';

/**
 * Routes that do NOT require authentication.
 * All other /api/* routes are protected.
 */
const PUBLIC_ROUTES = new Set([
  '/api/auth/signup',
  '/api/auth/signin',
]);

const PUBLIC_GET_ROUTES = new Set([
  '/api/demands',
  '/api/harvests',
]);

// In Next.js 16 "middleware" is renamed to "proxy".
// Export as `proxy` (named) or as default — both are supported.
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Allow preflight CORS requests to pass through
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  // Skip auth check for public routes
  if (PUBLIC_ROUTES.has(pathname) || (request.method === 'GET' && PUBLIC_GET_ROUTES.has(pathname))) {
    return NextResponse.next();
  }

  // Extract Bearer token from Authorization header
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized — Bearer token required.' },
      { status: 401 }
    );
  }

  // Verify token with Supabase
  const user = await verifyToken(accessToken);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized — invalid or expired token.' },
      { status: 401 }
    );
  }

  // Forward user identity to route handlers via custom headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-email', user.email ?? '');

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Only run on /api/* routes; skip static assets and _next internals
  matcher: ['/api/:path*'],
};
