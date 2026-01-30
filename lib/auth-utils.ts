import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { UserRole } from '@/lib/middleware/auth';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const token = request.cookies.get('hotel-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(payload.userId).select('-password');
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

export function checkRole(
  userRole: string,
  allowedRoles: UserRole[]
): boolean {
  // Super Admin bypasses all checks
  if (userRole === 'superadmin') return true;
  return allowedRoles.includes(userRole as UserRole);
}

export function canEdit(userRole: string): boolean {
  if (userRole === 'superadmin') return true;
  return ['admin', 'accountant'].includes(userRole);
}

export function canView(userRole: string): boolean {
  if (userRole === 'superadmin') return true;
  return ['admin', 'accountant', 'manager'].includes(userRole);
}



