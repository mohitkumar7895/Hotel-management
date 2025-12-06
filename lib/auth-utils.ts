import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'admin' | 'staff' | 'accountant' | 'manager';
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
      role: user.role as 'admin' | 'staff' | 'accountant' | 'manager',
    },
  };
}

export function checkRole(
  userRole: string,
  allowedRoles: ('admin' | 'staff' | 'accountant' | 'manager')[]
): boolean {
  return allowedRoles.includes(userRole as any);
}

export function canEdit(userRole: string): boolean {
  return ['admin', 'accountant'].includes(userRole);
}

export function canView(userRole: string): boolean {
  return ['admin', 'accountant', 'manager'].includes(userRole);
}

