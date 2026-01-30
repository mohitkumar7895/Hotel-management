import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('hotel-token')?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/book'];
  const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/(public)');

  // Allow public homepage - no redirect needed
  if (path === '/') {
    return NextResponse.next();
  }

  // If accessing public route and already logged in, allow access
  if (isPublicRoute && token && path === '/') {
    try {
      const payload = verifyToken(token);
      if (payload) {
        // Allow all authenticated users to access homepage
        return NextResponse.next();
      }
    } catch (error) {
      // Invalid token, allow access to public route
    }
  }

  // Protect dashboard and other private routes
  // Allow dashboard and my-bookings through - let the page handle auth check
  // This prevents timing issues with cookie setting
  if (!isPublicRoute && (path.startsWith('/dashboard') || path.startsWith('/my-bookings'))) {
    // Only block if absolutely no token exists
    // If token exists but invalid, let page handle it
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Don't verify here - let the page verify to avoid timing issues
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/my-bookings/:path*',
    '/login',
    '/register',
    '/(public)/:path*',
  ],
};
