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
  // Allow dashboard, my-bookings, and user through - let the page handle auth check
  // This prevents timing issues with cookie setting
  if (!isPublicRoute && (path.startsWith('/dashboard') || path.startsWith('/my-bookings') || path.startsWith('/user'))) {
    // Only block if absolutely no token exists
    // If token exists but invalid, let page handle it
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Basic role-based route protection
    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload) {
          const userRole = payload.role?.toUpperCase();
          const userEmail = payload.email;
          
          // If USER tries to access ANY dashboard route, redirect to my-bookings FIRST
          if (path.startsWith('/dashboard') && (userRole === 'USER' || userRole === undefined || !userRole)) {
            return NextResponse.redirect(new URL('/my-bookings', request.url));
          }
          
          // Protect /my-bookings - only USER role can access
          if (path.startsWith('/my-bookings')) {
            if (userRole && userRole !== 'USER') {
              // Redirect staff roles to their dashboard
              if (userRole === 'superadmin' || userEmail === 'superadmin@gmail.com') {
                return NextResponse.redirect(new URL('/dashboard/super-admin', request.url));
              } else if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/dashboard/admin', request.url));
              } else if (userRole === 'manager') {
                return NextResponse.redirect(new URL('/dashboard/manager', request.url));
              } else if (userRole === 'accountant') {
                return NextResponse.redirect(new URL('/dashboard/accountant', request.url));
              } else if (userRole === 'staff') {
                return NextResponse.redirect(new URL('/dashboard/staff', request.url));
              } else {
                return NextResponse.redirect(new URL('/dashboard', request.url));
              }
            }
          }
          
          // Protect /users - only superadmin can access
          if (path.startsWith('/users')) {
            if (userRole !== 'superadmin' && userEmail !== 'superadmin@gmail.com') {
              // Redirect non-superadmin to their dashboard
              if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/dashboard/admin', request.url));
              } else if (userRole === 'manager') {
                return NextResponse.redirect(new URL('/dashboard/manager', request.url));
              } else if (userRole === 'accountant') {
                return NextResponse.redirect(new URL('/dashboard/accountant', request.url));
              } else if (userRole === 'staff') {
                return NextResponse.redirect(new URL('/dashboard/staff', request.url));
              } else if (userRole === 'USER') {
                return NextResponse.redirect(new URL('/my-bookings', request.url));
              } else {
                return NextResponse.redirect(new URL('/dashboard', request.url));
              }
            }
          }
          
          // Protect role-specific dashboard routes
          if (path.startsWith('/dashboard/super-admin')) {
            if (userRole !== 'superadmin' && userEmail !== 'superadmin@gmail.com') {
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          } else if (path.startsWith('/dashboard/admin')) {
            if (userRole !== 'admin' && userRole !== 'superadmin' && userEmail !== 'superadmin@gmail.com') {
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          } else if (path.startsWith('/dashboard/manager')) {
            if (!['manager', 'admin', 'superadmin'].includes(userRole) && userEmail !== 'superadmin@gmail.com') {
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          } else if (path.startsWith('/dashboard/accountant')) {
            if (!['accountant', 'admin', 'superadmin'].includes(userRole) && userEmail !== 'superadmin@gmail.com') {
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          } else if (path.startsWith('/dashboard/staff')) {
            if (!['staff', 'manager', 'admin', 'superadmin'].includes(userRole) && userEmail !== 'superadmin@gmail.com') {
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          }
          
          // Protect /user - only USER role can access
          if (path.startsWith('/user')) {
            if (userRole !== 'USER') {
              // Redirect staff roles to their dashboard
              if (userRole === 'superadmin' || userEmail === 'superadmin@gmail.com') {
                return NextResponse.redirect(new URL('/dashboard/super-admin', request.url));
              } else if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/dashboard/admin', request.url));
              } else if (userRole === 'manager') {
                return NextResponse.redirect(new URL('/dashboard/manager', request.url));
              } else if (userRole === 'accountant') {
                return NextResponse.redirect(new URL('/dashboard/accountant', request.url));
              } else if (userRole === 'staff') {
                return NextResponse.redirect(new URL('/dashboard/staff', request.url));
              } else {
                return NextResponse.redirect(new URL('/dashboard', request.url));
              }
            }
          }
        }
      } catch (error) {
        // Invalid token, let page handle it
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/my-bookings/:path*',
    '/user/:path*',
    '/users/:path*',
    '/login',
    '/register',
    '/(public)/:path*',
  ],
};
