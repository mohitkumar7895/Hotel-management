import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Guest from '@/lib/models/Guest';
import { verifyPassword } from '@/lib/auth';
import { signJwt } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is a public registered user (exists in Guest table)
    // Public users are those who registered themselves, not created by superadmin
    const guestExists = await Guest.findOne({ email: user.email.toLowerCase() });
    const isPublicUser = !!guestExists && (user.role === 'staff' || !user.role);

    // Generate JWT token
    const token = signJwt({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token: token, // Also return token in response
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isPublicUser: isPublicUser, // Flag to identify public registered users
        },
      },
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set('hotel-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}

