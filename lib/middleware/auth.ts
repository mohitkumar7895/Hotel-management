import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export type UserRole = 'USER' | 'admin' | 'staff' | 'accountant' | 'manager' | 'superadmin';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Authenticate user from request token
 * Returns user data or error response
 */
export async function authenticateUser(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const token = request.cookies.get('hotel-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(payload.userId).select('-password').lean();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return {
    user: {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    },
  };
}

/**
 * Check if user has superadmin privileges
 */
export function isSuperAdmin(user: AuthenticatedUser): boolean {
  return user.role === 'superadmin' || user.email === 'superadmin@gmail.com';
}

/**
 * Authorize user based on allowed roles
 * Super Admin bypasses all restrictions
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return async (
    request: NextRequest
  ): Promise<{ user: AuthenticatedUser } | NextResponse> => {
    const authResult = await authenticateUser(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Super Admin bypasses all role restrictions
    if (isSuperAdmin(user)) {
      return { user };
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Insufficient permissions.' },
        { status: 403 }
      );
    }

    return { user };
  };
}

/**
 * Helper to check if user can access a resource
 */
export function hasRole(user: AuthenticatedUser, ...roles: UserRole[]): boolean {
  if (isSuperAdmin(user)) return true;
  return roles.includes(user.role);
}

