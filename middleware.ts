import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('hotel-token')?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(path);

  // Redirect root to dashboard or login
  if (path === '/') {
    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Invalid token, redirect to login
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing public route and already logged in, redirect to dashboard
  if (isPublicRoute && token) {
    try {
      const payload = verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Invalid token, allow access to public route
    }
  }

  // Protect dashboard and other private routes
  // Allow dashboard through - let the page handle auth check
  // This prevents timing issues with cookie setting
  if (!isPublicRoute && path.startsWith('/dashboard')) {
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
    '/login',
    '/register',
  ],
};
